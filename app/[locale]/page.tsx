import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { DiveHero } from "@/components/dive-hero";
import { ActivitiesDive } from "@/components/activities-dive";
import { StackedReel } from "@/components/stacked-reel";
import { HotelAccordion } from "@/components/hotel-accordion";
import { AutoVideo } from "@/components/auto-video";
import { TurkishAlphabet } from "@/components/turkish-alphabet";
import { YouTubeEmbed } from "@/components/youtube-embed";
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

  // Otomatik-yüklenen görsel slotu: dosya public/images içine bırakılınca devreye girer.
  const imgOr = (name: string, fallback: string) =>
    existsSync(path.join(process.cwd(), "public", "images", name)) ? `/images/${name}` : fallback;
  const has = (name: string) => existsSync(path.join(process.cwd(), "public", "images", name));

  // Land of Legends resmi tanıtım videoları (poster = fallback kare).
  const lolInterior = "/media/lol-interior.mp4";
  const lolAqua = "/media/lol-aqua.mp4";

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
  ];

  const reasons = [
    { n: "I", title: t("why1Title"), text: t("why1Text") },
    { n: "II", title: t("why2Title"), text: t("why2Text") },
    { n: "III", title: t("why3Title"), text: t("why3Text") },
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

      {/* ============ AKTİVİTELER — sualtından tatile iniş ============ */}
      <ActivitiesDive
        eyebrow={t("actTitle")}
        scenes={[
          { kind: "video", src: "/media/act-scuba2.mp4", title: t("actScuba"), place: "Akdeniz" },
          { kind: "video", src: "/media/act-yacht.mp4", title: t("actBoat"), place: "Özel Tekne" },
          { kind: "video", src: "/media/lol-aqua.mp4", title: "Land of Legends", place: "Belek" },
          { kind: "video", src: "/media/act-beachclub.mp4", title: t("actHotels"), place: "5★ Resort" },
        ]}
      />

      {/* ============ LAND OF LEGENDS — tanıtım videolu ============ */}
      <section className="relative overflow-hidden py-24 sm:py-32" style={{ background: "radial-gradient(120% 110% at 50% 0%, #3a1d52 0%, #1a1136 50%, #0a0a1e 100%)" }}>
        <div className="container-wide grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="eyebrow" style={{ color: "rgb(251 191 80)" }}>{x("lol_eyebrow")}</p>
            <h2 className="font-display mt-5 font-semibold leading-[0.95] tracking-[-0.02em] text-white" style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}>
              The Land of <span className="serif-italic" style={{ color: "rgb(251 191 80)" }}>Legends</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">{t("lolDesc")}</p>
            <p className="mt-4 max-w-md border-l-2 pl-4 text-sm italic leading-relaxed text-white/60" style={{ borderColor: "rgb(251 191 80)" }}>
              {x("lol_takeYou")}
            </p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
              {[x("lol_h1"), x("lol_h2"), x("lol_h3"), x("lol_h4")].map((h) => (
                <div key={h} className="flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium text-white/85" style={{ borderColor: "rgb(255 255 255 / 0.14)", backgroundColor: "rgb(255 255 255 / 0.04)" }}>
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "rgb(251 191 80)" }} />
                  {h}
                </div>
              ))}
            </div>
            <Link href="/antalya" className="btn-accent mt-8">
              {c("learnMore")} <IconArrow />
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { video: lolInterior, poster: "/images/landoflegends.jpg", label: x("lol_h4"), tag: x("lol_h3") },
                { video: lolAqua, poster: "/images/coaster.jpg", label: x("lol_h2"), tag: x("lol_h1") },
              ].map((m) => (
                <figure key={m.label} className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10">
                  <AutoVideo className="absolute inset-0 h-full w-full object-cover" src={m.video} poster={m.poster} />
                  <div className="img-scrim absolute inset-0" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4">
                    <span className="tracking-widest2 block text-[9px] uppercase" style={{ color: "rgb(251 191 80)" }}>{m.tag}</span>
                    <span className="font-display mt-1 block text-lg leading-tight text-white">{m.label}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl ring-1 ring-white/10">
              <YouTubeEmbed id="jB0xnYf4GrM" title="Rixos World The Land of Legends — tanıtım" />
            </div>
            <p className="mt-3 text-center text-xs text-white/45">{x("lol_watch")} · Rixos World</p>
          </Reveal>
        </div>
      </section>

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

      {/* ============ ANTALYA'NIN İNCİLERİ — sinematik sticky-stack reel ============ */}
      <StackedReel
        eyebrow="Antalya"
        title={t("placesTitle")}
        intro={x("ant_introText")}
        items={[
          { video: "/media/vid-kas.mp4", poster: "/images/sunset.jpg", name: "Kaş", sub: "Gün batımı" },
          { video: "/media/vid-suluada.mp4", poster: "/images/suluada.jpg", name: "Suluada", sub: "Adrasan" },
          { video: "/media/vid-olympos.mp4", poster: "/images/olympos.jpg", name: "Olympos", sub: "Çıralı" },
          { video: "/media/vid-kemer.mp4", poster: "/images/kemer.jpg", name: "Kemer", sub: "Marina" },
          { video: "/media/vid-kaleici.mp4", poster: "/images/kaleici-harbor.jpg", name: "Kaleiçi", sub: "Yat Limanı" },
          { video: "/media/vid-duden.mp4", poster: "/images/duden.jpg", name: "Düden", sub: "Şelale" },
          { video: "/media/vid-alanya-castle.mp4", poster: imgOr("alanya.jpg", "/images/sunset.jpg"), name: "Alanya Kalesi", sub: "Kızıl Kule" },
          { video: "/media/vid-alanya-kleopatra.mp4", poster: imgOr("alanya.jpg", "/images/sunset.jpg"), name: "Kleopatra", sub: "Alanya sahili" },
        ]}
      />

      {/* ============ CTA (şelale) ============ */}
      <section className="container-wide pb-24">
        <Reveal className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[2rem] px-6 py-20 text-center text-white sm:min-h-[480px]">
          <Image
            src="/images/lagoon.jpg"
            alt="Ölüdeniz Mavi Lagün — turkuaz deniz ve yamaç paraşütü"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
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
