/**
 * Hız sınırlayıcı. Varsayılan: bağımlılıksız bellek-içi kayan/sabit pencere
 * (tek-instance VPS için yeterli). Opsiyonel: Upstash Redis REST yapılandırıldıysa
 * (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN) sayaç Redis'te tutulur;
 * böylece çok-instance / yatay ölçeklemede limit ortak olur. Redis hatasında
 * sessizce bellek-içi limitere düşülür (fail-soft).
 */
type Result = { ok: boolean; retryAfter: number };
type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

function memoryLimit(key: string, max: number, windowMs: number): Result {
  const now = Date.now();
  const e = buckets.get(key);
  if (!e || e.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (e.count >= max) {
    return { ok: false, retryAfter: Math.ceil((e.resetAt - now) / 1000) };
  }
  e.count += 1;
  return { ok: true, retryAfter: 0 };
}

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

/**
 * Upstash REST pipeline ile sabit pencere sayacı: INCR + ilk istekte PEXPIRE(NX).
 * count, pencere içindeki istek sayısıdır; PTTL kalan süreyi verir.
 */
async function redisLimit(
  cfg: { url: string; token: string },
  key: string,
  max: number,
  windowMs: number,
): Promise<Result> {
  const res = await fetch(`${cfg.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, String(windowMs), "NX"],
      ["PTTL", key],
    ]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const data = (await res.json()) as Array<{ result: number }>;
  const count = Number(data[0]?.result ?? 0);
  const ttlMs = Number(data[2]?.result ?? windowMs);
  if (count > max) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil(ttlMs / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

export async function rateLimit(key: string, max: number, windowMs: number): Promise<Result> {
  const cfg = redisConfig();
  if (cfg) {
    try {
      return await redisLimit(cfg, key, max, windowMs);
    } catch {
      // Redis erişilemezse bellek-içi limitere düş (fail-soft).
      return memoryLimit(key, max, windowMs);
    }
  }
  return memoryLimit(key, max, windowMs);
}

/** İstekten istemci IP'sini güvenli şekilde çıkarır (proxy arkasında). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Belleği sınırlı tut: süresi geçmiş kovaları ara sıra temizle. */
function sweep() {
  const now = Date.now();
  for (const [k, e] of buckets) if (e.resetAt <= now) buckets.delete(k);
}
setInterval(sweep, 60_000).unref?.();
