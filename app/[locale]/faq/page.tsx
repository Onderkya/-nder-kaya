import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title") };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

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
      <PageHero title={t("title")} intro="" image="/images/yivli.jpg" />
      <section className="container-page py-14">
        <div className="mx-auto max-w-3xl space-y-4">
          {items.map((item, i) => (
            <Reveal key={item.q} delay={i * 70}>
              <details className="card">
                <summary className="cursor-pointer text-lg font-semibold">{item.q}</summary>
                <p className="mt-3" style={{ color: "rgb(var(--muted-foreground))" }}>{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
