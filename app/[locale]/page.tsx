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
import { ReadyRoutes } from "@/components/ready-routes";
import { PetLingoLive } from "@/components/petlingo-live";
import { AutoVideo } from "@/components/auto-video";
import { GuestVoices } from "@/components/guest-voices";
import { FaqAccordion } from "@/components/faq-accordion";
import { MobilePlanCta } from "@/components/mobile-plan-cta";
import { QuickPlanForm } from "@/components/quick-plan-form";
import { IconArrow, IconCheck } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { getManagedPage } from "@/lib/cms";
import { BlockRenderer } from "@/components/cms/block-renderer";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cmsPage = await getManagedPage("home", locale);
  if (cmsPage) return <BlockRenderer page={cmsPage} locale={locale} />;
  const t = await getTranslations("home");
  const c = await getTranslations("common");
  const meta = await getTranslations("meta");
  const x = await getTranslations("imm");
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

      {/* ============ 2 · HAZIR ROTALAR — sinematik paket vitrini · ANASAYFANIN KALBİ (paylaşılan ReadyRoutes bileşeni) ============ */}
      <ReadyRoutes />

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
