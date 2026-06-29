import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Cormorant_Garamond, Onest } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingContact } from "@/components/floating-contact";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getPublicSettings } from "@/lib/settings";

// Editoryal Akdeniz tipografisi: yüksek kontrastlı zarif serif (başlıklar) +
// karakterli modern grotesk (gövde). İkisi de latin-ext (Türkçe) + Kiril (ru/kk)
// destekler — beş dilde tutarlı görünür.
const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const sans = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// İçerik admin panelden DB üzerinden düzenlenebildiği için public sayfalar
// dinamik render edilir (override'lar yeniden derleme gerektirmeden yansır).
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const { url } = await getPublicSettings();
  const ogImage = { url: "/og/antalya-bridge.jpg", width: 1200, height: 630, alt: t("siteName") };
  const ogLocaleMap: Record<string, string> = { tr: "tr_TR", en: "en_US", ru: "ru_RU", kk: "kk_KZ", uz: "uz_UZ" };
  return {
    metadataBase: new URL(url),
    title: { default: `${t("siteName")} — ${t("tagline")}`, template: `%s · ${t("siteName")}` },
    description: t("description"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
        "x-default": `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      title: `${t("siteName")} — ${t("tagline")}`,
      description: t("description"),
      type: "website",
      url: `/${locale}`,
      siteName: t("siteName"),
      locale: ogLocaleMap[locale] ?? "tr_TR",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${t("siteName")} — ${t("tagline")}`,
      description: t("description"),
      images: [ogImage.url],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);
  const site = await getPublicSettings();

  return (
    <html lang={locale} suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <ThemeScript />
        {/* Public iletişim/site değerlerini client'a runtime enjekte et (admin'den; rebuild gerekmez). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__SITE__=${JSON.stringify({
              whatsapp: site.whatsapp,
              telegram: site.telegram,
              whatsappConfigured: site.whatsappConfigured,
              telegramConfigured: site.telegramConfigured,
              email: site.email,
              url: site.url,
            })}`,
          }}
        />
      </head>
      <body className="grain min-h-screen font-sans antialiased">
        <NextIntlClientProvider>
          <ThemeProvider>
            <SmoothScroll />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter site={site} />
            <FloatingContact locale={locale} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
