import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { CinematicHero } from "@/components/cinematic-hero";
import { StudyJourney } from "@/components/study-journey";
import { StreetWalk } from "@/components/street-walk";
import { IconArrow } from "@/components/icons";

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

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", serviceType: "Education consulting", name: t("title"), description: t("intro"), areaServed: "Türkiye" }} />

      <CinematicHero eyebrow={x("edu_journeyEyebrow")} title={t("title")} intro={t("intro")} image="/images/akdeniz-campus.jpg" />

      {/* Immersive iniş: 4 adım */}
      <StudyJourney
        eyebrow={x("edu_journeyEyebrow")}
        steps={[
          { n: "01", title: x("edu_s1Title"), place: x("edu_s1Place"), text: x("edu_s1Text"), img: "/images/akdeniz-campus.jpg", points: [x("edu_s1a"), x("edu_s1b")] },
          { n: "02", title: x("edu_s2Title"), place: x("edu_s2Place"), text: x("edu_s2Text"), img: "/images/campus.jpg", points: [x("edu_s2a"), x("edu_s2b")] },
          { n: "03", title: x("edu_s3Title"), place: x("edu_s3Place"), text: x("edu_s3Text"), img: "/images/lara.jpg", points: [x("edu_s3a"), x("edu_s3b")] },
          { n: "04", title: x("edu_s4Title"), place: x("edu_s4Place"), text: x("edu_s4Text"), img: "/images/dorm.jpg", points: [x("edu_s4a"), x("edu_s4b")] },
        ]}
      />

      {/* Street View — kampüste ve şehirde yürü */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--background))" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{x("edu_streetEyebrow")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{x("edu_streetTitle")}</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{x("edu_streetIntro")}</p>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <StreetWalk
              hint={x("ant_streetHint")}
              spots={[
                { id: "campus", label: "Akdeniz Üniversitesi", sub: "Dumlupınar Blv", lat: 36.89610, lng: 30.65380, heading: 75 },
                { id: "konyaalti", label: "Konyaaltı", sub: "Sahil", lat: 36.86430, lng: 30.62830, heading: 240 },
                { id: "lara", label: "Lara", sub: "Sahil yolu", lat: 36.85700, lng: 30.80930, heading: 60 },
                { id: "kaleici", label: "Kaleiçi", sub: "Eski şehir", lat: 36.88454, lng: 30.70565, heading: 120 },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide pb-24">
        <Reveal className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white">
          <Image src="/images/akdeniz-campus.jpg" alt="Akdeniz Üniversitesi kampüsü, Antalya" fill sizes="(max-width:1280px) 100vw, 1200px" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(4 18 24 / 0.55), rgb(4 18 24 / 0.82))" }} />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="h-section text-balance">{t("title")}</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/85">{t("intro")}</p>
            <Link href="/contact" className="btn-accent mt-9 shadow-xl shadow-black/30">{t("cta")} <IconArrow /></Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
