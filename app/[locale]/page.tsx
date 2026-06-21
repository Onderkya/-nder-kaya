import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { WaveDivider } from "@/components/wave";
import { LogoMark } from "@/components/logo";
import { IconBeach, IconBook, IconCap, IconPin, IconTarget, IconChat, IconArrow } from "@/components/icons";
import { siteConfig } from "@/lib/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const s = await getTranslations("services");
  const c = await getTranslations("common");
  const meta = await getTranslations("meta");

  const services = [
    { href: "/antalya", title: s("antalyaTitle"), desc: s("antalyaDesc"), Icon: IconBeach },
    { href: "/lessons", title: s("lessonsTitle"), desc: s("lessonsDesc"), Icon: IconBook },
    { href: "/education", title: s("educationTitle"), desc: s("educationDesc"), Icon: IconCap },
  ];

  const reasons = [
    { title: t("why1Title"), text: t("why1Text"), Icon: IconPin },
    { title: t("why2Title"), text: t("why2Text"), Icon: IconTarget },
    { title: t("why3Title"), text: t("why3Text"), Icon: IconChat },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: meta("siteName"),
          description: meta("description"),
          url: siteConfig.url,
          areaServed: "Antalya, Türkiye",
          email: siteConfig.email,
        }}
      />

      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="container-page relative z-10 py-20 sm:py-28">
          <div className="max-w-3xl animate-fade-up">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide">
              <LogoMark className="h-4 w-4" /> Antalya · Türkçe · Eğitim
            </span>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85">{t("heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-accent shadow-lg shadow-orange-900/20">
                {t("heroCtaPrimary")} <IconArrow />
              </Link>
              <Link
                href="/antalya"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("heroCtaSecondary")}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/75">
              <span className="flex items-center gap-2"><span className="text-base">🇹🇷🇬🇧🇷🇺🇰🇿🇺🇿</span> 5 dil</span>
              <span>•</span>
              <span>Antalya merkezli</span>
              <span>•</span>
              <span>Kişisel & dürüst rehberlik</span>
            </div>
          </div>
        </div>
        <WaveDivider />
      </section>

      {/* Services */}
      <section className="container-page py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("servicesTitle")}</h2>
          <p className="mt-3 text-lg" style={{ color: "rgb(var(--muted-foreground))" }}>
            {t("servicesSubtitle")}
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((srv) => (
            <Link
              key={srv.href}
              href={srv.href}
              className="card group relative overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110"
                style={{ backgroundColor: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}
              >
                <srv.Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{srv.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                {srv.desc}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>
                {c("learnMore")}
                <span className="transition group-hover:translate-x-1"><IconArrow /></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="surface-muted relative">
        <WaveDivider fill="rgb(var(--muted))" flip />
        <div className="container-page py-16 sm:py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "rgb(var(--foreground))" }}>
            {t("whyTitle")}
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.title} className="text-center">
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm"
                  style={{ backgroundColor: "rgb(var(--card))", color: "rgb(var(--accent))" }}
                >
                  <r.Icon className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-lg font-semibold" style={{ color: "rgb(var(--foreground))" }}>
                  {r.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
        <WaveDivider fill="rgb(var(--background))" />
      </section>

      {/* CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="hero-gradient relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white">
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight">{t("ctaTitle")}</h2>
            <p className="mt-3 text-white/85">{t("ctaText")}</p>
            <Link href="/contact" className="btn-accent mt-7 shadow-lg shadow-orange-900/20">
              {t("heroCtaPrimary")} <IconArrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
