/**
 * Site geneli yapılandırma. Bu değerler ortam değişkenlerinden okunur;
 * ileride admin panelden DB'ye taşınabilir (Settings modeli).
 */
export const siteConfig = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "905555555555",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM ?? "antalyabridge",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "onderkya35@gmail.com",
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE ?? "",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://antalyabridge.com",
  // Cloudflare Turnstile public site key. Boşsa captcha devre dışıdır
  // (formlar honeypot + rate-limit ile korunmaya devam eder).
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${siteConfig.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telegramLink() {
  return `https://t.me/${siteConfig.telegram}`;
}
