import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
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
  const meta = await getTranslations("meta");

  const services = [
    { href: "/antalya", title: s("antalyaTitle"), desc: s("antalyaDesc"), icon: "🏖️" },
    { href: "/lessons", title: s("lessonsTitle"), desc: s("lessonsDesc"), icon: "📚" },
    { href: "/education", title: s("educationTitle"), desc: s("educationDesc"), icon: "🎓" },
  ];

  const reasons = [
    { title: t("why1Title"), text: t("why1Text"), icon: "📍" },
    { title: t("why2Title"), text: t("why2Text"), icon: "🎯" },
    { title: t("why3Title"), text: t("why3Text"), icon: "💬" },
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
        <div className="container-page py-20 sm:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 text-lg text-white/90">{t("heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="btn-accent">
                {t("heroCtaPrimary")}
              </Link>
              <Link
                href="/antalya"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {t("heroCtaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">{t("servicesTitle")}</h2>
          <p className="mt-3" style={{ color: "rgb(var(--muted-foreground))" }}>
            {t("servicesSubtitle")}
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {services.map((srv) => (
            <Link key={srv.href} href={srv.href} className="card group hover:-translate-y-1">
              <div className="text-4xl">{srv.icon}</div>
              <h3 className="mt-4 text-xl font-semibold">{srv.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                {srv.desc}
              </p>
              <span className="mt-4 inline-block text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="surface-muted">
        <div className="container-page py-16">
          <h2 className="text-center text-3xl font-bold" style={{ color: "rgb(var(--foreground))" }}>
            {t("whyTitle")}
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {reasons.map((r) => (
              <div key={r.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: "rgb(var(--card))" }}>
                  {r.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold" style={{ color: "rgb(var(--foreground))" }}>
                  {r.title}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>
                  {r.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="card flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold">{t("ctaTitle")}</h2>
          <p style={{ color: "rgb(var(--muted-foreground))" }}>{t("ctaText")}</p>
          <Link href="/contact" className="btn-primary">
            {t("heroCtaPrimary")}
          </Link>
        </div>
      </section>
    </>
  );
}
