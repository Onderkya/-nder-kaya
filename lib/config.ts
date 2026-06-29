/**
 * Site geneli yapılandırma.
 *
 * İletişim/site değerleri artık admin panelden (DB) **çalışma zamanında**
 * değişebilir — rebuild gerekmez. Akış:
 *  - SUNUCU bileşenleri: `lib/settings.getPublicSettings()` ile DB→env okur.
 *  - CLIENT bileşenleri: sunucu, `window.__SITE__`'a public değerleri enjekte eder
 *    (bkz. app/[locale]/layout.tsx); buradaki getter'lar onu okur, yoksa derleme
 *    anındaki NEXT_PUBLIC env'e düşer.
 * Sırlar (API anahtarları) ASLA client'a/siteConfig'e girmez.
 */
const WA_PLACEHOLDER = "905555555555";
const envWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? process.env.NEXT_PUBLIC_WHATSAPP ?? "";
const envTelegram = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? process.env.NEXT_PUBLIC_TELEGRAM ?? "";
const envEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "onderkya35@gmail.com";
const envUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://antalyabridge.com";

export type PublicSiteRuntime = {
  whatsapp?: string;
  telegram?: string;
  whatsappConfigured?: boolean;
  telegramConfigured?: boolean;
  email?: string;
  url?: string;
};

function rt(): PublicSiteRuntime {
  if (typeof window !== "undefined") {
    const w = (window as unknown as { __SITE__?: PublicSiteRuntime }).__SITE__;
    if (w) return w;
  }
  return {};
}

function waNumber(): string {
  const w = rt().whatsapp;
  return w && w !== "" ? w : envWhatsapp || WA_PLACEHOLDER;
}
function tgName(): string {
  const w = rt().telegram;
  return w && w !== "" ? w : envTelegram || "antalyabridge";
}

export const siteConfig = {
  get whatsapp() {
    return waNumber();
  },
  get telegram() {
    return tgName();
  },
  get whatsappConfigured() {
    const w = rt();
    if (typeof w.whatsappConfigured === "boolean") return w.whatsappConfigured;
    return envWhatsapp !== "" && envWhatsapp !== WA_PLACEHOLDER;
  },
  get telegramConfigured() {
    const w = rt();
    if (typeof w.telegramConfigured === "boolean") return w.telegramConfigured;
    return envTelegram !== "";
  },
  get email() {
    return rt().email || envEmail;
  },
  get url() {
    return rt().url || envUrl;
  },
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM ?? "",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK ?? "",
    youtube: process.env.NEXT_PUBLIC_YOUTUBE ?? "",
  },
  // Cloudflare Turnstile public site key (build-time; captcha boşsa devre dışı).
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
};

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${waNumber()}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telegramLink() {
  return `https://t.me/${tgName()}`;
}
