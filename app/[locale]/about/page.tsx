import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { CinematicHero } from "@/components/cinematic-hero";
import { Reveal } from "@/components/reveal";
import { IconArrow } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const x = await getTranslations("imm");
  const c = await getTranslations("common");

  const stories = [
    { title: x("ab_story1Title"), text: x("ab_story1Text"), img: "/images/harbor-night.jpg", place: "Yat Limanı" },
    { title: x("ab_story2Title"), text: x("ab_story2Text"), img: "/images/aspendos.jpg", place: "Aspendos" },
  ];

  const values = [
    { n: "I", title: x("ab_v1Title"), text: x("ab_v1Text") },
    { n: "II", title: x("ab_v2Title"), text: x("ab_v2Text") },
    { n: "III", title: x("ab_v3Title"), text: x("ab_v3Text") },
  ];

  return (
    <>
      <CinematicHero eyebrow={x("ab_eyebrow")} title={t("title")} image="/images/kaleici.jpg" />

      {/* Manifesto */}
      <section className="container-wide py-24 sm:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-display text-balance leading-snug" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)", color: "rgb(var(--foreground))" }}>
            {t("body")}
          </p>
        </Reveal>
      </section>

      {/* İki hikaye — editoryal */}
      <section className="py-4 sm:py-8">
        <div className="container-wide space-y-20 sm:space-y-28">
          {stories.map((s, i) => (
            <Reveal key={s.title}>
              <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <figure className={`img-zoom relative aspect-[16/11] overflow-hidden rounded-[2rem] shadow-xl ${i % 2 ? "lg:order-2" : ""}`}>
                  <Image src={s.img} alt={s.title} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                  <div className="img-scrim-soft absolute inset-0" />
                  <span className="tracking-widest2 absolute bottom-6 left-7 text-[10px] uppercase text-white/75">{s.place}</span>
                </figure>
                <div className={i % 2 ? "lg:order-1" : ""}>
                  <span className="serif-italic text-2xl" style={{ color: "rgb(var(--gold))" }}>{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="font-display mt-3 font-semibold leading-tight" style={{ color: "rgb(var(--foreground))", fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>{s.title}</h2>
                  <p className="mt-5 max-w-md text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{s.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Değerler — koyu deniz bandı */}
      <section className="relative mt-24 overflow-hidden py-24 text-white sm:py-28" style={{ backgroundColor: "#07212b" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="h-section">{x("ab_valuesTitle")}</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="border-t pt-7" style={{ borderColor: "rgb(255 255 255 / 0.14)" }}>
                  <span className="serif-italic text-3xl leading-none" style={{ color: "rgb(var(--gold))" }}>{v.n}</span>
                  <h3 className="font-display mt-4 text-2xl font-semibold">{v.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/75">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href="/contact" className="btn-accent">{c("contactUs")} <IconArrow /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
