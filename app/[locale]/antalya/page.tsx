import { Fragment, type ReactNode } from "react";
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
import { getAssetMap, pickAsset } from "@/lib/assets";
import { resolveGallery } from "@/lib/gallery";
import { getHiddenSections, sectionVisible, getSectionOrders, applySectionOrder } from "@/lib/sections";

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
  const A = await getAssetMap();
  const hidden = await getHiddenSections();
  const orders = await getSectionOrders();

  const features = [t("feature1"), t("feature2"), t("feature3"), t("feature4")];

  // Bölgeler (antalya.regions): admin override varsa dinamik liste, yoksa koddaki
  // satır içi varsayılan (pickAsset ile — bugünkü çıktı birebir).
  const regionPlaces = await resolveGallery("antalya.regions", locale, [
    { img: pickAsset(A, "antalya.place.kaputas.image", "/images/kaputas.jpg"), video: pickAsset(A, "antalya.place.kaputas.video", "/media/kaputas-drone.mp4"), name: "Kaputaş", sub: "Kaş" },
    { img: pickAsset(A, "antalya.place.suluada.image", "/images/suluada.jpg"), video: pickAsset(A, "antalya.place.suluada.video", "/media/vid-suluada.mp4"), name: "Suluada", sub: "Adrasan" },
    { img: pickAsset(A, "antalya.place.kemer.image", "/images/kemer.jpg"), video: pickAsset(A, "antalya.place.kemer.video", "/media/vid-kemer.mp4"), name: "Kemer", sub: "Marina" },
    { img: pickAsset(A, "antalya.place.olympos.image", "/images/olympos.jpg"), video: pickAsset(A, "antalya.place.olympos.video", "/media/vid-olympos.mp4"), name: "Olympos", sub: "Çıralı" },
    { img: pickAsset(A, "antalya.place.alanya.image", "/images/alanya.jpg"), video: pickAsset(A, "antalya.place.alanya.video", "/media/vid-alanya-castle.mp4"), name: "Alanya", sub: "Kızıl Kule" },
    { img: pickAsset(A, "antalya.place.beachpark.image", "/images/beachpark.jpg"), name: "Beach Park", sub: "Konyaaltı" },
    { img: pickAsset(A, "antalya.place.lara.image", "/images/lara.jpg"), name: "Lara", sub: "Falezler" },
    { img: pickAsset(A, "antalya.place.kaleici.image", "/images/kaleici-harbor.jpg"), video: pickAsset(A, "antalya.place.kaleici.video", "/media/vid-kaleici.mp4"), name: "Kaleiçi", sub: "Yat Limanı" },
    { img: pickAsset(A, "antalya.place.side.image", "/images/side.jpg"), name: "Side", sub: "Antik kent" },
    { img: pickAsset(A, "antalya.place.duden.image", "/images/duden.jpg"), video: pickAsset(A, "antalya.place.duden.video", "/media/vid-duden.mp4"), name: "Düden", sub: "Şelale" },
  ]);

  // Sıraya bağlanan registry bölümleri — koddaki mevcut sırayla, JSX içeriği aynen.
  const sectionBlocks: [string, ReactNode][] = [
    ["antalya.readyRoutes", (
      /* HAZIR ROTALAR — bu sayfanın kalbi: hayalindeki tatil zaten hazır, seç ve al */
      <ReadyRoutes />
    )],
    ["antalya.intro", (
      /* Editoryal giriş + özellik listesi */
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
    )],
    ["antalya.regions", (
      /* Bölgeler — yatay gezi */
      <HorizontalPlaces
        eyebrow={x("ant_regionsEyebrow")}
        title={x("ant_regionsTitle")}
        places={regionPlaces}
      />
    )],
  ];
  const defaultIds = sectionBlocks.map(([id]) => id);
  const orderedIds = applySectionOrder(defaultIds, orders["antalya"]);
  const byId = new Map(sectionBlocks);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", serviceType: "Travel consulting", name: t("title"), description: t("intro"), areaServed: "Antalya, Türkiye" }} />

      <CinematicHero
        eyebrow={x("ant_introEyebrow")}
        title={t("title")}
        intro={t("intro")}
        image={pickAsset(A, "antalya.hero.image", "/images/kaputas.jpg")}
        videos={[
          pickAsset(A, "antalya.hero.video1", "/media/kaputas-drone.mp4"),
          pickAsset(A, "antalya.hero.video2", "/media/vid-suluada.mp4"),
          pickAsset(A, "antalya.hero.video3", "/media/vid-kemer.mp4"),
          pickAsset(A, "antalya.hero.video4", "/media/vid-kas.mp4"),
        ]}
      />

      {/* SIRAYA BAĞLI BÖLÜMLER (registry sırası; kayıt yoksa birebir aynı) */}
      {orderedIds.filter((id) => sectionVisible(hidden, id)).map((id) => (
        <Fragment key={id}>{byId.get(id)}</Fragment>
      ))}

      {/* CTA */}
      <section className="container-wide pb-24 pt-4">
        <Reveal className="relative flex min-h-[380px] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white">
          <Image src={pickAsset(A, "antalya.cta.image", "/images/kaputas.jpg")} alt="Kaputaş Plajı, Kaş — turkuaz Akdeniz" fill sizes="(max-width:1280px) 100vw, 1200px" className="object-cover" />
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
