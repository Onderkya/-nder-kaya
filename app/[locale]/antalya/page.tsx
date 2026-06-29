import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { CinematicHero } from "@/components/cinematic-hero";
import { HorizontalPlaces } from "@/components/horizontal-places";
import { ReadyRoutes } from "@/components/ready-routes";
import { IconArrow } from "@/components/icons";
import { getManagedPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/cms/block-renderer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "antalya" });
  return { title: t("title"), description: t("intro") };
}

export default async function AntalyaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cmsPage = await getManagedPage("antalya", locale);
  if (cmsPage) return <BlockRenderer page={cmsPage} locale={locale} />;
  const t = await getTranslations("antalya");
  const x = await getTranslations("imm");

  const features = [t("feature1"), t("feature2"), t("feature3"), t("feature4")];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", serviceType: "Travel consulting", name: t("title"), description: t("intro"), areaServed: "Antalya, Türkiye" }} />

      <CinematicHero
        eyebrow={x("ant_introEyebrow")}
        title={t("title")}
        intro={t("intro")}
        image="/images/kaputas.jpg"
        videos={["/media/kaputas-drone.mp4", "/media/vid-suluada.mp4", "/media/vid-kemer.mp4", "/media/vid-kas.mp4"]}
      />

      {/* HAZIR ROTALAR — bu sayfanın kalbi: hayalindeki tatil zaten hazır, seç ve al */}
      <ReadyRoutes />

      {/* Editoryal giriş + özellik listesi */}
      <section className="container-wide py-24 sm:py-32">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Reveal>
              <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>{x("ant_introEyebrow")}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-section mt-5 max-w-xl text-balance" style={{ color: "rgb(var(--foreground))" }}>{x("ant_introTitle")}</h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{x("ant_introText")}</p>
            </Reveal>
          </div>
          <div className="lg:col-span-6">
            <ul className="grid gap-4 sm:grid-cols-2">
              {features.map((f, i) => (
                <Reveal as="li" key={f} delay={i * 70} className="card leading-relaxed">
                  <span className="serif-italic text-xl" style={{ color: "rgb(var(--gold))" }}>{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2">{f}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Bölgeler — yatay gezi */}
      <HorizontalPlaces
        eyebrow={x("ant_regionsEyebrow")}
        title={x("ant_regionsTitle")}
        places={[
          { img: "/images/kaputas.jpg", video: "/media/kaputas-drone.mp4", name: "Kaputaş", sub: "Kaş" },
          { img: "/images/suluada.jpg", video: "/media/vid-suluada.mp4", name: "Suluada", sub: "Adrasan" },
          { img: "/images/kemer.jpg", video: "/media/vid-kemer.mp4", name: "Kemer", sub: "Marina" },
          { img: "/images/olympos.jpg", video: "/media/vid-olympos.mp4", name: "Olympos", sub: "Çıralı" },
          { img: "/images/alanya.jpg", video: "/media/vid-alanya-castle.mp4", name: "Alanya", sub: "Kızıl Kule" },
          { img: "/images/beachpark.jpg", name: "Beach Park", sub: "Konyaaltı" },
          { img: "/images/lara.jpg", name: "Lara", sub: "Falezler" },
          { img: "/images/kaleici-harbor.jpg", video: "/media/vid-kaleici.mp4", name: "Kaleiçi", sub: "Yat Limanı" },
          { img: "/images/side.jpg", name: "Side", sub: "Antik kent" },
          { img: "/images/duden.jpg", video: "/media/vid-duden.mp4", name: "Düden", sub: "Şelale" },
        ]}
      />

      {/* CTA */}
      <section className="container-wide pb-24 pt-4">
        <Reveal className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white">
          <Image src="/images/kaputas.jpg" alt="Kaputaş Plajı, Kaş — turkuaz Akdeniz" fill sizes="(max-width:1280px) 100vw, 1200px" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(4 18 24 / 0.35), rgb(4 18 24 / 0.7))" }} />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="h-section text-balance">{x("ant_ctaTitle")}</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/85">{x("ant_ctaText")}</p>
            <Link href="/contact" className="btn-accent mt-9 shadow-xl shadow-black/30">{t("cta")} <IconArrow /></Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
