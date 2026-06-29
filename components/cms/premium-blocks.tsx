import { existsSync } from "fs";
import path from "path";
import { getTranslations } from "next-intl/server";
import { ReadyRoutes } from "@/components/ready-routes";
import { StudyJourney } from "@/components/study-journey";
import { HotelCards } from "@/components/hotel-cards";
import { PetLingoShowcase } from "@/components/petlingo-showcase";
import { GuestVoices } from "@/components/guest-voices";
import { QuickPlanForm } from "@/components/quick-plan-form";
import { DiveHero } from "@/components/dive-hero";
import { ZipperReveal } from "@/components/zipper-reveal";
import { HorizontalPlaces } from "@/components/horizontal-places";
import { FaqAccordion } from "@/components/faq-accordion";
import { TrustStrip } from "@/components/trust-strip";
import { ConversionBand } from "@/components/conversion-band";
import { ContactForm } from "@/components/contact-form";
import { PaymentMethods } from "@/components/payment-methods";
import { getPublicSettings } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { BookingWidget } from "@/app/[locale]/lessons/booking-widget";

/**
 * Premium "özel tip" CMS blokları — mevcut imza/bileşenleri AYNEN kullanır,
 * her biri kendi çevirisini okur (i18n /admin/content'ten düzenlenir). Böylece
 * bir sayfa CMS'e taşınırken sinematik/immersive tasarım KAYBOLMAZ.
 * Wiring, kaynak sayfalardaki (page/antalya/lessons/education/contact/faq) kurulumun aynısıdır.
 */

export const PREMIUM_TYPES = [
  "routeGallery", "studyJourney", "hotels", "petlingo", "guestVoices", "quickPlan",
  "diveHero", "zipper", "horizontalPlaces", "contactInfo", "booking", "faqAccordion", "trustStrip", "conversionBand",
] as const;

async function StudyJourneyBlock() {
  const x = await getTranslations("imm");
  const campus = existsSync(path.join(process.cwd(), "public", "images", "akdeniz-campus-wide.jpg"))
    ? "/images/akdeniz-campus-wide.jpg"
    : "/images/campus.jpg";
  return (
    <StudyJourney
      eyebrow={x("edu_journeyEyebrow")}
      steps={[
        { n: "01", title: x("edu_s1Title"), place: x("edu_s1Place"), text: x("edu_s1Text"), img: campus, video: "/media/campus-aerial.mp4", points: [x("edu_s1a"), x("edu_s1b")] },
        { n: "02", title: x("edu_s2Title"), place: x("edu_s2Place"), text: x("edu_s2Text"), img: "/images/campus.jpg", video: "/media/office-consult.mp4", points: [x("edu_s2a"), x("edu_s2b")] },
        { n: "03", title: x("edu_s3Title"), place: x("edu_s3Place"), text: x("edu_s3Text"), img: "/images/kaleici-inside.jpg", video: "/media/edu-street.mp4", points: [x("edu_s3a"), x("edu_s3b")] },
        { n: "04", title: x("edu_s4Title"), place: x("edu_s4Place"), text: x("edu_s4Text"), img: "/images/dorm.jpg", points: [x("edu_s4a"), x("edu_s4b")] },
      ]}
    />
  );
}

async function HotelsBlock() {
  const t = await getTranslations("home");
  const hd = await getTranslations("hotelsd");
  const has = (name: string) => existsSync(path.join(process.cwd(), "public", "images", name));
  const allHotels = [
    { key: "cullinan", name: "Cullinan Belek", file: "cullinan-belek.jpg" },
    { key: "maxxbelek", name: "Maxx Royal Belek", file: "maxx-royal-belek.jpg" },
    { key: "regnum", name: "Regnum Carya", file: "regnum-carya.jpg" },
    { key: "maxxkemer", name: "Maxx Royal Kemer", file: "maxx-royal-kemer.jpg" },
    { key: "ngphaselis", name: "NG Phaselis Bay", file: "ng-phaselis-bay.jpg" },
    { key: "larabarut", name: "Lara Barut Collection", file: "lara-barut.jpg" },
    { key: "bayou", name: "Bayou Villas", file: "bayou-villas.jpg" },
    { key: "legends", name: "Land of Legends Kingdom", file: "land-of-legends-kingdom.jpg" },
  ];
  const hotels = allHotels
    .filter((h) => has(path.join("hotels", h.file)))
    .map((h) => ({ name: h.name, img: `/images/hotels/${h.file}`, location: hd(`${h.key}_loc`), best: hd(`${h.key}_best`), why: hd(`${h.key}_why`), note: hd(`${h.key}_note`) }));
  return (
    <section className="container-wide py-20 sm:py-24">
      <HotelCards hotels={hotels} labels={{ cta: t("hotelsCta"), bestFor: hd("bestFor"), why: hd("why"), note: hd("note") }} />
    </section>
  );
}

async function PetlingoBlock() {
  const x = await getTranslations("imm");
  return (
    <PetLingoShowcase
      labels={{
        eyebrow: x("pl_eyebrow"), title: x("pl_title"), desc: x("pl_desc"),
        features: [x("pl_f1"), x("pl_f2"), x("pl_f3"), x("pl_f4"), x("pl_f5"), x("pl_f6")],
        cta: x("pl_cta"), soon: x("pl_soon"), combo: x("pl_combo"), own: x("pl_own"), ai: x("pl_ai"),
      }}
    />
  );
}

async function GuestVoicesBlock() {
  const v = await getTranslations("voices");
  return (
    <GuestVoices
      labels={{ eyebrow: v("eyebrow"), title: v("title"), honest: v("honest"), emptyTitle: v("emptyTitle"), emptyText: v("emptyText"), serve: v("serve"), cta: v("cta") }}
      reviews={[]}
    />
  );
}

async function QuickPlanBlock() {
  const plan = await getTranslations("plan");
  const planStrings = {
    eyebrow: plan("eyebrow"), title: plan("title"), subtitle: plan("subtitle"),
    fArrival: plan("fArrival"), fPeople: plan("fPeople"), fDays: plan("fDays"), fBudget: plan("fBudget"), fStyle: plan("fStyle"),
    fContact: plan("fContact"), fHandle: plan("fHandle"), fHandlePh: plan("fHandlePh"), fNote: plan("fNote"), fNotePh: plan("fNotePh"),
    styles: [
      { key: "family", label: plan("styleFamily") }, { key: "romantic", label: plan("styleRomantic") },
      { key: "luxury", label: plan("styleLuxury") }, { key: "adventure", label: plan("styleAdventure") }, { key: "beach", label: plan("styleBeach") },
    ],
    budgets: [
      { key: "eco", label: plan("budgetEco") }, { key: "mid", label: plan("budgetMid") }, { key: "lux", label: plan("budgetLux") }, { key: "ultra", label: plan("budgetUltra") },
    ],
    contactWa: plan("contactWa"), contactTg: plan("contactTg"), cta: plan("cta"), note: plan("note"),
    msgIntro: plan("msgIntro"), msgArrival: plan("msgArrival"), msgPeople: plan("msgPeople"), msgDays: plan("msgDays"),
    msgBudget: plan("msgBudget"), msgStyle: plan("msgStyle"), msgHandle: plan("msgHandle"), msgNote: plan("msgNote"),
  };
  return (
    <section className="container-wide py-20 sm:py-24">
      <QuickPlanForm t={planStrings} />
    </section>
  );
}

async function DiveHeroBlock() {
  const t = await getTranslations("home");
  const meta = await getTranslations("meta");
  return (
    <DiveHero
      brand={meta("siteName")}
      title={t("heroTitle")}
      subtitle={t("heroSubtitle")}
      ctaPrimary={t("heroCtaPrimary")}
      ctaSecondary={t("heroCtaSecondary")}
      deepLine={t("diveDeep")}
      scrollCue={t("scrollCue")}
      soundLabel={t("soundWave")}
      diffLabel={t("heroDiff")}
      proof={[t("heroProof1"), t("heroProof2"), t("heroProof3"), t("heroProof4")]}
      aerialVideo="/media/kaputas-drone.mp4"
    />
  );
}

async function ZipperBlock() {
  const t = await getTranslations("home");
  const x = await getTranslations("imm");
  return (
    <ZipperReveal
      eyebrow={t("actTitle")}
      title={x("ant_introTitle")}
      items={[
        { video: "/media/act-scuba2.mp4", img: "/images/kaputas-deep.jpg", name: t("actScuba"), sub: "Akdeniz'in altı" },
        { video: "/media/kaputas-drone.mp4", img: "/images/kaputas.jpg", name: "Kaputaş Plajı", sub: "Kaş" },
        { video: "/media/vid-kas.mp4", img: "/images/sunset.jpg", name: "Kaş", sub: "Gün batımı" },
        { video: "/media/vid-suluada.mp4", img: "/images/suluada.jpg", name: "Suluada", sub: "Adrasan" },
        { video: "/media/vid-olympos.mp4", img: "/images/olympos.jpg", name: "Olympos", sub: "Çıralı" },
        { video: "/media/vid-kemer.mp4", img: "/images/kemer.jpg", name: "Kemer", sub: "Marina" },
        { video: "/media/vid-alanya-castle.mp4", img: "/images/alanya.jpg", name: "Alanya Kalesi", sub: "Kızıl Kule" },
        { video: "/media/vid-alanya-kleopatra.mp4", img: "/images/alanya.jpg", name: "Kleopatra", sub: "Alanya sahili" },
        { video: "/media/lol-aqua.mp4", img: "/images/coaster.jpg", name: "Land of Legends", sub: "Aqua park · Belek" },
      ]}
    />
  );
}

async function HorizontalPlacesBlock() {
  const x = await getTranslations("imm");
  return (
    <HorizontalPlaces
      eyebrow={x("ant_regionsEyebrow")}
      title={x("ant_regionsTitle")}
      places={[
        { img: "/images/kaputas.jpg", video: "/media/kaputas-drone.mp4", name: "Kaputaş", sub: "Kaş" },
        { img: "/images/suluada.jpg", video: "/media/vid-suluada.mp4", name: "Suluada", sub: "Adrasan" },
        { img: "/images/kemer.jpg", video: "/media/vid-kemer.mp4", name: "Kemer", sub: "Marina" },
        { img: "/images/olympos.jpg", video: "/media/vid-olympos.mp4", name: "Olympos", sub: "Çıralı" },
        { img: "/images/alanya.jpg", video: "/media/vid-alanya-castle.mp4", name: "Alanya", sub: "Kızıl Kule" },
        { img: "/images/beachpark.jpg", name: "Beach Park", sub: "Konyaaltı" },
        { img: "/images/lara.jpg", name: "Lara", sub: "Falezler" },
        { img: "/images/kaleici-harbor.jpg", video: "/media/vid-kaleici.mp4", name: "Kaleiçi", sub: "Yat Limanı" },
        { img: "/images/side.jpg", name: "Side", sub: "Antik kent" },
        { img: "/images/duden.jpg", video: "/media/vid-duden.mp4", name: "Düden", sub: "Şelale" },
      ]}
    />
  );
}

async function FaqAccordionBlock() {
  const f = await getTranslations("faq");
  const items = [
    { q: f("q1"), a: f("a1") }, { q: f("q2"), a: f("a2") }, { q: f("q3"), a: f("a3") }, { q: f("q4"), a: f("a4") },
  ];
  return (
    <section className="container-wide py-20 sm:py-28">
      <FaqAccordion items={items} />
    </section>
  );
}

async function TrustStripBlock() {
  const tr = await getTranslations("trust");
  return (
    <section className="container-wide py-16 sm:py-20">
      <TrustStrip title={tr("title")} points={[tr("p1"), tr("p2"), tr("p3"), tr("p4"), tr("p5")]} />
    </section>
  );
}

async function ConversionBandBlock() {
  const x = await getTranslations("imm");
  const c = await getTranslations("common");
  const cv = await getTranslations("convert");
  const site = await getPublicSettings();
  return (
    <ConversionBand
      title={x("lived_title")}
      text={x("lived_text")}
      ctaLabel={c("contactUs")}
      waLabel={site.whatsappConfigured ? cv("whatsapp") : undefined}
      waHref={site.whatsappConfigured ? `https://wa.me/${site.whatsapp}` : undefined}
    />
  );
}

async function ContactInfoBlock() {
  const t = await getTranslations("contact");
  const p = await getTranslations("payment");
  const cv = await getTranslations("convert");
  const site = await getPublicSettings();
  return (
    <section className="container-page grid gap-10 py-16 lg:grid-cols-2">
      <ContactForm
        labels={{
          name: t("name"), email: t("email"), phone: t("phone"), service: t("service"),
          serviceAntalya: t("serviceAntalya"), serviceLessons: t("serviceLessons"), serviceEducation: t("serviceEducation"), serviceOther: t("serviceOther"),
          message: t("message"), submit: t("submit"), success: t("success"), error: t("error"),
        }}
      />
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-[1.5rem] p-6 text-white shadow-xl" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>
          <span className="sheen" />
          <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-white/85">{cv("conQuick")}</p>
          <p className="relative mt-2 text-[15px] leading-relaxed text-white/90">{cv("conQuickText")}</p>
          <div className="relative mt-5 flex flex-wrap gap-2.5">
            {site.whatsappConfigured ? <a className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[rgb(var(--primary))] shadow-md" href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener">📱 WhatsApp</a> : null}
            {site.telegramConfigured ? <a className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white" href={`https://t.me/${site.telegram}`} target="_blank" rel="noopener">✈️ Telegram</a> : null}
            <a className="inline-flex items-center gap-2 rounded-full border border-white/50 px-4 py-2 text-sm font-semibold text-white" href={`mailto:${site.email}`}>✉️ {site.email}</a>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold">{p("title")}</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div><p className="font-semibold">{p("kaspiTitle")}</p><p style={{ color: "rgb(var(--muted-foreground))" }}>{p("kaspiText")}</p></div>
            <div><p className="font-semibold">{p("cryptoTitle")}</p><p style={{ color: "rgb(var(--muted-foreground))" }}>{p("cryptoText")}</p></div>
            <p className="text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>{p("note")}</p>
          </div>
        </div>
        <PaymentMethods labels={{ title: p("title"), verifyWarning: p("verifyWarning"), networkLabel: p("networkLabel"), empty: p("empty"), txidNote: p("txidNote") }} />
      </div>
    </section>
  );
}

async function BookingBlock({ locale }: { locale: string }) {
  const tb = await getTranslations("booking");
  const rows = await prisma.availabilitySlot
    .findMany({ where: { booked: false, startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" }, take: 24 })
    .catch(() => []);
  const slots = rows.map((s) => ({ id: s.id, startsAt: s.startsAt.toISOString(), minutes: s.minutes }));
  return (
    <section className="py-16 sm:py-20" style={{ backgroundColor: "rgb(var(--muted) / 0.45)" }}>
      <div className="container-page">
        <h2 className="mb-2 text-2xl font-bold">{tb("title")}</h2>
        <p className="mb-6 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{tb("intro")}</p>
        <BookingWidget
          slots={slots}
          locale={locale}
          labels={{ pickSlot: tb("pickSlot"), noSlots: tb("noSlots"), name: tb("name"), email: tb("email"), phone: tb("phone"), note: tb("note"), submit: tb("submit"), success: tb("success"), taken: tb("taken"), error: tb("error") }}
        />
      </div>
    </section>
  );
}

/** Premium blok dağıtıcısı — type'a göre ilgili (async) sunucu bileşenini render eder. */
export function PremiumBlock({ type, locale }: { type: string; locale: string }) {
  switch (type) {
    case "routeGallery": return <ReadyRoutes />;
    case "studyJourney": return <StudyJourneyBlock />;
    case "hotels": return <HotelsBlock />;
    case "petlingo": return <PetlingoBlock />;
    case "guestVoices": return <GuestVoicesBlock />;
    case "quickPlan": return <QuickPlanBlock />;
    case "diveHero": return <DiveHeroBlock />;
    case "zipper": return <ZipperBlock />;
    case "horizontalPlaces": return <HorizontalPlacesBlock />;
    case "contactInfo": return <ContactInfoBlock />;
    case "booking": return <BookingBlock locale={locale} />;
    case "faqAccordion": return <FaqAccordionBlock />;
    case "trustStrip": return <TrustStripBlock />;
    case "conversionBand": return <ConversionBandBlock />;
    default: return null;
  }
}
