import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { CinematicHero } from "@/components/cinematic-hero";
import { StudyJourney } from "@/components/study-journey";
import { TrustStrip } from "@/components/trust-strip";
import { MobilePlanCta } from "@/components/mobile-plan-cta";
import { IconArrow } from "@/components/icons";
import { siteConfig, whatsappLink } from "@/lib/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "education" });
  return { title: t("title"), description: t("intro") };
}

export default async function EducationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("education");
  const x = await getTranslations("imm");
  const sh = await getTranslations("studyHome");
  const tr = await getTranslations("trust");
  const cv = await getTranslations("convert");

  const deliverables = [sh("f1"), sh("f2"), sh("f3"), sh("f4")];

  // Uzaktan/havadan kampüs gelince otomatik devreye girer; yoksa mevcut kampüs fotosu.
  const campus = existsSync(path.join(process.cwd(), "public", "images", "akdeniz-campus-wide.jpg"))
    ? "/images/akdeniz-campus-wide.jpg"
    : "/images/akdeniz-campus.jpg";

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", serviceType: "Education consulting", name: t("title"), description: t("intro"), areaServed: "Türkiye" }} />

      <CinematicHero
        eyebrow={x("edu_journeyEyebrow")}
        title={t("title")}
        intro={t("intro")}
        image="/images/turkish-flag-sky.jpg"
        emblem
      />

      {/* Immersive iniş: 4 adım */}
      <StudyJourney
        eyebrow={x("edu_journeyEyebrow")}
        steps={[
          { n: "01", title: x("edu_s1Title"), place: x("edu_s1Place"), text: x("edu_s1Text"), img: campus, video: "/media/campus-aerial.mp4", points: [x("edu_s1a"), x("edu_s1b")] },
          { n: "02", title: x("edu_s2Title"), place: x("edu_s2Place"), text: x("edu_s2Text"), img: "/images/campus.jpg", video: "/media/office-consult.mp4", points: [x("edu_s2a"), x("edu_s2b")] },
          { n: "03", title: x("edu_s3Title"), place: x("edu_s3Place"), text: x("edu_s3Text"), img: "/images/kaleici-inside.jpg", video: "/media/edu-street.mp4", points: [x("edu_s3a"), x("edu_s3b")] },
          { n: "04", title: x("edu_s4Title"), place: x("edu_s4Place"), text: x("edu_s4Text"), img: "/images/dorm.jpg", points: [x("edu_s4a"), x("edu_s4b")] },
        ]}
      />

      {/* Bunu biz de yaşadık — güven bandı */}
      <section className="relative overflow-hidden py-20 text-white sm:py-24" style={{ background: "linear-gradient(135deg, #0d94a8 0%, #0e7490 50%, #07303d 130%)" }}>
        <span className="sheen" />
        <div className="container-wide relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">★ {x("lived_badge")}</span>
            <h2 className="h-section mt-6 text-balance">{x("lived_title")}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">{x("lived_text")}</p>
            <Link href="/contact" className="btn-accent mt-8 shadow-xl shadow-black/25">{x("lived_cta")} <IconArrow /></Link>
          </Reveal>
        </div>
      </section>

      {/* Senin için neyi hallediyoruz — somut teslimatlar */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--background))" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{sh("eyebrow")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{cv("eduDeliverTitle")}</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{cv("eduDeliverText")}</p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {deliverables.map((d, i) => (
              <Reveal key={d} delay={i * 80}>
                <div className="flex items-center gap-4 rounded-2xl border p-5" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-lg font-bold" style={{ backgroundColor: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[15px] font-semibold leading-snug" style={{ color: "rgb(var(--foreground))" }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Dürüst aciliyet */}
          <Reveal delay={120} className="mt-10">
            <p className="mx-auto flex max-w-2xl items-center justify-center gap-2.5 rounded-full border px-5 py-3 text-center text-[14px] font-semibold" style={{ borderColor: "rgb(var(--gold) / 0.5)", backgroundColor: "rgb(var(--gold) / 0.08)", color: "rgb(var(--foreground))" }}>
              <span aria-hidden>⏳</span>{cv("eduUrgency")}
            </p>
          </Reveal>

          <div className="mt-14">
            <TrustStrip points={[tr("p5"), tr("p1"), tr("p4")]} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide pb-24">
        <Reveal className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white">
          <Image src={campus} alt="Akdeniz Üniversitesi kampüsü, Antalya" fill sizes="(max-width:1280px) 100vw, 1200px" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(4 18 24 / 0.55), rgb(4 18 24 / 0.82))" }} />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="h-section text-balance">{t("title")}</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/85">{t("intro")}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="btn-accent shadow-xl shadow-black/30">{cv("eduCta")} <IconArrow /></Link>
              {siteConfig.whatsappConfigured ? (
                <a href={whatsappLink()} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  {cv("whatsapp")}
                </a>
              ) : null}
            </div>
          </div>
        </Reveal>
      </section>

      <MobilePlanCta href={`/${locale}/contact`} label={cv("eduCta")} />
    </>
  );
}
