import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { DiveHero } from "@/components/dive-hero";
import { ZipperReveal } from "@/components/zipper-reveal";
import { HotelCards } from "@/components/hotel-cards";
import { QuickPlanForm } from "@/components/quick-plan-form";
import { IconArrow, IconCheck } from "@/components/icons";
import { siteConfig } from "@/lib/config";

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

  // Hazır rotalar — gün gün, mantıklı; uçak+otel+transfer dahil (kişiye özel).
  const routes = [
    {
      name: r("r1name"), tag: r("r1tag"), days: 5, stars: 5, hotel: "Belek", img: "/images/maxxroyal.jpg",
      plan: [
        { place: "Kaleiçi & Yat Limanı", tag: r("t_history") },
        { place: "Düden & Konyaaltı", tag: r("t_sea") },
        { place: "Aspendos & Side", tag: r("t_ancient") },
        { place: "Land of Legends", tag: r("t_park") },
        { place: "Kaputaş & Kaş", tag: r("t_sea") },
      ],
    },
    {
      name: r("r2name"), tag: r("r2tag"), days: 7, stars: 5, hotel: "Lara", img: "/images/kremlin.jpg",
      plan: [
        { place: "Karşılama & resort", tag: r("t_arrival") },
        { place: "Land of Legends Aqua", tag: r("t_aqua") },
        { place: "Kaş'ta tüplü dalış", tag: r("t_dive") },
        { place: "Özel yat turu", tag: r("t_boat") },
        { place: "Suluada", tag: r("t_sea") },
        { place: "Kemer & Olympos", tag: r("t_nature") },
        { place: "Kaleiçi", tag: r("t_history") },
      ],
    },
    {
      name: r("r3name"), tag: r("r3tag"), days: 4, stars: 4, hotel: "Kaş", img: "/images/sunset.jpg",
      plan: [
        { place: "Kaş kasabası", tag: r("t_sea") },
        { place: "Kaputaş Plajı", tag: r("t_sea") },
        { place: "Suluada tekne turu", tag: r("t_boat") },
        { place: "Kalkan & gün batımı", tag: r("t_sunset") },
      ],
    },
    {
      name: r("r4name"), tag: r("r4tag"), days: 6, stars: 5, hotel: "Belek", img: "/images/rixos.jpg",
      plan: [
        { place: "Karşılama & resort", tag: r("t_arrival") },
        { place: "Land of Legends", tag: r("t_park") },
        { place: "Aqua park", tag: r("t_aqua") },
        { place: "Konyaaltı Beach Park", tag: r("t_sea") },
        { place: "Düden & doğa", tag: r("t_nature") },
        { place: "Kaleiçi", tag: r("t_history") },
      ],
    },
  ];

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

      {/* ============ 2 · HIZLI PLAN FORMU ============ */}
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

      {/* ============ 3 · HAZIR ROTALAR ============ */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{r("eyebrow")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{r("title")}</h2>
            <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{r("subtitle")}</p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {routes.map((rt, i) => (
              <Reveal key={rt.name} delay={(i % 2) * 90}>
                <div className="card-lift group flex h-full flex-col overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5" style={{ backgroundColor: "rgb(var(--card))" }}>
                  <div className="img-zoom relative aspect-[16/10] overflow-hidden">
                    <Image src={rt.img} alt={rt.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.15) 0%, transparent 35%, rgba(4,18,24,0.55) 75%, rgba(4,18,24,0.9) 100%)" }} />
                    <div className="glass absolute right-4 top-4 flex items-center gap-2 rounded-full border px-3 py-1.5 text-white" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.45)" }}>
                      <span className="font-display text-xl leading-none">{rt.days}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">{r("daysWord")}</span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <span className="text-sm" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(rt.stars)} · {rt.hotel}</span>
                      <h3 className="font-display mt-1.5 font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)" }}>{rt.name}</h3>
                      <p className="mt-1.5 max-w-sm text-[15px] text-white/85">{rt.tag}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p className="text-[14px] leading-snug" style={{ color: "rgb(var(--muted-foreground))" }}>
                      <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{r("bestForLabel")}:</span> {r(`r${i + 1}best`)}
                    </p>
                    <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon) / 0.16), rgb(var(--primary) / 0.16))", color: "rgb(var(--primary))" }}>
                      <IconCheck className="h-3 w-3" /> {r("included")}
                    </span>
                    <span className="mt-2 text-[12px]" style={{ color: "rgb(var(--muted-foreground))" }}>{r("flightsNote")}</span>
                    <ol className="relative mt-6 flex-1 space-y-0.5 border-l-2 pl-6" style={{ borderColor: "rgb(var(--border))" }}>
                      {rt.plan.map((d, di) => (
                        <li key={di} className="relative pb-4 last:pb-0">
                          <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full font-display text-[11px] font-bold text-white shadow" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>{di + 1}</span>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{d.place}</span>
                            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ backgroundColor: "rgb(var(--accent) / 0.1)", color: "rgb(var(--accent))" }}>{d.tag}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <Link href="/contact" className="btn-accent mt-7 w-full justify-center shadow-lg shadow-black/10">{r("cta")} <IconArrow /></Link>
                    <span className="mt-3 text-center text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>{r("custom")}</span>
                  </div>
                </div>
              </Reveal>
            ))}
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

          {/* PetLingo ücretsiz bonus kartı */}
          <Reveal delay={120}>
            <div className="relative overflow-hidden rounded-[2rem] border p-8 shadow-xl" style={{ borderColor: "rgb(var(--border))", backgroundImage: "linear-gradient(150deg, rgb(var(--lagoon) / 0.10), rgb(var(--primary) / 0.06))" }}>
              <span className="absolute right-5 top-5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>
                {lh("bonusBadge")}
              </span>
              <span className="text-5xl">🐾</span>
              <h3 className="font-display mt-4 text-3xl font-semibold leading-tight" style={{ color: "rgb(var(--foreground))" }}>PetLingo</h3>
              <p className="mt-2 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>{x("pl_own")} · {x("pl_ai")}</p>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{lh("petlingoText")}</p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {[x("pl_f3"), x("pl_f4"), x("pl_f1"), x("pl_f6")].map((f) => (
                  <span key={f} className="rounded-xl px-3 py-2 text-[12px] font-medium" style={{ backgroundColor: "rgb(var(--card))", color: "rgb(var(--foreground))" }}>{f}</span>
                ))}
              </div>
              <p className="mt-5 text-[13px] font-semibold" style={{ color: "rgb(var(--accent))" }}>{x("pl_combo")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ 8 · TÜRKİYE'DE EĞİTİM (ikincil bölüm) ============ */}
      <section className="py-20 sm:py-24" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
        <div className="container-wide">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <figure className="img-zoom relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-xl">
                <Image src="/images/akdeniz-campus.jpg" alt="Akdeniz Üniversitesi" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
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
    </>
  );
}
