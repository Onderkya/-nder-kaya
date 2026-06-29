import { existsSync } from "fs";
import path from "path";
import { getTranslations } from "next-intl/server";
import { ReadyRoutes } from "@/components/ready-routes";
import { StudyJourney } from "@/components/study-journey";
import { HotelCards } from "@/components/hotel-cards";
import { PetLingoShowcase } from "@/components/petlingo-showcase";
import { GuestVoices } from "@/components/guest-voices";
import { QuickPlanForm } from "@/components/quick-plan-form";

/**
 * Premium "özel tip" CMS blokları — mevcut imza/bileşenleri AYNEN kullanır,
 * her biri kendi çevirisini okur (i18n /admin/content'ten düzenlenir). Böylece
 * bir sayfa CMS'e taşınırken sinematik/immersive tasarım KAYBOLMAZ.
 * Wiring, kaynak sayfalardaki (page/lessons/education) kurulumun birebir aynısıdır.
 */

export const PREMIUM_TYPES = ["routeGallery", "studyJourney", "hotels", "petlingo", "guestVoices", "quickPlan"] as const;

export const PREMIUM_BLOCK_DEFS = [
  { type: "routeGallery", label: "★ Hazır Rotalar (sinematik galeri)" },
  { type: "studyJourney", label: "★ Eğitim Yolculuğu (scroll sahne)" },
  { type: "hotels", label: "★ Otel Kartları" },
  { type: "petlingo", label: "★ PetLingo Vitrini" },
  { type: "guestVoices", label: "★ Misafir Sözleri" },
  { type: "quickPlan", label: "★ Hızlı Plan Formu" },
];

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
    .map((h) => ({
      name: h.name,
      img: `/images/hotels/${h.file}`,
      location: hd(`${h.key}_loc`),
      best: hd(`${h.key}_best`),
      why: hd(`${h.key}_why`),
      note: hd(`${h.key}_note`),
    }));
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
        eyebrow: x("pl_eyebrow"),
        title: x("pl_title"),
        desc: x("pl_desc"),
        features: [x("pl_f1"), x("pl_f2"), x("pl_f3"), x("pl_f4"), x("pl_f5"), x("pl_f6")],
        cta: x("pl_cta"),
        soon: x("pl_soon"),
        combo: x("pl_combo"),
        own: x("pl_own"),
        ai: x("pl_ai"),
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
      { key: "family", label: plan("styleFamily") },
      { key: "romantic", label: plan("styleRomantic") },
      { key: "luxury", label: plan("styleLuxury") },
      { key: "adventure", label: plan("styleAdventure") },
      { key: "beach", label: plan("styleBeach") },
    ],
    budgets: [
      { key: "eco", label: plan("budgetEco") },
      { key: "mid", label: plan("budgetMid") },
      { key: "lux", label: plan("budgetLux") },
      { key: "ultra", label: plan("budgetUltra") },
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

/** Premium blok dağıtıcısı — type'a göre ilgili (async) sunucu bileşenini render eder. */
export function PremiumBlock({ type }: { type: string }) {
  switch (type) {
    case "routeGallery":
      return <ReadyRoutes />;
    case "studyJourney":
      return <StudyJourneyBlock />;
    case "hotels":
      return <HotelsBlock />;
    case "petlingo":
      return <PetlingoBlock />;
    case "guestVoices":
      return <GuestVoicesBlock />;
    case "quickPlan":
      return <QuickPlanBlock />;
    default:
      return null;
  }
}
