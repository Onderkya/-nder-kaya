/**
 * Cloudflare Turnstile sunucu doğrulaması (spam/bot koruması).
 *
 * Graceful: TURNSTILE_SECRET_KEY tanımlı değilse captcha devre dışıdır ve
 * `true` döner — böylece anahtar girilmeden de formlar çalışır (honeypot +
 * rate-limit korumayı sürdürür). Anahtar tanımlıysa fail-closed davranır:
 * eksik/geçersiz token veya ağ hatasında `false`.
 */
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token?: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // captcha yapılandırılmamış → izin ver
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false; // anahtar varsa ağ hatasında spam'ı geçirme
  }
}
