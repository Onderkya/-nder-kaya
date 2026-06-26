import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { DiveHero } from "@/components/dive-hero";
import { CinematicShowcase } from "@/components/cinematic-showcase";
import { HotelAccordion } from "@/components/hotel-accordion";
import { AutoVideo } from "@/components/auto-video";
import { TurkishAlphabet } from "@/components/turkish-alphabet";
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
  const s = await getTranslations("services");
  const c = await getTranslations("common");
  const meta = await getTranslations("meta");
  const x = await getTranslations("imm");
  const r = await getTranslations("routes");
  const pay = await getTranslations("payment");

  // Otomatik-yüklenen görsel slotu: dosya public/images içine bırakılınca devreye girer.
  const imgOr = (name: string, fallback: string) =>
    existsSync(path.join(process.cwd(), "public", "images", name)) ? `/images/${name}` : fallback;
  const has = (name: string) => existsSync(path.join(process.cwd(), "public", "images", name));

  // Gerçek görseli olan oteller + kullanıcı dosya bırakınca otomatik eklenen üst-segment slotlar.
  const hotels = [
    { name: "Maxx Royal", place: "Belek", img: "/images/maxxroyal.jpg" },
    { name: "Rixos Premium", place: "Belek", img: "/images/rixos.jpg" },
    { name: "NG Phaselis", place: "Kemer", img: imgOr("hotel-ngphaselis.jpg", "/images/ngphaselis.jpg") },
    { name: "Kremlin Palace", place: "Lara", img: "/images/kremlin.jpg" },
    { name: "Miracle Resort", place: "Lara", img: "/images/pool.jpg" },
    ...[
      { name: "Titanic Deluxe", place: "Belek", file: "hotel-titanic.jpg" },
      { name: "Delphin Imperial", place: "Lara", file: "hotel-delphin.jpg" },
      { name: "Calista Luxury", place: "Belek", file: "hotel-calista.jpg" },
      { name: "Regnum Carya", place: "Belek", file: "hotel-regnum.jpg" },
      { name: "Nirvana Cosmopolitan", place: "Kemer", file: "hotel-nirvana.jpg" },
    ]
      .filter((h) => has(h.file))
      .map((h) => ({ name: h.name, place: h.place, img: `/images/${h.file}` })),
  ];

  const services = [
    { href: "/antalya", n: "01", title: s("antalyaTitle"), desc: s("antalyaDesc"), img: "/images/suluada.jpg", video: "/media/vid-suluada.mp4", place: "Suluada · Adrasan" },
    { href: "/lessons", n: "02", title: s("lessonsTitle"), desc: s("lessonsDesc"), img: imgOr("lessons-meaning.jpg", "/images/kaleici-inside.jpg"), video: "/media/les-teacher.mp4", place: "Dil öğrenimi" },
    { href: "/education", n: "03", title: s("educationTitle"), desc: s("educationDesc"), img: "/images/akdeniz-campus.jpg", video: "/media/campus-aerial.mp4", place: "Akdeniz Üniversitesi" },
    { href: "/contact", n: "04", title: s("itTitle"), desc: s("itDesc"), img: "/images/harbor-night.jpg", video: "/media/office-consult.mp4", place: "Web · Mobil · AI" },
  ];

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

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: meta("siteName"),
          description: meta("description"),
          url: siteConfig.url,
          areaServed: "Antalya, Türkiye",
          email: siteConfig.email,
        }}
      />

      {/* ============ HERO — Kaputaş "denize dalış" ============ */}
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
        proof={[t("heroProof1"), t("heroProof2"), t("heroProof3")]}
        aerialVideo="/media/kaputas-drone.mp4"
      />

      {/* ============ SİNEMATİK VİTRİN — scuba + tüm yerler tek tek (editoryal) ============ */}
      <CinematicShowcase
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

      {/* ============ OTELLER (telifsiz / CC) ============ */}
      <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{t("hotelsEyebrow")}</p>
            <h2 className="h-section mt-5" style={{ color: "rgb(var(--foreground))" }}>{t("hotelsTitle")}</h2>
          </Reveal>
          <Reveal className="mt-12">
            <HotelAccordion hotels={hotels} ctaLabel={c("learnMore")} />
          </Reveal>
          <p className="mt-7 text-center text-xs" style={{ color: "rgb(var(--muted-foreground))" }}>
            5★ resort koordinasyonu — Belek · Lara · Kemer. Üstüne gel, fermuar gibi açılsın. Sana en uygun oteli ve fiyatı birlikte seçelim.
          </p>
        </div>
      </section>

      {/* ============ HAZIR ROTALAR — gün gün, uçak+otel+transfer dahil ============ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "rgb(var(--background))" }}>
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
                  {/* Sinematik görsel başlık */}
                  <div className="img-zoom relative aspect-[16/10] overflow-hidden">
                    <Image src={rt.img} alt={rt.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.15) 0%, transparent 35%, rgba(4,18,24,0.55) 75%, rgba(4,18,24,0.9) 100%)" }} />
                    {/* Süre + yıldız rozeti */}
                    <div className="glass absolute right-4 top-4 flex items-center gap-2 rounded-full border px-3 py-1.5 text-white" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.45)" }}>
                      <span className="font-display text-xl leading-none">{rt.days}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">{r("daysWord")}</span>
                    </div>
                    {/* İsim + hayal cümlesi */}
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <span className="text-sm" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(rt.stars)} · {rt.hotel}</span>
                      <h3 className="font-display mt-1.5 font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 4vw, 2.9rem)" }}>{rt.name}</h3>
                      <p className="mt-1.5 max-w-sm text-[15px] text-white/85">{rt.tag}</p>
                    </div>
                  </div>
                  {/* Gün gün — dikey zaman çizgisi */}
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon) / 0.16), rgb(var(--primary) / 0.16))", color: "rgb(var(--primary))" }}>
                      ✈ {r("included")}
                    </span>
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

      {/* ============ ÖDEME — Kaspi (KZ) + Kripto ============ */}
      <section className="container-wide pb-4">
        <Reveal className="grid gap-4 sm:grid-cols-2">
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
      </section>

      {/* ============ SANA ÖZEL (satış bandı) ============ */}
      <section className="relative overflow-hidden py-24 text-white sm:py-32" style={{ background: "linear-gradient(135deg, #0d94a8 0%, #0e7490 45%, #f45e23 140%)" }}>
        <div className="dot-drift absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        <span className="sheen" />
        <div className="container-wide relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow text-white/85">{x("sell_eyebrow")}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-section mt-5 text-balance">{x("sell_title")}</h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90">{x("sell_text")}</p>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <ul className="space-y-4">
              {[x("sell_b1"), x("sell_b2"), x("sell_b3")].map((b) => (
                <li key={b} className="flex items-start gap-4 rounded-2xl border p-5 text-lg font-medium" style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(255 255 255 / 0.08)" }}>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "rgb(255 255 255 / 0.22)" }}>
                    <IconCheck className="h-4 w-4" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="btn-accent mt-8 shadow-xl shadow-black/25">
              {x("sell_cta")} <IconArrow />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ MANİFESTO ============ */}
      <section className="container-wide py-20 sm:py-28 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>
                {meta("siteName")}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="h-section mt-6 max-w-2xl text-balance" style={{ color: "rgb(var(--foreground))" }}>
                {meta("tagline")}
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                {meta("description")}
              </p>
            </Reveal>
            <Reveal delay={240}>
              <Link
                href="/about"
                className="link-underline mt-8 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "rgb(var(--primary))" }}
              >
                {c("learnMore")} <IconArrow />
              </Link>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal className="reveal-clip" delay={120}>
              <figure className="img-zoom relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="/images/kaleici-harbor.jpg"
                  alt="Kaleiçi Yat Limanı, Antalya"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                <figcaption className="img-scrim-soft absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                  <span className="font-display text-2xl leading-none">Kaleiçi</span>
                  <span className="tracking-widest2 text-[10px] uppercase text-white/70">Antalya</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ HİZMETLER (premium editoryal) ============ */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "rgb(var(--background))" }}>
        <div className="container-wide">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{t("servicesSubtitle")}</p>
            <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>
              {t("servicesTitle")}
            </h2>
          </Reveal>

          <div className="mt-16 space-y-20 sm:space-y-28">
            {services.map((srv, i) => (
              <Reveal key={srv.href}>
                <Link href={srv.href} className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                  <div className={`img-zoom relative aspect-[16/11] overflow-hidden rounded-[2rem] shadow-xl ${i % 2 ? "lg:order-2" : ""}`}>
                    <Image src={srv.img} alt={srv.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
                    {srv.video ? (
                      <AutoVideo className="absolute inset-0 h-full w-full object-cover" src={srv.video} poster={srv.img} />
                    ) : null}
                    <div className="img-scrim-soft absolute inset-0" />
                    <span className="absolute left-7 top-6 font-display text-5xl text-white/85">{srv.n}</span>
                    <span className="tracking-widest2 absolute bottom-6 left-7 text-[10px] uppercase text-white/70">{srv.place}</span>
                  </div>
                  <div className={i % 2 ? "lg:order-1" : ""}>
                    <span className="serif-italic text-2xl" style={{ color: "rgb(var(--gold))" }}>{srv.n}</span>
                    <h3 className="font-display mt-3 font-semibold leading-tight" style={{ color: "rgb(var(--foreground))", fontSize: "clamp(1.9rem, 3vw, 2.7rem)" }}>
                      {srv.title}
                    </h3>
                    <p className="mt-5 max-w-md text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                      {srv.desc}
                    </p>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "rgb(var(--primary))" }}>
                      {c("learnMore")}
                      <span className="transition-transform duration-300 group-hover:translate-x-1"><IconArrow /></span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ IT / YAZILIM DANIŞMANLIĞI (özel alan) ============ */}
      <section className="relative overflow-hidden py-24 text-white sm:py-28" style={{ background: "radial-gradient(120% 120% at 80% 0%, #11324a 0%, #0a2030 45%, #060f18 100%)" }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(120,220,240,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(120,220,240,0.6) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="container-wide relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow" style={{ color: "rgb(120 230 255)" }}>{s("it_eyebrow")}</p>
            <h2 className="font-display mt-5 font-semibold leading-[1.0] tracking-[-0.02em]" style={{ fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)" }}>{s("itTitle")}</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">{s("it_lead")}</p>
            <Link href="/contact" className="btn-accent mt-8 shadow-xl shadow-black/30">{s("it_cta")} <IconArrow /></Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { t: s("it_f1"), ic: "M9 18l6-6-6-6" },
                { t: s("it_f2"), ic: "M4 7h16M4 12h16M4 17h10" },
                { t: s("it_f3"), ic: "M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" },
                { t: s("it_f4"), ic: "M20 6 9 17l-5-5" },
              ].map((f) => (
                <div key={f.t} className="rounded-2xl border p-5" style={{ borderColor: "rgb(255 255 255 / 0.12)", backgroundColor: "rgb(255 255 255 / 0.04)" }}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ backgroundColor: "rgb(120 230 255 / 0.14)" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(120 230 255)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={f.ic} /></svg>
                  </span>
                  <p className="mt-4 text-[15px] font-medium leading-snug text-white/90">{f.t}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ TÜRKÇE ALFABE ============ */}
      <TurkishAlphabet
        eyebrow="A — Z"
        title={s("lessonsTitle")}
        desc={s("lessonsDesc")}
        cta={c("learnMore")}
      />

      {/* ============ NEDEN BİZ (koyu deniz bandı) ============ */}
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
              {reasons.map((r, i) => (
                <Reveal key={r.title} delay={i * 110}>
                  <div className="flex gap-6 border-t pt-7" style={{ borderColor: "rgb(255 255 255 / 0.14)" }}>
                    <span className="serif-italic shrink-0 text-3xl leading-none" style={{ color: "rgb(var(--gold))" }}>{r.n}</span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold leading-snug">{r.title}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/75">{r.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA (tam genişlik bant) ============ */}
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
              <Link href="/contact" className="btn-accent shadow-xl shadow-black/30">
                {t("heroCtaPrimary")} <IconArrow />
              </Link>
              <Link href="/lessons" className="btn-ghost-light glass">
                {c("bookNow")}
              </Link>
            </div>
            <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/65">
              <span className="inline-flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5" /> {t("why3Title")}</span>
              <span className="inline-flex items-center gap-1.5"><IconCheck className="h-3.5 w-3.5" /> {t("why1Title")}</span>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
