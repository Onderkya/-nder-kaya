import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { IconArrow, IconCheck } from "@/components/icons";
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
    { href: "/antalya", n: "01", title: s("antalyaTitle"), desc: s("antalyaDesc"), img: "/images/harbor.jpg", place: "Yat Limanı" },
    { href: "/lessons", n: "02", title: s("lessonsTitle"), desc: s("lessonsDesc"), img: "/images/street.jpg", place: "Kaleiçi" },
    { href: "/education", n: "03", title: s("educationTitle"), desc: s("educationDesc"), img: "/images/hadrian.jpg", place: "Hadrianus Kapısı" },
  ];

  const reasons = [
    { n: "I", title: t("why1Title"), text: t("why1Text") },
    { n: "II", title: t("why2Title"), text: t("why2Text") },
    { n: "III", title: t("why3Title"), text: t("why3Text") },
  ];

  const gallery = [
    { img: "/images/kaleici.jpg", place: "Kaleiçi", sub: "Antalya" },
    { img: "/images/beach.jpg", place: "Konyaaltı", sub: "Akdeniz" },
    { img: "/images/duden.jpg", place: "Düden", sub: "Şelale" },
    { img: "/images/yivli.jpg", place: "Yivli Minare", sub: "Selçuklu" },
    { img: "/images/hero-coast.jpg", place: "Falezler", sub: "Antalya" },
    { img: "/images/harbor.jpg", place: "Yat Limanı", sub: "Marina" },
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

      {/* ============ HERO ============ */}
      <section className="relative -mt-16 flex h-[100svh] min-h-[620px] w-full items-end overflow-hidden" style={{ backgroundColor: "#07212b" }}>
        <div className="absolute inset-0">
          <div className="ken-burns absolute inset-0">
            <Image
              src="/images/hero-coast.jpg"
              alt="Antalya — falezlerden Konyaaltı sahili ve Akdeniz"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="img-scrim absolute inset-0" />
        </div>

        <div className="container-wide relative z-10 w-full pb-16 pt-28 sm:pb-24">
          <div className="max-w-4xl text-white">
            <p className="eyebrow animate-fade-up text-white/85">
              {meta("siteName")} — Antalya · Türkiye
            </p>
            <h1 className="h-hero animate-fade-up delay-1 mt-6 text-balance">
              {t("heroTitle")}
            </h1>
            <p className="animate-fade-up delay-2 mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
              {t("heroSubtitle")}
            </p>
            <div className="animate-fade-up delay-3 mt-9 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-accent shadow-xl shadow-black/20">
                {t("heroCtaPrimary")} <IconArrow />
              </Link>
              <Link href="/antalya" className="btn-ghost-light glass">
                {t("heroCtaSecondary")}
              </Link>
            </div>
            <div className="animate-fade-up delay-4 mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="text-lg tracking-wide" aria-hidden>🇹🇷 🇬🇧 🇷🇺 🇰🇿 🇺🇿</span>
              <span className="font-medium tracking-widest2 uppercase text-[11px] text-white/60">TR · EN · RU · KK · UZ</span>
            </div>
          </div>
        </div>

        <div className="scroll-cue absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:block">
          <span className="block h-9 w-[1.5px] bg-white/50" />
        </div>
      </section>

      {/* ============ MANİFESTO ============ */}
      <section className="container-wide py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>
                {meta("siteName")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-section mt-6 max-w-2xl text-balance" style={{ color: "rgb(var(--foreground))" }}>
                {meta("tagline")}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                {meta("description")}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <Link
                href="/about"
                className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "rgb(var(--primary))" }}
              >
                {c("learnMore")} <IconArrow />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal className="reveal-clip" delay={120}>
              <figure className="img-zoom relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="/images/kaleici.jpg"
                  alt="Kaleiçi eski şehir ve Yivli Minare, Antalya"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <figcaption className="img-scrim-soft absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                  <span className="font-display text-2xl leading-none">Kaleiçi</span>
                  <span className="tracking-widest2 text-[10px] uppercase text-white/70">Antalya</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ HİZMETLER ============ */}
      <section className="border-y py-20 sm:py-24" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--muted) / 0.5)" }}>
        <div className="container-wide">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <Reveal>
              <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>{t("servicesSubtitle")}</p>
              <h2 className="h-section mt-5 max-w-xl text-balance" style={{ color: "rgb(var(--foreground))" }}>
                {t("servicesTitle")}
              </h2>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {services.map((srv, i) => (
              <Reveal key={srv.href} delay={i * 110}>
                <Link
                  href={srv.href}
                  className="img-zoom group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-md transition-shadow duration-300 hover:shadow-2xl"
                >
                  <Image
                    src={srv.img}
                    alt={srv.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                  <div className="img-scrim absolute inset-0" />
                  <div className="absolute inset-0 flex flex-col justify-between p-7 text-white">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-4xl leading-none text-white/90">{srv.n}</span>
                      <span className="tracking-widest2 text-[10px] uppercase text-white/60">{srv.place}</span>
                    </div>
                    <div>
                      <h3 className="font-display text-[1.7rem] font-semibold leading-tight">{srv.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-white/80">{srv.desc}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                        {c("learnMore")}
                        <span className="transition-transform duration-300 group-hover:translate-x-1"><IconArrow /></span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NEDEN BİZ (koyu deniz bandı) ============ */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#07212b" }}>
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[340px] lg:min-h-full">
            <Image
              src="/images/duden.jpg"
              alt="Düden Şelalesi'nin Akdeniz'e dökülüşü, Antalya"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 40%, #07212b 100%)" }} />
          </div>

          <div className="px-6 py-20 sm:px-12 lg:px-16 lg:py-28">
            <Reveal>
              <p className="eyebrow text-white/80">{t("whyTitle")}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-section mt-6 max-w-md text-balance">{meta("siteName")}</h2>
            </Reveal>
            <div className="mt-12 space-y-9">
              {reasons.map((r, i) => (
                <Reveal key={r.title} delay={i * 110}>
                  <div className="flex gap-6 border-t pt-7" style={{ borderColor: "rgb(255 255 255 / 0.14)" }}>
                    <span className="serif-italic shrink-0 text-3xl leading-none" style={{ color: "rgb(var(--gold))" }}>{r.n}</span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold leading-snug">{r.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/75">{r.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ GALERİ ŞERİDİ ============ */}
      <section className="overflow-hidden py-20 sm:py-24">
        <div className="container-wide mb-10">
          <Reveal>
            <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>Antalya</p>
            <h2 className="h-section mt-5" style={{ color: "rgb(var(--foreground))" }}>
              <span className="serif-italic">{meta("siteName")}</span>
            </h2>
          </Reveal>
        </div>
        <div className="marquee-mask relative">
          <div className="marquee-track gap-4 px-2">
            {[...gallery, ...gallery].map((g, i) => (
              <figure
                key={i}
                className="img-zoom relative aspect-[3/4] w-[260px] shrink-0 overflow-hidden rounded-2xl sm:w-[320px]"
              >
                <Image
                  src={g.img}
                  alt={`${g.place}, Antalya`}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
                <figcaption className="img-scrim-soft absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
                  <span className="font-display text-xl leading-none">{g.place}</span>
                  <span className="tracking-widest2 text-[9px] uppercase text-white/70">{g.sub}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          {/* kenar yumuşatma */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28" style={{ background: "linear-gradient(90deg, rgb(var(--background)), transparent)" }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28" style={{ background: "linear-gradient(270deg, rgb(var(--background)), transparent)" }} />
        </div>
      </section>

      {/* ============ CTA (şelale) ============ */}
      <section className="container-wide pb-24">
        <Reveal className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white sm:min-h-[480px]">
          <Image
            src="/images/beach.jpg"
            alt="Antalya sahili ve turkuaz Akdeniz"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(4 18 24 / 0.55), rgb(4 18 24 / 0.78))" }} />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="eyebrow justify-center text-white/80">{meta("siteName")}</p>
            <h2 className="h-section mt-6 text-balance">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/85">{t("ctaText")}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn-accent shadow-xl shadow-black/30">
                {t("heroCtaPrimary")} <IconArrow />
              </Link>
              <Link href="/lessons" className="btn-ghost-light glass">
                {c("bookNow")}
              </Link>
            </div>
            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/65">
              <span className="inline-flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5" /> {t("why3Title")}</span>
              <span className="inline-flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5" /> {t("why1Title")}</span>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
