import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

// Site HTTPS üzerinden mi sunuluyor? (domain + SSL). Düz HTTP dağıtımında
// (örn. henüz domain yokken http://IP:PORT) `upgrade-insecure-requests` ve HSTS
// EKLENMEZ — aksi halde tarayıcı tüm alt kaynakları https'e yükseltmeye çalışıp
// (TLS olmadığından) sayfayı bozar. Domain + SSL eklenip NEXT_PUBLIC_SITE_URL
// https'e çevrilince bu başlıklar otomatik geri gelir (build arg ile okunur).
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

// İçerik Güvenlik Politikası. QR'lar data: URL olarak gömülür (img-src data:),
// inline stiller kullanıldığı için style-src 'unsafe-inline'. Script için dev'de
// HMR/eval gerekir; prod'da 'self' + inline (Next hydration) ile sınırlıdır.
// Cloudflare Turnstile (spam koruması) script/iframe/xhr için izinli kaynak.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://i.ytimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  // Cloudflare Turnstile + Google Maps/Street View gömme (anahtarsız svembed) +
  // YouTube (Land of Legends tanıtım videosu, nocookie). Yalnız BU site bunları
  // gömer; frame-ancestors 'none' korunduğu için siteyi başkası iframe'leyemez.
  "frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com https://www.youtube-nocookie.com https://www.youtube.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isHttps
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Görseller kendi sunucuda (yerel) servis edilir; harici joker kaldırıldı.
    // İleride bir CDN eklenirse burada beyaz listeye alınır.
    remotePatterns: [],
    // Yerel optimizasyon: modern formatlar (otomatik AVIF/WebP dönüşümü).
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
