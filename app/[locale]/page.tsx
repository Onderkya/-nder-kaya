import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { DiveHero } from "@/components/dive-hero";
import { ActivitiesDive } from "@/components/activities-dive";
import { HorizontalPlaces } from "@/components/horizontal-places";
import { TurkishAlphabet } from "@/components/turkish-alphabet";
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
    { href: "/antalya", n: "01", title: s("antalyaTitle"), desc: s("antalyaDesc"), img: "/images/harbor-night.jpg", place: "Yat Limanı" },
    { href: "/lessons", n: "02", title: s("lessonsTitle"), desc: s("lessonsDesc"), img: "/images/coffee.jpg", place: "Türk Kahvesi" },
    { href: "/education", n: "03", title: s("educationTitle"), desc: s("educationDesc"), img: "/images/aspendos.jpg", place: "Aspendos" },
  ];

  const reasons = [
    { n: "I", title: t("why1Title"), text: t("why1Text") },
    { n: "II", title: t("why2Title"), text: t("why2Text") },
    { n: "III", title: t("why3Title"), text: t("why3Text") },
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

      {/* ============ HERO — Kaputaş "denize dalış" ============ */}
      <DiveHero
        brand={meta("siteName")}
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        ctaPrimary={t("heroCtaPrimary")}
        ctaSecondary={t("heroCtaSecondary")}
        deepLine={t("diveDeep")}
        scrollCue={t("scrollCue")}
        soundLabel={t("soundWave")}
      />

      {/* ============ AKTİVİTELER — sualtından tatile iniş ============ */}
      <ActivitiesDive
        eyebrow={t("actTitle")}
        scenes={[
          { kind: "video", src: "/media/act-scuba.mp4", title: t("actScuba"), place: "Akdeniz" },
          { kind: "image", src: "/images/harbor.jpg", title: t("actBoat"), place: "Kaleiçi" },
          { kind: "video", src: "/media/act-jetski.mp4", title: t("actSports"), place: "Sahil" },
          { kind: "image", src: "/images/pool.jpg", title: t("actHotels"), place: "Resort" },
        ]}
      />

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

      {/* ============ HİZMETLER (premium editoryal) ============ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "rgb(var(--background))" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{t("servicesSubtitle")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>
              {t("servicesTitle")}
            </h2>
          </Reveal>

          <div className="mt-16 space-y-20 sm:space-y-28">
            {services.map((srv, i) => (
              <Reveal key={srv.href}>
                <Link href={srv.href} className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                  <div className={`img-zoom relative aspect-[16/11] overflow-hidden rounded-[2rem] shadow-xl ${i % 2 ? "lg:order-2" : ""}`}>
                    <Image src={srv.img} alt={srv.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    <div className="img-scrim-soft absolute inset-0" />
                    <span className="absolute left-7 top-6 font-display text-5xl text-white/85">{srv.n}</span>
                    <span className="tracking-widest2 absolute bottom-6 left-7 text-[10px] uppercase text-white/70">{srv.place}</span>
                  </div>
                  <div className={i % 2 ? "lg:order-1" : ""}>
                    <span className="serif-italic text-2xl" style={{ color: "rgb(var(--gold))" }}>{srv.n}</span>
                    <h3 className="font-display mt-3 font-semibold leading-tight" style={{ color: "rgb(var(--foreground))", fontSize: "clamp(1.9rem, 3vw, 2.7rem)" }}>
                      {srv.title}
                    </h3>
                    <p className="mt-5 max-w-md text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                      {srv.desc}
                    </p>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>
                      {c("learnMore")}
                      <span className="transition-transform duration-300 group-hover:translate-x-1"><IconArrow /></span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TÜRKÇE ALFABE ============ */}
      <TurkishAlphabet
        eyebrow="A — Z"
        title={s("lessonsTitle")}
        desc={s("lessonsDesc")}
        cta={c("learnMore")}
      />

      {/* ============ NEDEN BİZ (koyu deniz bandı) ============ */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#07212b" }}>
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[340px] lg:min-h-full">
            <Image
              src="/images/sunset.jpg"
              alt="Kaş'ta Akdeniz gün batımı, Antalya"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 40%, #07212b 100%)" }} />
          </div>

          <div className="px-6 py-20 sm:px-12 lg:px-16 lg:py-28">
            <Reveal>
              <p className="eyebrow text-white/80">{meta("siteName")}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-section mt-6 max-w-md text-balance">{t("whyTitle")}</h2>
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

      {/* ============ GEZİLECEK YERLER (sağa-sola yatay) ============ */}
      <HorizontalPlaces
        eyebrow="Antalya"
        title={t("placesTitle")}
        places={[
          { img: "/images/kaputas.jpg", name: "Kaputaş", sub: "Kaş" },
          { img: "/images/lagoon.jpg", name: "Mavi Lagün", sub: "Ölüdeniz" },
          { img: "/images/sunset.jpg", name: "Kaş", sub: "Gün batımı" },
          { img: "/images/olympos.jpg", name: "Olympos", sub: "Çıralı" },
          { img: "/images/phaselis.jpg", name: "Phaselis", sub: "Kemer" },
          { img: "/images/side.jpg", name: "Side", sub: "Antik kent" },
          { img: "/images/beach.jpg", name: "Konyaaltı", sub: "Akdeniz" },
          { img: "/images/kaleici.jpg", name: "Kaleiçi", sub: "Antalya" },
          { img: "/images/duden.jpg", name: "Düden", sub: "Şelale" },
          { img: "/images/harbor-night.jpg", name: "Yat Limanı", sub: "Kaleiçi" },
        ]}
      />

      {/* ============ CTA (şelale) ============ */}
      <section className="container-wide pb-24">
        <Reveal className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white sm:min-h-[480px]">
          <Image
            src="/images/lagoon.jpg"
            alt="Ölüdeniz Mavi Lagün — turkuaz deniz ve yamaç paraşütü"
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
