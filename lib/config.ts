/**
 * Site geneli yapılandırma. Bu değerler ortam değişkenlerinden okunur;
 * ileride admin panelden DB'ye taşınabilir (Settings modeli).
 */
// Placeholder değerler: env doldurulmamışsa canlıda "ölü" wa.me/t.me linki
// üretmemek için bunları "yapılandırılmamış" sayıp /contact'a düşürüyoruz.
const WA_PLACEHOLDER = "905555555555";
const rawWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP ?? "";
const rawTelegram = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? process.env.NEXT_PUBLIC_TELEGRAM ?? "";

export const siteConfig = {
  whatsapp: rawWhatsapp || WA_PLACEHOLDER,
  telegram: rawTelegram || "antalyabridge",
  // Gerçek numara/kullanıcı adı tanımlı mı? Tanımlı değilse butonlar /contact'a yönlenir.
  whatsappConfigured: rawWhatsapp !== "" && rawWhatsapp !== WA_PLACEHOLDER,
  telegramConfigured: rawTelegram !== "",
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
