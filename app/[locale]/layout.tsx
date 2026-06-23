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
import { siteConfig } from "@/lib/config";

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
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: `${t("siteName")} — ${t("tagline")}`, template: `%s · ${t("siteName")}` },
    description: t("description"),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: t("siteName"),
      description: t("description"),
      type: "website",
      locale,
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

  return (
    <html lang={locale} suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="grain min-h-screen font-sans antialiased">
        <NextIntlClientProvider>
          <ThemeProvider>
            <SmoothScroll />
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
            <FloatingContact locale={locale} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
