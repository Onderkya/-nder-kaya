import { existsSync } from "fs";
import path from "path";
import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { CinematicHero } from "@/components/cinematic-hero";
import { Reveal } from "@/components/reveal";
import { IconArrow } from "@/components/icons";
import { TrustStrip } from "@/components/trust-strip";
import { ConversionBand } from "@/components/conversion-band";
import { JsonLd } from "@/components/json-ld";
import { getPublicSettings } from "@/lib/settings";
import { getManagedPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/cms/block-renderer";
import { getAssetMap, getHiddenAssetSet, pickAssetVisible } from "@/lib/assets";
import { getHiddenSections, sectionVisible, getSectionOrders, applySectionOrder } from "@/lib/sections";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const description = t("body");
  return {
    title: t("title"),
    description,
    openGraph: { title: t("title"), description, type: "profile" },
    twitter: { title: t("title"), description },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cmsPage = await getManagedPage("about", locale);
  if (cmsPage) return <BlockRenderer page={cmsPage} locale={locale} />;
  const t = await getTranslations("about");
  const x = await getTranslations("imm");
  const c = await getTranslations("common");
  const tr = await getTranslations("trust");
  const cv = await getTranslations("convert");
  const sv = await getTranslations("services");
  const site = await getPublicSettings();
  const A = await getAssetMap();
  const H = await getHiddenAssetSet();
  const hidden = await getHiddenSections();
  const orders = await getSectionOrders();

  // Temsili (telifsiz) çift fotoğrafı kullanılır ve figcaption'da "temsili görsel"
  // ibaresiyle işaretlenir — kullanıcı kararı (2026-07, spec: kanit-katmani).
  // Admin override varsa o kazanır; dosya yoksa zarif yer tutucu (🇰🇿 ♥ 🇹🇷) korunur.
  const coupleOverride = A["about.founders.image"];
  const couple = coupleOverride && coupleOverride.trim()
    ? coupleOverride
    : existsSync(path.join(process.cwd(), "public", "images", "founders.jpg"))
      ? "/images/founders.jpg"
      : null;

  // Hayat çizelgesi — uydurma tarih/isim yok; mevcut gerçek bilgilerden.
  const timeline = [
    { t: cv("tl1T"), x: cv("tl1X") },
    { t: cv("tl2T"), x: cv("tl2X") },
    { t: cv("tl3T"), x: cv("tl3X") },
    { t: cv("tl4T"), x: cv("tl4X") },
    { t: cv("tl5T"), x: cv("tl5X") },
  ];

  // Hizmet alanları — services çevirilerinden (zaten 5 dil).
  const areas = [
    { href: "/antalya", title: sv("antalyaTitle"), desc: sv("antalyaDesc") },
    { href: "/lessons", title: sv("lessonsTitle"), desc: sv("lessonsDesc") },
    { href: "/education", title: sv("educationTitle"), desc: sv("educationDesc") },
    { href: "/contact", title: sv("itTitle"), desc: sv("itDesc") },
  ];

  const values = [
    { n: "I", title: x("ab_v1Title"), text: x("ab_v1Text") },
    { n: "II", title: x("ab_v2Title"), text: x("ab_v2Text") },
    { n: "III", title: x("ab_v3Title"), text: x("ab_v3Text") },
  ];

  // SEO / AI aramaları için yapılandırılmış veri — kuruluş + kurucular + diller + hizmetler.
  const ld = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: t("title"),
    inLanguage: locale,
    mainEntity: {
      "@type": "Organization",
      name: "Antalya Bridge",
      url: site.url,
      email: site.email,
      description: t("body"),
      areaServed: { "@type": "Place", name: "Antalya, Türkiye" },
      knowsLanguage: ["Turkish", "English", "Russian", "Kazakh", "Uzbek"],
      founder: [
        { "@type": "Person", jobTitle: cv("founderEng"), knowsLanguage: ["Turkish", "English", "Russian"] },
        { "@type": "Person", jobTitle: cv("founderTeacher"), knowsLanguage: ["Kazakh", "Russian", "Turkish", "English"] },
      ],
      makesOffer: areas.map((a) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: a.title, description: a.desc } })),
    },
  };

  // Sıraya bağlanan registry bölümleri — koddaki mevcut sırayla, JSX içeriği aynen.
  const sectionBlocks: [string, ReactNode][] = [
    ["about.manifesto", (
      /* Manifesto */
      <section className="container-wide py-24 sm:py-32">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-display text-balance leading-snug" style={{ fontSize: "clamp(1.6rem, 3.2vw, 2.6rem)", color: "rgb(var(--foreground))" }}>
            {t("body")}
          </p>
        </Reveal>
      </section>
    )],
    ["about.timeline", (
      /* Çift fotoğrafı + hayat çizelgesi */
      <section className="pb-8">
        <div className="container-wide grid items-start gap-12 md:grid-cols-2 lg:grid-cols-[minmax(0,0.85fr),1fr] lg:gap-16">
          {/* Sol: çift fotoğrafı ya da zarif yer tutucu */}
          <Reveal className="lg:sticky lg:top-28">
            <figure className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl">
              {couple ? (
                <>
                  <Image src={couple} alt={cv("coupleCaption")} fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
                  <div className="img-scrim-soft absolute inset-0" />
                  <figcaption className="absolute bottom-5 left-6 right-6 text-[13px] font-medium text-white/90">
                    {cv("coupleCaption")}
                    <span className="mt-1 block text-[11px] font-normal text-white/60">{cv("coupleRep")}</span>
                  </figcaption>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center" style={{ backgroundImage: "linear-gradient(150deg, rgb(var(--lagoon) / 0.20), rgb(var(--primary) / 0.16) 55%, rgb(var(--accent) / 0.14))" }}>
                  <div className="flex items-center gap-3 text-5xl sm:text-6xl" aria-hidden>
                    <span>🇰🇿</span>
                    <span className="text-2xl" style={{ color: "rgb(var(--gold))" }}>♥</span>
                    <span>🇹🇷</span>
                  </div>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                    <span className="rounded-full border px-3.5 py-1.5 text-xs font-semibold" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))", color: "rgb(var(--primary))" }}>{cv("founderTeacher")}</span>
                    <span className="rounded-full border px-3.5 py-1.5 text-xs font-semibold" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))", color: "rgb(var(--primary))" }}>{cv("founderEng")}</span>
                  </div>
                  <p className="mt-6 max-w-xs text-[14px] font-medium leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{cv("coupleCaption")}</p>
                </div>
              )}
            </figure>
          </Reveal>

          {/* Sağ: çizelge */}
          <div>
            <Reveal>
              <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>{x("ab_eyebrow")}</p>
              <h2 className="h-section mt-4 text-balance" style={{ color: "rgb(var(--foreground))" }}>{cv("aboutTimelineTitle")}</h2>
            </Reveal>
            <ol className="mt-10 space-y-0">
              {timeline.map((m, i) => (
                <Reveal key={m.t} delay={i * 80}>
                  <li className="relative grid grid-cols-[auto,1fr] gap-5 pb-9 last:pb-0">
                    {/* Rota rayı + nokta */}
                    <div className="relative flex flex-col items-center">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-white shadow-md" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>{i + 1}</span>
                      {i < timeline.length - 1 ? <span className="mt-1 w-px flex-1" style={{ backgroundColor: "rgb(var(--border))" }} /> : null}
                    </div>
                    <div className="pt-1">
                      <h3 className="font-display text-xl font-semibold leading-snug" style={{ color: "rgb(var(--foreground))" }}>{m.t}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{m.x}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>
    )],
    ["about.values", (
      /* Değerler — koyu deniz bandı */
      <section className="relative mt-20 overflow-hidden py-24 text-white sm:py-28" style={{ backgroundColor: "#07212b" }}>
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
        </div>
      </section>
    )],
    ["about.services", (
      /* Hangi alanlarda hizmet veriyoruz */
      <section className="py-24 sm:py-28">
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="h-section text-balance" style={{ color: "rgb(var(--foreground))" }}>{cv("aboutServicesTitle")}</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((a, i) => (
              <Reveal key={a.title} delay={i * 80}>
                <Link href={a.href} className="card-lift group flex h-full flex-col rounded-3xl border p-6 transition" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
                  <span className="serif-italic text-2xl" style={{ color: "rgb(var(--gold))" }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-3 text-lg font-semibold leading-snug" style={{ color: "rgb(var(--foreground))" }}>{a.title}</h3>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{a.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>{c("learnMore")} <IconArrow /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )],
    ["about.proof", (
      /* Kanıt şeridi */
      <section className="container-wide pb-24">
        <TrustStrip title={cv("aboutProofTitle")} points={[tr("p5"), tr("p1"), tr("p2"), tr("p3"), tr("p4")]} />
      </section>
    )],
  ];
  const defaultIds = sectionBlocks.map(([id]) => id);
  const orderedIds = applySectionOrder(defaultIds, orders["about"]);
  const byId = new Map(sectionBlocks);

  return (
    <>
      <JsonLd data={ld} />

      <CinematicHero eyebrow={x("ab_eyebrow")} title={t("title")} image={pickAssetVisible(A, H, "about.hero.image", "/images/kaleici-harbor.jpg") ?? undefined} video={pickAssetVisible(A, H, "about.hero.video", "/media/vid-kaleici.mp4") ?? undefined} />

      {/* SIRAYA BAĞLI BÖLÜMLER (registry sırası; kayıt yoksa birebir aynı) */}
      {orderedIds.filter((id) => sectionVisible(hidden, id)).map((id) => (
        <Fragment key={id}>{byId.get(id)}</Fragment>
      ))}

      {/* Kapanış dönüşüm bandı */}
      <ConversionBand
        title={x("lived_title")}
        text={x("lived_text")}
        ctaLabel={c("contactUs")}
        waLabel={site.whatsappConfigured ? cv("whatsapp") : undefined}
        waHref={site.whatsappConfigured ? `https://wa.me/${site.whatsapp}` : undefined}
        tgLabel={site.telegramConfigured ? cv("telegram") : undefined}
        tgHref={site.telegramConfigured ? `https://t.me/${site.telegram}` : undefined}
      />
    </>
  );
}
