import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { CinematicHero } from "@/components/cinematic-hero";
import { AutoVideo } from "@/components/auto-video";
import { PetLingoShowcase } from "@/components/petlingo-showcase";
import { JsonLd } from "@/components/json-ld";
import { IconClock, IconArrow } from "@/components/icons";
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

  const steps = [
    { n: "01", title: x("les_p1Title"), text: x("les_p1Text"), video: "/media/les-spell.mp4" },
    { n: "02", title: x("les_p2Title"), text: x("les_p2Text"), video: "/media/les-teacher.mp4" },
    { n: "03", title: x("les_p3Title"), text: x("les_p3Text"), video: "/media/les-online.mp4" },
    { n: "04", title: x("les_p4Title"), text: x("les_p4Text"), video: "/media/les-lara.mp4" },
  ];

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

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Course", name: t("title"), description: t("intro"), provider: { "@type": "Organization", name: "Antalya Bridge" } }} />

      <CinematicHero
        eyebrow={x("les_processEyebrow")}
        title={t("title")}
        intro={t("intro")}
        image="/images/lessons-meaning.jpg"
        videos={["/media/les-notebook.mp4", "/media/les-teacher.mp4", "/media/les-online.mp4", "/media/les-spell.mp4"]}
        flag
      />

      {/* Süreç — nasıl öğreniyorsunuz */}
      <section className="container-wide py-24 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{x("les_processEyebrow")}</p>
          <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{x("les_processTitle")}</h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{x("les_processDesc")}</p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((st, i) => (
            <Reveal key={st.n} delay={i * 90} className="process-step">
              <div className="card-lift overflow-hidden rounded-3xl border" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
                <div className="relative aspect-[16/11] overflow-hidden">
                  <AutoVideo className="absolute inset-0 h-full w-full object-cover" src={st.video} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,26,34,0.6), transparent 55%)" }} />
                  <div className="process-num absolute bottom-3 left-3">{st.n}</div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold leading-snug" style={{ color: "rgb(var(--foreground))" }}>{st.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{st.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Bunu biz de yaşadık — güven bandı */}
      <section className="relative overflow-hidden py-20 text-white sm:py-24" style={{ background: "linear-gradient(135deg, #0d94a8 0%, #0e7490 50%, #07303d 130%)" }}>
        <span className="sheen" />
        <div className="container-wide relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]">★ {x("lived_badge")}</span>
            <h2 className="h-section mt-6 text-balance">{x("lived_title")}</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">{x("lived_text")}</p>
            <Link href="/contact" className="btn-accent mt-8 shadow-xl shadow-black/25">{x("lived_cta")} <IconArrow /></Link>
          </Reveal>
        </div>
      </section>

      {/* PetLingo — her gün pratik aracı */}
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
        }}
      />

      {/* Ders süreleri */}
      <section className="container-wide py-24 sm:py-28">
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
