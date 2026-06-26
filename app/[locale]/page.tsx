import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { DiveHero } from "@/components/dive-hero";
import { ZipperReveal } from "@/components/zipper-reveal";
import { HotelCards, Pin3D } from "@/components/hotel-cards";
import { RouteIcon } from "@/components/route-icons";
import { PetLingoLive } from "@/components/petlingo-live";
import { AutoVideo } from "@/components/auto-video";
import { GuestVoices } from "@/components/guest-voices";
import { FaqAccordion } from "@/components/faq-accordion";
import { MobilePlanCta } from "@/components/mobile-plan-cta";
import { QuickPlanForm } from "@/components/quick-plan-form";
import { IconArrow, IconCheck } from "@/components/icons";
import { siteConfig, whatsappLink } from "@/lib/config";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const c = await getTranslations("common");
  const meta = await getTranslations("meta");
  const x = await getTranslations("imm");
  const r = await getTranslations("routes");
  const pay = await getTranslations("payment");
  const plan = await getTranslations("plan");
  const trust = await getTranslations("trust");
  const lh = await getTranslations("lessonsHome");
  const st = await getTranslations("studyHome");
  const hd = await getTranslations("hotelsd");
  const v = await getTranslations("voices");
  const f = await getTranslations("faq");

  // Ana sayfa mini-SSS (itiraz giderme) — mevcut faq çevirilerinden.
  const faqItems = [
    { q: f("q1"), a: f("a1") },
    { q: f("q2"), a: f("a2") },
    { q: f("q3"), a: f("a3") },
    { q: f("q4"), a: f("a4") },
  ];

  // Otomatik-yüklenen görsel slotu: dosya public/images içine bırakılınca devreye girer.
  const has = (name: string) => existsSync(path.join(process.cwd(), "public", "images", name));

  // Öne çıkan Antalya otelleri — gerçek görseller public/images/hotels/ içinde.
  // Eksik görsel olursa o kart otomatik listeden düşer (existsSync).
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

  const reasons = [
    { n: "I", title: t("why1Title"), text: t("why1Text") },
    { n: "II", title: t("why2Title"), text: t("why2Text") },
    { n: "III", title: t("why3Title"), text: t("why3Text") },
  ];

  // Hazır rotalar — adım adım yolculuk: uçuş → transfer → otel → gün gün duraklar.
  // İlk üç adım (uçuş/transfer/giriş) her rotada paylaşılır.
  const flightStep = { icon: "plane", day: 1, t: r("st_flight_t"), d: r("st_flight_d") };
  const transferStep = { icon: "car", day: 1, t: r("st_transfer_t"), d: r("st_transfer_d") };
  const checkin = (ckKey: string) => ({ icon: "bed", day: 1, t: r("st_checkin_t"), d: r(ckKey) });

  const routes = [
    {
      key: "r1", name: r("r1_name"), tag: r("r1_tag"), best: r("r1_best"), aud: r("aud_classic"),
      days: 3, stars: 5, hotel: "Lara Barut Collection", loc: hd("larabarut_loc"), img: "/images/hotels/lara-barut.jpg",
      steps: [
        flightStep, transferStep, checkin("r1_ck"),
        { icon: "landmark", day: 2, t: r("r1_s1_t"), d: r("r1_s1_d") },
        { icon: "droplet", day: 2, t: r("r1_s2_t"), d: r("r1_s2_d") },
        { icon: "sunset", day: 3, t: r("r1_s3_t"), d: r("r1_s3_d") },
      ],
    },
    {
      key: "r2", name: r("r2_name"), tag: r("r2_tag"), best: r("r2_best"), aud: r("aud_classic"),
      days: 5, stars: 5, hotel: "Cullinan Belek", loc: hd("cullinan_loc"), img: "/images/hotels/cullinan-belek.jpg",
      steps: [
        flightStep, transferStep, checkin("r2_ck"),
        { icon: "landmark", day: 2, t: r("r2_s1_t"), d: r("r2_s1_d") },
        { icon: "landmark", day: 3, t: r("r2_s2_t"), d: r("r2_s2_d") },
        { icon: "droplet", day: 4, t: r("r2_s3_t"), d: r("r2_s3_d") },
        { icon: "bag", day: 5, t: r("r2_s4_t"), d: r("r2_s4_d") },
      ],
    },
    {
      key: "r3", name: r("r3_name"), tag: r("r3_tag"), best: r("r3_best"), aud: r("aud_honeymoon"),
      days: 5, stars: 5, hotel: "NG Phaselis Bay", loc: hd("ngphaselis_loc"), img: "/images/hotels/ng-phaselis-bay.jpg",
      steps: [
        flightStep, transferStep, { icon: "heart", day: 1, t: r("st_checkin_t"), d: r("r3_ck") },
        { icon: "landmark", day: 2, t: r("r3_s1_t"), d: r("r3_s1_d") },
        { icon: "cablecar", day: 3, t: r("r3_s2_t"), d: r("r3_s2_d") },
        { icon: "sailboat", day: 4, t: r("r3_s3_t"), d: r("r3_s3_d") },
        { icon: "flower", day: 5, t: r("r3_s4_t"), d: r("r3_s4_d") },
      ],
    },
    {
      key: "r4", name: r("r4_name"), tag: r("r4_tag"), best: r("r4_best"), aud: r("aud_family"),
      days: 7, stars: 5, hotel: "Land of Legends Kingdom", loc: hd("legends_loc"), img: "/images/hotels/land-of-legends-kingdom.jpg",
      steps: [
        flightStep, transferStep, checkin("r4_ck"),
        { icon: "ferris", day: 2, t: r("r4_s1_t"), d: r("r4_s1_d") },
        { icon: "waves", day: 3, t: r("r4_s2_t"), d: r("r4_s2_d") },
        { icon: "fish", day: 4, t: r("r4_s3_t"), d: r("r4_s3_d") },
        { icon: "sailboat", day: 5, t: r("r4_s4_t"), d: r("r4_s4_d") },
        { icon: "landmark", day: 6, t: r("r4_s5_t"), d: r("r4_s5_d") },
        { icon: "bag", day: 7, t: r("r4_s6_t"), d: r("r4_s6_d") },
      ],
    },
    {
      key: "r5", name: r("r5_name"), tag: r("r5_tag"), best: r("r5_best"), aud: r("aud_luxury"),
      days: 7, stars: 5, hotel: "Maxx Royal Kemer", loc: hd("maxxkemer_loc"), img: "/images/hotels/maxx-royal-kemer.jpg",
      steps: [
        flightStep, transferStep, checkin("r5_ck"),
        { icon: "mountain", day: 2, t: r("r5_s1_t"), d: r("r5_s1_d") },
        { icon: "anchor", day: 3, t: r("r5_s2_t"), d: r("r5_s2_d") },
        { icon: "sailboat", day: 4, t: r("r5_s3_t"), d: r("r5_s3_d") },
        { icon: "cablecar", day: 5, t: r("r5_s4_t"), d: r("r5_s4_d") },
        { icon: "flag", day: 6, t: r("r5_s5_t"), d: r("r5_s5_d") },
        { icon: "bag", day: 7, t: r("r5_s6_t"), d: r("r5_s6_d") },
      ],
    },
  ];

  // "Her şey dahil" manifestosu — her rotada paylaşılır. Misafirin aklındaki
  // tüm soruları (uçak? transfer? araç? gezi dahil mi?) tek bakışta yanıtlar.
  const inclusions = [
    { icon: "plane", label: r("inc_flight") },
    { icon: "car", label: r("inc_transfer") },
    { icon: "bed", label: r("inc_hotel") },
    { icon: "utensils", label: r("inc_board") },
    { icon: "landmark", label: r("inc_tours") },
    { icon: "headset", label: r("inc_support") },
  ];

  // "Bu tatili iste" → WhatsApp'a önceden doldurulmuş mesaj. Numara tanımlı
  // değilse /contact'a düşer (whatsappConfigured).
  const waReady = siteConfig.whatsappConfigured;
  const routeWaLink = (rt: (typeof routes)[number]) =>
    whatsappLink(r("waMsg", { name: rt.name, days: rt.days, hotel: rt.hotel }));

  // Quick Plan formuna geçilen 5 dilli metinler.
  const planStrings = {
    eyebrow: plan("eyebrow"),
    title: plan("title"),
    subtitle: plan("subtitle"),
    fArrival: plan("fArrival"),
    fPeople: plan("fPeople"),
    fDays: plan("fDays"),
    fBudget: plan("fBudget"),
    fStyle: plan("fStyle"),
    fContact: plan("fContact"),
    fHandle: plan("fHandle"),
    fHandlePh: plan("fHandlePh"),
    fNote: plan("fNote"),
    fNotePh: plan("fNotePh"),
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
    contactWa: plan("contactWa"),
    contactTg: plan("contactTg"),
    cta: plan("cta"),
    note: plan("note"),
    msgIntro: plan("msgIntro"),
    msgArrival: plan("msgArrival"),
    msgPeople: plan("msgPeople"),
    msgDays: plan("msgDays"),
    msgBudget: plan("msgBudget"),
    msgStyle: plan("msgStyle"),
    msgHandle: plan("msgHandle"),
    msgNote: plan("msgNote"),
  };

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: meta("siteName"),
          description: meta("description"),
          url: siteConfig.url,
          areaServed: "Antalya, Türkiye",
          email: siteConfig.email,
          knowsLanguage: ["tr", "en", "ru", "kk", "uz"],
          makesOffer: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: t("servicesTitle") } },
          ],
        }}
      />

      {/* ============ 1 · HERO — Antalya tatili sana özel ============ */}
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

      {/* ============ 2 · HAZIR ROTALAR — sinematik paket vitrini · ANASAYFANIN KALBİ (hero'dan hemen sonra; form aşağı alındı) ============ */}
      <section id="hazir-rotalar" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32" style={{ background: "linear-gradient(180deg, #061d26 0%, #0a2a36 48%, #061d26 100%)" }}>
        {/* atmosfer parıltıları (deniz + mercan) */}
        <div aria-hidden className="pointer-events-none absolute -left-40 top-24 h-[520px] w-[520px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgb(var(--lagoon) / 0.20), transparent 70%)" }} />
        <div aria-hidden className="pointer-events-none absolute -right-44 bottom-24 h-[560px] w-[560px] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgb(var(--accent) / 0.16), transparent 70%)" }} />

        <div className="container-wide relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--gold))" }}>{r("eyebrow")}</p>
            <h2 className="h-section mt-5 text-balance text-white">{r("title")}</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">{r("subtitle")}</p>
            <p className="serif-italic mx-auto mt-6 max-w-xl text-balance text-[20px] leading-relaxed sm:text-[23px]" style={{ color: "rgb(var(--gold))" }}>
              {r("promise")}
            </p>
          </Reveal>

          {/* Endişeler üstü çizili → hepsi çözüldü (kullanıcının kendi soruları) */}
          <Reveal delay={80} className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-white/45">{r("worryLead")}</span>
            {[r("worry1"), r("worry2"), r("worry3"), r("worry4")].map((w) => (
              <span key={w} className="rounded-full border px-3.5 py-1.5 text-[13px] line-through" style={{ borderColor: "rgb(255 255 255 / 0.14)", color: "rgb(255 255 255 / 0.42)" }}>{w}</span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
              <IconCheck className="h-3.5 w-3.5" /> {r("worryResolved")}
            </span>
          </Reveal>

          {/* Sinematik paket spreadleri — dönüşümlü editoryal düzen */}
          <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-24">
            {routes.map((rt, i) => {
              const flip = i % 2 === 1;
              const num = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={rt.key}>
                  <article className="route-spread group grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* GÖRSEL — tam-bleed sinematik, isim üstte büyük tipografi */}
                    <div className={`spread-img relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl sm:aspect-[16/11] lg:col-span-7 lg:aspect-auto lg:min-h-[600px] ${flip ? "lg:order-last" : ""}`}>
                      <Image src={rt.img} alt={`${rt.name} — ${rt.hotel}`} fill sizes="(max-width:1024px) 100vw, 58vw" className="object-cover" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.25) 0%, transparent 26%, rgba(4,18,24,0.55) 58%, rgba(4,18,24,0.95) 100%)" }} />
                      <div className="absolute left-5 top-5 flex flex-col gap-2">
                        <span className="w-fit rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>{rt.aud}</span>
                        <span className="glass inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold text-white" style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(4 28 40 / 0.4)" }}>
                          <IconCheck className="h-3 w-3" /> {r("curated")}
                        </span>
                      </div>
                      <div className="glass absolute right-5 top-5 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-white" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.45)" }}>
                        <span className="font-display text-xl leading-none">{rt.days}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">{r("daysWord")}</span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-9">
                        <span className="font-display text-sm tracking-[0.3em] text-white/55">{r("routeLabel")} {num}</span>
                        <span className="ml-3 text-[14px]" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(rt.stars)}</span>
                        <h3 className="font-display mt-2 font-semibold leading-[0.92] tracking-[-0.02em]" style={{ fontSize: "clamp(2.4rem, 4.6vw, 3.7rem)" }}>{rt.name}</h3>
                        <p className="mt-2 max-w-md text-[15px] text-white/85">{rt.tag}</p>
                        <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3" style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(4 28 40 / 0.4)" }}>
                          <Pin3D />
                          <span className="text-[12px] font-semibold">{rt.hotel} · {rt.loc}</span>
                        </div>
                      </div>
                    </div>

                    {/* İÇERİK — her şey dahil + gün gün + tek baskın CTA */}
                    <div className="lg:col-span-5">
                      <p className="text-[14px] leading-snug text-white/65">
                        <span className="font-semibold text-white">{r("bestForLabel")}:</span> {rt.best}
                      </p>

                      {/* "Her şey dahil" — buzlu cam panel, endişe kapatıcı */}
                      <div className="mt-5 rounded-2xl border p-5 backdrop-blur-sm" style={{ borderColor: "rgb(255 255 255 / 0.12)", backgroundColor: "rgb(255 255 255 / 0.04)" }}>
                        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "rgb(var(--gold))" }}>
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}><IconCheck className="h-3 w-3" /></span>
                          {r("allInLabel")}
                        </p>
                        <ul className="mt-3.5 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
                          {inclusions.map((inc) => (
                            <li key={inc.icon} className="flex items-center gap-2.5">
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ backgroundColor: "rgb(255 255 255 / 0.08)" }}>
                                <RouteIcon name={inc.icon} className="h-[15px] w-[15px]" />
                              </span>
                              <span className="text-[13.5px] font-medium leading-tight text-white/90">{inc.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Gün gün yolculuk — sana özel kurulmuş */}
                      <ol className="mt-6">
                        {rt.steps.map((s, si) => {
                          const newDay = si === 0 || s.day !== rt.steps[si - 1].day;
                          const last = si === rt.steps.length - 1;
                          return (
                            <li key={si} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-md" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
                                  <RouteIcon name={s.icon} className="h-[18px] w-[18px]" />
                                </span>
                                {!last && <span className="my-1 w-0.5 flex-1 rounded-full" style={{ backgroundColor: "rgb(255 255 255 / 0.14)" }} />}
                              </div>
                              <div className={last ? "pb-0" : "pb-5"}>
                                {newDay && (
                                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: "rgb(var(--gold) / 0.16)", color: "rgb(var(--gold))" }}>
                                    {r("dayLabel", { n: s.day })}
                                  </span>
                                )}
                                <p className={`font-semibold text-white ${newDay ? "mt-1.5" : ""}`}>{s.t}</p>
                                <p className="mt-0.5 text-[13.5px] leading-relaxed text-white/65">{s.d}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>

                      {/* Tek baskın aksiyon */}
                      {waReady ? (
                        <a href={routeWaLink(rt)} target="_blank" rel="noopener noreferrer" className="btn-accent mt-7 w-full justify-center py-4 text-base shadow-xl shadow-black/30">{r("ctaPick")} <IconArrow /></a>
                      ) : (
                        <Link href="/contact" className="btn-accent mt-7 w-full justify-center py-4 text-base shadow-xl shadow-black/30">{r("ctaPick")} <IconArrow /></Link>
                      )}
                      <p className="mt-3 text-center text-[12.5px] text-white/60">{r("oneMessage")}</p>
                      <p className="mx-auto mt-1 max-w-sm text-center text-[11.5px] leading-relaxed text-white/40">{r("flightsNote")} · {r("custom")}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ 4 · OTELLER ============ */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{t("hotelsEyebrow")}</p>
            <h2 className="h-section mt-5" style={{ color: "rgb(var(--foreground))" }}>{t("hotelsTitle")}</h2>
          </Reveal>
          <Reveal className="mt-12">
            <HotelCards hotels={hotels} labels={{ cta: t("hotelsCta"), bestFor: hd("bestFor"), why: hd("why"), note: hd("note") }} />
          </Reveal>
          <p className="mt-7 text-center text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
            {t("hotelsNote")}
          </p>
        </div>
      </section>

      {/* ============ 4.5 · ÖZEL PLAN — hazır paketlerden sonra, "tam uymadıysa sıfırdan kuralım" (form buraya alındı) ============ */}
      <section id="hizli-plan" className="relative scroll-mt-24 py-20 sm:py-24" style={{ backgroundColor: "rgb(var(--background))" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{plan("eyebrow")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{plan("title")}</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{plan("subtitle")}</p>
          </Reveal>
          <Reveal className="mt-10" delay={80}>
            <QuickPlanForm t={planStrings} />
          </Reveal>
        </div>
      </section>

      {/* ============ 5 · FERMUAR DENEYİMİ (scuba + Antalya — imza animasyon) ============ */}
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

      {/* ============ 6 · NEDEN ANTALYA BRIDGE (koyu deniz bandı) ============ */}
      <section className="relative overflow-hidden text-white" style={{ backgroundColor: "#07212b" }}>
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[340px] lg:min-h-full">
            <Image
              src="/images/sunset.jpg"
              alt="Kaş'ta Akdeniz gün batımı, Antalya"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 40%, #07212b 100%)" }} />
          </div>

          <div className="px-6 py-20 sm:px-12 lg:px-16 lg:py-28">
            <Reveal>
              <p className="eyebrow text-white/80">{meta("siteName")}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-section mt-6 max-w-md text-balance">{t("whyTitle")}</h2>
            </Reveal>
            <div className="mt-12 space-y-9">
              {reasons.map((rr, i) => (
                <Reveal key={rr.title} delay={i * 110}>
                  <div className="flex gap-6 border-t pt-7" style={{ borderColor: "rgb(255 255 255 / 0.14)" }}>
                    <span className="serif-italic shrink-0 text-3xl leading-none" style={{ color: "rgb(var(--gold))" }}>{rr.n}</span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold leading-snug">{rr.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/75">{rr.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={360}>
              <Link href="/about" className="link-underline mt-10 inline-flex items-center gap-2 text-sm font-semibold text-white">
                {c("learnMore")} <IconArrow />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 7 · TÜRKÇE DERSLERİ + PETLINGO (ücretsiz bonus) ============ */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--background))" }}>
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>{lh("eyebrow")}</p>
            <h2 className="h-section mt-5 max-w-md text-balance" style={{ color: "rgb(var(--foreground))" }}>{lh("title")}</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{lh("text")}</p>
            <ul className="mt-7 space-y-3">
              {[lh("c1"), lh("c2"), lh("c3")].map((cr) => (
                <li key={cr} className="flex items-center gap-3 text-[15px]" style={{ color: "rgb(var(--foreground))" }}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}><IconCheck className="h-3.5 w-3.5" /></span>
                  {cr}
                </li>
              ))}
            </ul>
            <Link href="/lessons" className="btn-accent mt-8 shadow-lg shadow-black/10">{lh("cta")} <IconArrow /></Link>
          </Reveal>

          {/* PetLingo — CANLI uygulama (Türkçe ders bonusu) */}
          <Reveal delay={120}>
            <div className="relative flex flex-col items-center">
              <span className="z-10 mb-4 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>
                🎁 {lh("bonusBadge")}
              </span>
              <div className="relative flex justify-center">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[115%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgb(var(--accent2) / 0.24), rgb(var(--lagoon) / 0.10) 45%, transparent 70%)" }} />
                <div className="phone-mock float-soft relative">
                  <div className="phone-notch" />
                  <div className="phone-screen"><PetLingoLive /></div>
                  <span className="ai-pulse absolute -right-2 -top-2 z-10 grid h-11 w-11 place-items-center rounded-full text-white shadow-xl" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 3.6L17 8.2l-3.4 1.6L12 13.4l-1.6-3.6L7 8.2l3.4-1.6z" fill="currentColor" stroke="none" /><circle cx="18" cy="17" r="1.3" fill="currentColor" stroke="none" /></svg>
                  </span>
                </div>
              </div>
              <p className="mt-6 text-center text-[13px] font-semibold" style={{ color: "rgb(var(--primary))" }}>{x("pl_own")} · {x("pl_ai")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 8 · TÜRKİYE'DE EĞİTİM (ikincil bölüm) ============ */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
        <div className="container-wide">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <figure className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-xl">
                <AutoVideo className="absolute inset-0 h-full w-full object-cover" src="/media/turkish-flag-boat.mp4" poster="/images/turkish-flag.jpg" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 55%, rgba(4,18,24,0.45) 100%)" }} />
              </figure>
            </Reveal>
            <Reveal className="lg:col-span-7" delay={100}>
              <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>{st("eyebrow")}</p>
              <h2 className="h-section mt-5 max-w-md text-balance" style={{ color: "rgb(var(--foreground))" }}>{st("title")}</h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{st("text")}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[st("f1"), st("f2"), st("f3"), st("f4")].map((f) => (
                  <div key={f} className="flex items-start gap-3 rounded-2xl border p-4 text-[15px]" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))", color: "rgb(var(--foreground))" }}>
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: "rgb(var(--primary))" }}><IconCheck className="h-3 w-3" /></span>
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/education" className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>
                {st("cta")} <IconArrow />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ 8.5 · MİSAFİR SÖZLERİ (dürüst yorum paneli) ============ */}
      <GuestVoices
        labels={{
          eyebrow: v("eyebrow"),
          title: v("title"),
          honest: v("honest"),
          emptyTitle: v("emptyTitle"),
          emptyText: v("emptyText"),
          serve: v("serve"),
          cta: v("cta"),
        }}
        reviews={[]}
      />

      {/* ============ 9 · ÖDEME & GÜVEN ============ */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--background))" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{trust("eyebrow")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{trust("title")}</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{trust("body")}</p>
          </Reveal>

          {/* Ödeme yöntemleri */}
          <Reveal className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2" delay={80}>
            {[
              { t: pay("kaspiTitle"), d: pay("kaspiText"), ic: "💳", c: "#E4002B" },
              { t: pay("cryptoTitle"), d: pay("cryptoText"), ic: "₿", c: "#f59e0b" },
            ].map((p) => (
              <div key={p.t} className="flex items-center gap-4 rounded-3xl border p-5" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-white" style={{ backgroundColor: p.c }}>{p.ic}</span>
                <div>
                  <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{p.t}</p>
                  <p className="mt-0.5 text-sm" style={{ color: "rgb(var(--muted-foreground))" }}>{p.d}</p>
                </div>
              </div>
            ))}
          </Reveal>

          {/* Güven noktaları */}
          <Reveal className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3" delay={140}>
            {[trust("p1"), trust("p2"), trust("p3"), trust("p4"), trust("p5")].map((p) => (
              <div key={p} className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[13px] font-medium" style={{ backgroundColor: "rgb(var(--muted) / 0.6)", color: "rgb(var(--foreground))" }}>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ backgroundColor: "rgb(var(--primary))" }}><IconCheck className="h-3 w-3" /></span>
                {p}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============ 9.5 · MİNİ SSS (itiraz giderme) ============ */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{x("faq_eyebrow")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{f("title")}</h2>
          </Reveal>
          <Reveal className="mt-12">
            <FaqAccordion items={faqItems} />
          </Reveal>
        </div>
      </section>

      {/* ============ 10 · SON CTA ============ */}
      <section className="relative">
        <Reveal className="relative flex min-h-[460px] items-center justify-center overflow-hidden px-6 py-24 text-center text-white sm:min-h-[540px]">
          <Image
            src="/images/lagoon.jpg"
            alt="Ölüdeniz Mavi Lagün — turkuaz deniz ve yamaç paraşütü"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgb(4 18 24 / 0.55), rgb(4 18 24 / 0.78))" }} />
          <div className="relative z-10 mx-auto max-w-2xl">
            <p className="eyebrow justify-center text-white/80">{meta("siteName")}</p>
            <h2 className="h-section mt-6 text-balance">{t("ctaTitle")}</h2>
            <p className="mx-auto mt-5 max-w-lg text-lg text-white/85">{t("ctaText")}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="#hizli-plan" className="btn-accent shadow-xl shadow-black/30">
                {t("ctaCta")} <IconArrow />
              </Link>
              <Link href="/contact" className="btn-ghost-light glass">
                {c("contactUs")}
              </Link>
            </div>
            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/65">
              <span className="inline-flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5" /> {t("heroProof3")}</span>
              <span className="inline-flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5" /> {t("heroProof1")}</span>
              <span className="inline-flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5" /> {t("heroProof2")}</span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* Mobil sabit "Tatil planı iste" pili */}
      <MobilePlanCta label={t("heroCtaPrimary")} />
    </>
  );
}
