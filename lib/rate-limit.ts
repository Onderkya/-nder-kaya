/**
 * Basit, bağımlılıksız bellek-içi hız sınırlayıcı (tek-instance VPS için uygun).
 * Kayan pencere: anahtar başına son `windowMs` içinde en fazla `max` istek.
 *
 * Not: Çok-instance/yatay ölçeklemede Redis tabanlı bir limiter'a geçilmeli.
 */
type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfter: number } {
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
