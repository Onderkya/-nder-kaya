import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CinematicHero } from "@/components/cinematic-hero";
import { FaqAccordion } from "@/components/faq-accordion";
import { JsonLd } from "@/components/json-ld";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const x = await getTranslations("imm");

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
    </>
  );
}
