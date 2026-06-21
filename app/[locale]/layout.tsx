import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingContact } from "@/components/floating-contact";
import { siteConfig } from "@/lib/config";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-sans" });

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
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen font-sans">
        <NextIntlClientProvider>
          <ThemeProvider>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
            <FloatingContact />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
