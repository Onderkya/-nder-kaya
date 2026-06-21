import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { PageHero } from "@/components/page-hero";
import { JsonLd } from "@/components/json-ld";
import { IconClock } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lessons" });
  return { title: t("title"), description: t("intro") };
}

export default async function LessonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lessons");

  const durations = [
    { title: t("min15"), desc: t("min15Desc") },
    { title: t("min30"), desc: t("min30Desc") },
    { title: t("min60"), desc: t("min60Desc") },
  ];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Course", name: t("title"), description: t("intro"), provider: { "@type": "Organization", name: "Antalya Bridge" } }} />
      <PageHero title={t("title")} intro={t("intro")} />
      <section className="container-page py-14">
        <h2 className="mb-8 text-2xl font-bold">{t("durationsTitle")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {durations.map((d) => (
            <div key={d.title} className="card text-center transition hover:-translate-y-1 hover:shadow-lg">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}
              >
                <IconClock className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{d.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/contact" className="btn-primary">{t("cta")}</Link>
        </div>
      </section>
    </>
  );
}
