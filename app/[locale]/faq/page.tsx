import { Fragment, type ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CinematicHero } from "@/components/cinematic-hero";
import { FaqAccordion } from "@/components/faq-accordion";
import { JsonLd } from "@/components/json-ld";
import { TrustStrip } from "@/components/trust-strip";
import { ConversionBand } from "@/components/conversion-band";
import { getPublicSettings } from "@/lib/settings";
import { getManagedPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/cms/block-renderer";
import { getAssetMap, getHiddenAssetSet, pickAssetVisible } from "@/lib/assets";
import { getFaqExtrasFor } from "@/lib/faq";
import { getHiddenSections, sectionVisible, getSectionOrders, applySectionOrder } from "@/lib/sections";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cmsPage = await getManagedPage("faq", locale);
  if (cmsPage) return <BlockRenderer page={cmsPage} locale={locale} />;
  const t = await getTranslations("faq");
  const x = await getTranslations("imm");
  const tr = await getTranslations("trust");
  const cv = await getTranslations("convert");
  const c = await getTranslations("common");
  const site = await getPublicSettings();
  const A = await getAssetMap();
  const H = await getHiddenAssetSet();
  const hidden = await getHiddenSections();
  const orders = await getSectionOrders();

  const extras = await getFaqExtrasFor(locale);
  // 16 sabit soru (q1-q16) + admin'den eklenen ekstralar.
  const items = [
    ...Array.from({ length: 16 }, (_, i) => ({ q: t(`q${i + 1}`), a: t(`a${i + 1}`) })),
    ...extras,
  ];

  // Sıraya bağlanan registry bölümleri — koddaki mevcut sırayla, JSX içeriği aynen.
  const sectionBlocks: [string, ReactNode][] = [
    ["faq.list", (
      <section className="container-wide py-20 sm:py-28">
        <FaqAccordion items={items} />
      </section>
    )],
    ["faq.trust", (
      /* Güven şeridi — itirazları söker */
      <section className="py-16 sm:py-20" style={{ backgroundColor: "rgb(var(--muted) / 0.45)" }}>
        <div className="container-wide">
          <TrustStrip title={tr("title")} points={[tr("p1"), tr("p2"), tr("p3"), tr("p4"), tr("p5")]} />
        </div>
      </section>
    )],
  ];
  const defaultIds = sectionBlocks.map(([id]) => id);
  const orderedIds = applySectionOrder(defaultIds, orders["faq"]);
  const byId = new Map(sectionBlocks);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((i) => ({
            "@type": "Question",
            name: i.q,
            acceptedAnswer: { "@type": "Answer", text: i.a },
          })),
        }}
      />
      <CinematicHero eyebrow={x("faq_eyebrow")} title={t("title")} image={pickAssetVisible(A, H, "faq.hero.image", "/images/kemer.jpg") ?? undefined} video={pickAssetVisible(A, H, "faq.hero.video", "/media/vid-kemer.mp4") ?? undefined} />

      {/* SIRAYA BAĞLI BÖLÜMLER (registry sırası; kayıt yoksa birebir aynı) */}
      {orderedIds.filter((id) => sectionVisible(hidden, id)).map((id) => (
        <Fragment key={id}>{byId.get(id)}</Fragment>
      ))}

      {/* Kapanış CTA — sorusu kalan tek mesajla bize ulaşsın */}
      <ConversionBand
        title={cv("faqCtaTitle")}
        text={cv("faqCtaText")}
        ctaLabel={c("contactUs")}
        waLabel={site.whatsappConfigured ? cv("whatsapp") : undefined}
        waHref={site.whatsappConfigured ? `https://wa.me/${site.whatsapp}` : undefined}
      />
    </>
  );
}
