import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CinematicHero } from "@/components/cinematic-hero";
import { FaqAccordion } from "@/components/faq-accordion";
import { JsonLd } from "@/components/json-ld";
import { TrustStrip } from "@/components/trust-strip";
import { ConversionBand } from "@/components/conversion-band";
import { siteConfig, whatsappLink } from "@/lib/config";
import { getManagedPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/cms/block-renderer";

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

  const items = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
  ];

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
      <CinematicHero eyebrow={x("faq_eyebrow")} title={t("title")} image="/images/kemer.jpg" video="/media/vid-kemer.mp4" />
      <section className="container-wide py-20 sm:py-28">
        <FaqAccordion items={items} />
      </section>

      {/* Güven şeridi — itirazları söker */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "rgb(var(--muted) / 0.45)" }}>
        <div className="container-wide">
          <TrustStrip title={tr("title")} points={[tr("p1"), tr("p2"), tr("p3"), tr("p4"), tr("p5")]} />
        </div>
      </section>

      {/* Kapanış CTA — sorusu kalan tek mesajla bize ulaşsın */}
      <ConversionBand
        title={cv("faqCtaTitle")}
        text={cv("faqCtaText")}
        ctaLabel={c("contactUs")}
        waLabel={siteConfig.whatsappConfigured ? cv("whatsapp") : undefined}
        waHref={siteConfig.whatsappConfigured ? whatsappLink() : undefined}
      />
    </>
  );
}
