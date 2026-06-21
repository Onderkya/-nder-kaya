import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ContactForm } from "@/components/contact-form";
import { siteConfig, whatsappLink, telegramLink } from "@/lib/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const p = await getTranslations("payment");

  return (
    <>
      <PageHero title={t("title")} intro={t("subtitle")} />
      <section className="container-page grid gap-10 py-14 lg:grid-cols-2">
        <div>
          <ContactForm
            labels={{
              name: t("name"),
              email: t("email"),
              phone: t("phone"),
              service: t("service"),
              serviceAntalya: t("serviceAntalya"),
              serviceLessons: t("serviceLessons"),
              serviceEducation: t("serviceEducation"),
              serviceOther: t("serviceOther"),
              message: t("message"),
              submit: t("submit"),
              success: t("success"),
              error: t("error"),
            }}
          />
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold">{t("orReach")}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a className="hover:underline" href={whatsappLink()} target="_blank" rel="noopener">📱 WhatsApp</a></li>
              <li><a className="hover:underline" href={telegramLink()} target="_blank" rel="noopener">✈️ Telegram</a></li>
              <li><a className="hover:underline" href={`mailto:${siteConfig.email}`}>✉️ {siteConfig.email}</a></li>
            </ul>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold">{p("title")}</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="font-semibold">{p("kaspiTitle")}</p>
                <p style={{ color: "rgb(var(--muted-foreground))" }}>{p("kaspiText")}</p>
              </div>
              <div>
                <p className="font-semibold">{p("cryptoTitle")}</p>
                <p style={{ color: "rgb(var(--muted-foreground))" }}>{p("cryptoText")}</p>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>{p("note")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
