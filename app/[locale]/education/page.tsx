import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { PageHero, FeatureList } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "education" });
  return { title: t("title"), description: t("intro") };
}

export default async function EducationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("education");

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", serviceType: "Education consulting", name: t("title"), description: t("intro"), areaServed: "Türkiye" }} />
      <PageHero title={t("title")} intro={t("intro")} image="/images/aspendos.jpg" />
      <section className="container-page py-14">
        <FeatureList items={[t("feature1"), t("feature2"), t("feature3"), t("feature4")]} />
        <div className="mt-10 text-center">
          <Link href="/contact" className="btn-primary">{t("cta")}</Link>
        </div>
      </section>
    </>
  );
}
