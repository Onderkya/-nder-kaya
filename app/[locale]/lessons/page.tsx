import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { CinematicHero } from "@/components/cinematic-hero";
import { AlphabetPuzzle } from "@/components/alphabet-puzzle";
import { JsonLd } from "@/components/json-ld";
import { IconClock } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { prisma } from "@/lib/db";
import { BookingWidget } from "./booking-widget";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "lessons" });
  return { title: t("title"), description: t("intro") };
}

export default async function LessonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("lessons");
  const tb = await getTranslations("booking");
  const x = await getTranslations("imm");

  const durations = [
    { title: t("min15"), desc: t("min15Desc") },
    { title: t("min30"), desc: t("min30Desc") },
    { title: t("min60"), desc: t("min60Desc") },
  ];

  // Yalnızca gelecekteki ve boş slotları göster.
  const slotRows = await prisma.availabilitySlot
    .findMany({
      where: { booked: false, startsAt: { gt: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 24,
    })
    .catch(() => []);
  const slots = slotRows.map((s) => ({ id: s.id, startsAt: s.startsAt.toISOString(), minutes: s.minutes }));
  const bookingLabels = {
    pickSlot: tb("pickSlot"), noSlots: tb("noSlots"), name: tb("name"), email: tb("email"),
    phone: tb("phone"), note: tb("note"), submit: tb("submit"), success: tb("success"),
    taken: tb("taken"), error: tb("error"),
  };

  const puzzleItems = [
    { word: "DENİZ", meaning: x("les_m_deniz"), img: "/images/beach.jpg" },
    { word: "GÜNEŞ", meaning: x("les_m_gunes"), img: "/images/sunset.jpg" },
    { word: "ÇAY", meaning: x("les_m_cay"), img: "/images/tea.jpg" },
    { word: "KAHVE", meaning: x("les_m_kahve"), img: "/images/coffee.jpg" },
    { word: "KALE", meaning: x("les_m_kale"), img: "/images/kaleici.jpg" },
    { word: "LİMAN", meaning: x("les_m_liman"), img: "/images/harbor.jpg" },
  ];

  const puzzleLabels = {
    eyebrow: x("les_puzzleEyebrow"), title: x("les_puzzleTitle"), desc: x("les_puzzleDesc"),
    prompt: x("les_puzzleDesc"), meaning: x("les_puzzleMeaning"), next: x("les_puzzleNext"),
    shuffle: x("les_puzzleShuffle"), done: x("les_puzzleDone"), allDone: x("les_puzzleAllDone"),
    restart: x("les_puzzleRestart"), progress: x("les_puzzleProgress"),
  };

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Course", name: t("title"), description: t("intro"), provider: { "@type": "Organization", name: "Antalya Bridge" } }} />

      <CinematicHero eyebrow="A · B · C · Ç" title={t("title")} intro={t("intro")} image="/images/coffee.jpg" />

      {/* Türkçe kelime yapbozu — oyunla öğren */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "rgb(var(--muted) / 0.45)" }}>
        <div className="container-wide">
          <AlphabetPuzzle items={puzzleItems} labels={puzzleLabels} />
        </div>
      </section>

      {/* Ders süreleri */}
      <section className="container-wide py-20 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="h-section" style={{ color: "rgb(var(--foreground))" }}>{t("durationsTitle")}</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {durations.map((d, i) => (
            <Reveal key={d.title} delay={i * 90} className="card text-center transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}>
                <IconClock className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{d.desc}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/contact" className="btn-primary">{t("cta")}</Link>
        </div>
      </section>

      {/* Randevu */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "rgb(var(--muted) / 0.45)" }}>
        <div className="container-page">
          <h2 className="mb-2 text-2xl font-bold">{tb("title")}</h2>
          <p className="mb-6 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{tb("intro")}</p>
          <BookingWidget slots={slots} locale={locale} labels={bookingLabels} />
        </div>
      </section>
    </>
  );
}
