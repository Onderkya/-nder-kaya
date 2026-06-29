import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { CinematicHero } from "@/components/cinematic-hero";
import { ContactForm } from "@/components/contact-form";
import { PaymentMethods } from "@/components/payment-methods";
import { Reveal } from "@/components/reveal";
import { siteConfig, whatsappLink, telegramLink } from "@/lib/config";
import { getManagedPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/cms/block-renderer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cmsPage = await getManagedPage("contact", locale);
  if (cmsPage) return <BlockRenderer page={cmsPage} locale={locale} />;
  const t = await getTranslations("contact");
  const p = await getTranslations("payment");
  const cv = await getTranslations("convert");
  const tr = await getTranslations("trust");

  return (
    <>
      <CinematicHero eyebrow={t("orReach")} title={t("title")} intro={t("subtitle")} image="/images/sunset.jpg" video="/media/vid-kas.mp4" />

      {/* Güvence şeridi — formdan önce tereddütü kaldır */}
      <section className="border-b" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
        <div className="container-wide flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-center">
          {[cv("conAssure1"), cv("conAssure2"), cv("conAssure3")].map((a) => (
            <span key={a} className="flex items-center gap-2 text-[14px] font-semibold" style={{ color: "rgb(var(--foreground))" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--primary))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
              {a}
            </span>
          ))}
        </div>
      </section>

      <section className="container-page grid gap-10 py-20 lg:grid-cols-2">
        <Reveal>
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
          {/* Güven mikro-satırı — gönder butonunun hemen altında */}
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>
            {[tr("p3"), tr("p2"), tr("p5")].map((pt) => (
              <li key={pt} className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--primary))" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                {pt}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120} className="space-y-6">
          {/* En hızlısı — birincil anlık kanal kartı (ölü link üretmemek için koşullu) */}
          <div className="relative overflow-hidden rounded-[1.5rem] p-6 text-white shadow-xl" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>
            <span className="sheen" />
            <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/85">{cv("conQuick")}</p>
            <p className="relative mt-2 text-[15px] leading-relaxed text-white/90">{cv("conQuickText")}</p>
            <div className="relative mt-5 flex flex-wrap gap-2.5">
              {siteConfig.whatsappConfigured ? (
                <a className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[rgb(var(--primary))] shadow-md transition hover:scale-[1.03]" href={whatsappLink()} target="_blank" rel="noopener">📱 WhatsApp</a>
              ) : null}
              {siteConfig.telegramConfigured ? (
                <a className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10" href={telegramLink()} target="_blank" rel="noopener">✈️ Telegram</a>
              ) : null}
              <a className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10" href={`mailto:${siteConfig.email}`}>✉️ {siteConfig.email}</a>
            </div>
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

          {/* Canlı, admin panelden yönetilen ve doğrulanan ödeme adresleri */}
          <PaymentMethods
            labels={{
              title: p("title"),
              verifyWarning: p("verifyWarning"),
              networkLabel: p("networkLabel"),
              empty: p("empty"),
              txidNote: p("txidNote"),
            }}
          />
        </Reveal>
      </section>
    </>
  );
}
