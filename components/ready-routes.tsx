import { getTranslations, getLocale } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { IconCheck } from "@/components/icons";
import { RouteGallery } from "@/components/route-gallery";
import { getPublicSettings } from "@/lib/settings";
import { getAssetMap, pickAssetVisible, getHiddenAssetSet } from "@/lib/assets";
import { getTourCfgs, pickL10n, tourOrder } from "@/lib/tours";
import { DEFAULT_STEPS, DEFAULT_INCLUDED } from "@/lib/tour-defaults";
import { faIconData } from "@/components/fa-icon";
import type { TourIconData } from "@/components/tour-icon";

/**
 * İkon adını client'a güvenle geçen SERİLEŞTİRİLEBİLİR biçime çözer:
 * `fa:faXxx` → `{fa:{viewBox,paths}}` (server-side veri çıkarımı), aksi hâlde
 * legacy `{name}` (client RouteIcon çizer). Böylece @fortawesome client'a girmez.
 * NOT: `fa:` önekli bir ikon bulunamazsa legacy'ye düşer (RouteIcon fallback).
 */
const resolveIcon = (name: string): TourIconData => {
  const fa = faIconData(name);
  return fa ? { fa } : { name };
};

/**
 * HAZIR ROTALAR — modern, kompakt paket vitrini. Sade kartlar yan yana (ızgara);
 * tıklayınca animasyonlu detay modalı açılır ("içine gir"). Hem ana sayfa hem
 * "Antalya Danışmanlık" (/antalya) sayfasında kullanılır (tek kaynak).
 * Veri + i18n burada (server) hazırlanır, etkileşim RouteGallery'de (client).
 */
export async function ReadyRoutes() {
  const r = await getTranslations("routes");
  const hd = await getTranslations("hotelsd");
  const locale = await getLocale();
  const A = await getAssetMap();
  const H = await getHiddenAssetSet();

  // Özel turlarda kullanılan ortak baş adımlar (uçuş/transfer) — kodlu turların
  // adımları artık tek kaynaktan (DEFAULT_STEPS) gelir.
  const flightStep = { icon: "plane", day: 1, t: r("st_flight_t"), d: r("st_flight_d") };
  const transferStep = { icon: "car", day: 1, t: r("st_transfer_t"), d: r("st_transfer_d") };

  // Kodlu tur adımları: tek kaynaktan (lib/tour-defaults) çeviri anahtarlarını çözerek.
  const stepsOf = (key: string) =>
    DEFAULT_STEPS[key].map((s) => ({ icon: s.icon, day: s.day, t: r(s.tKey), d: r(s.dKey) }));

  const baseRoutes = [
    {
      key: "r1", name: r("r1_name"), tag: r("r1_tag"), best: r("r1_best"), aud: r("aud_classic"),
      days: 3, stars: 5, hotel: "Lara Barut Collection", loc: hd("larabarut_loc"), img: pickAssetVisible(A, H, "route.r1.image", "/images/hotels/lara-barut.jpg"),
      steps: stepsOf("r1"),
    },
    {
      key: "r2", name: r("r2_name"), tag: r("r2_tag"), best: r("r2_best"), aud: r("aud_classic"),
      days: 5, stars: 5, hotel: "Cullinan Belek", loc: hd("cullinan_loc"), img: pickAssetVisible(A, H, "route.r2.image", "/images/hotels/cullinan-belek.jpg"),
      steps: stepsOf("r2"),
    },
    {
      key: "r3", name: r("r3_name"), tag: r("r3_tag"), best: r("r3_best"), aud: r("aud_honeymoon"),
      days: 5, stars: 5, hotel: "NG Phaselis Bay", loc: hd("ngphaselis_loc"), img: pickAssetVisible(A, H, "route.r3.image", "/images/hotels/ng-phaselis-bay.jpg"),
      steps: stepsOf("r3"),
    },
    {
      key: "r4", name: r("r4_name"), tag: r("r4_tag"), best: r("r4_best"), aud: r("aud_family"),
      days: 7, stars: 5, hotel: "Land of Legends Kingdom", loc: hd("legends_loc"), img: pickAssetVisible(A, H, "route.r4.image", "/images/hotels/land-of-legends-kingdom.jpg"),
      steps: stepsOf("r4"),
    },
    {
      key: "r5", name: r("r5_name"), tag: r("r5_tag"), best: r("r5_best"), aud: r("aud_luxury"),
      days: 7, stars: 5, hotel: "Maxx Royal Kemer", loc: hd("maxxkemer_loc"), img: pickAssetVisible(A, H, "route.r5.image", "/images/hotels/maxx-royal-kemer.jpg"),
      steps: stepsOf("r5"),
    },
  ];

  // Rota → otel (hotelsd) eşlemesi: detay sayfasında otelin gerçek tanıtımı + konumu.
  const hkeyOf: Record<string, string> = { r1: "larabarut", r2: "cullinan", r3: "ngphaselis", r4: "legends", r5: "maxxkemer" };

  // ADMIN TUR AYARLARI (Turlar sayfası): sıra / aktif-pasif / foto / isim-rozet
  // override + sıfırdan eklenen özel turlar. Kayıt yoksa kodlu varsayılan aynen.
  const cfgs = await getTourCfgs();
  const cfgOf = new Map(cfgs.map((c) => [c.key, c]));

  const mergedBase = baseRoutes
    .map((rt) => {
      const c = cfgOf.get(rt.key);
      // cfg yoksa: img slotu gizliyse (null) undefined'a normalize (degrade kalır), aksi hâlde birebir.
      if (!c) return { ...rt, img: rt.img || undefined };
      // Kodlu turda adım override'ı: cfg.steps varsa adımlar oradan gelir
      // (active===false atlanır; L10n pickL10n; icon yoksa "landmark"); yoksa DEFAULT_STEPS.
      const steps = c.steps?.length
        ? c.steps
            .filter((s) => s.active !== false)
            .map((s) => ({ icon: s.icon ?? "landmark", day: s.day, t: pickL10n(s.t, locale), d: pickL10n(s.d, locale) }))
        : rt.steps;
      return {
        ...rt,
        name: pickL10n(c.name, locale) || rt.name,
        aud: pickL10n(c.aud, locale) || rt.aud,
        days: c.days ?? rt.days,
        stars: c.stars ?? rt.stars,
        hotel: c.hotel?.trim() || rt.hotel,
        loc: c.loc?.trim() || rt.loc,
        // Slot gizliyse (rt.img null) ve cfg override yoksa görsel çizilmez (degrade kalır).
        img: c.img?.trim() || rt.img || undefined,
        steps,
      };
    })
    .filter((rt) => cfgOf.get(rt.key)?.active !== false);

  // Özel (admin'in sıfırdan eklediği) turlar.
  const customRoutes = cfgs
    .filter((c) => c.custom && c.active !== false)
    .map((c) => ({
      key: c.key,
      name: pickL10n(c.name, locale),
      tag: "",
      best: "",
      aud: pickL10n(c.aud, locale),
      days: c.days ?? 5,
      stars: c.stars ?? 5,
      hotel: c.hotel?.trim() || "",
      loc: c.loc?.trim() || "Antalya",
      img: c.img?.trim() || "/images/kaputas.jpg",
      steps: [
        flightStep,
        transferStep,
        ...(c.steps ?? [])
          .filter((s) => s.active !== false)
          .map((s) => ({ icon: s.icon ?? "landmark", day: s.day, t: pickL10n(s.t, locale), d: pickL10n(s.d, locale) })),
      ],
      _custom: c,
    }))
    .filter((rt) => rt.name);

  const allBase = [...mergedBase, ...customRoutes].sort(
    (a, b) => tourOrder(cfgOf.get(a.key), a.key) - tourOrder(cfgOf.get(b.key), b.key),
  );

  // "Pakete dahil" varsayılan liste — cfg.included yoksa her rota bunu taşır
  // (bugünkü tek-liste davranışıyla birebir aynı çıktı).
  const defaultInclusions = DEFAULT_INCLUDED.map((i) => ({ icon: resolveIcon(i.icon), label: r(i.labelKey) }));

  const site = await getPublicSettings();
  const waReady = site.whatsappConfigured;
  const routes = allBase.map((rt) => {
    const hk = hkeyOf[rt.key];
    const c = cfgOf.get(rt.key);
    const cust = (rt as { _custom?: { hotelWhy?: Record<string, string>; hotelNote?: Record<string, string> } })._custom;
    // Included override: cfg.included varsa oradan (active!==false filtre, pickL10n label);
    // yoksa varsayılan liste. İkonlar server-side serileştirilebilir biçime çözülür.
    const inclusions = c?.included?.length
      ? c.included
          .filter((inc) => inc.active !== false)
          .map((inc) => ({ icon: resolveIcon(inc.icon), label: pickL10n(inc.label, locale) }))
      : defaultInclusions;
    return {
      ...rt,
      steps: rt.steps.map((s) => ({ icon: resolveIcon(s.icon), day: s.day, t: s.t, d: s.d, dl: r("dayLabel", { n: s.day }) })),
      inclusions,
      wa: waReady ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(r("waMsg", { name: rt.name, days: rt.days, hotel: rt.hotel }))}` : null,
      hotelWhy: hk ? hd(`${hk}_why`) : pickL10n(cust?.hotelWhy, locale),
      hotelNote: hk ? hd(`${hk}_note`) : pickL10n(cust?.hotelNote, locale),
      mapQ: encodeURIComponent(`${rt.hotel} ${rt.loc} Antalya`),
    };
  });

  const addons = [
    { key: "boat", label: r("a_boat") },
    { key: "spa", label: r("a_spa") },
    { key: "guide", label: r("a_guide") },
    { key: "vip", label: r("a_vip") },
    { key: "night", label: r("a_night") },
    { key: "dinner", label: r("a_dinner") },
  ];

  const labels = {
    daysWord: r("daysWord"),
    routeLabel: r("routeLabel"),
    bestForLabel: r("bestForLabel"),
    allInLabel: r("allInLabel"),
    ctaPick: r("ctaPick"),
    oneMessage: r("oneMessage"),
    flightsNote: r("flightsNote"),
    custom: r("custom"),
    curated: r("curated"),
    details: r("details"),
    close: r("close"),
    dayByDay: r("dayByDay"),
    priceLabel: r("priceLabel"),
    whyHotel: r("whyHotel"),
    mapTitle: r("mapTitle"),
    noteLabel: hd("note"),
    custTitle: r("custTitle"),
    custHint: r("custHint"),
    addonsTitle: r("addonsTitle"),
    addNotePh: r("addNotePh"),
    mIntro2: r("mIntro2"),
    mKept: r("mKept"),
    mRemoved: r("mRemoved"),
    mAddons: r("mAddons"),
    mNote: r("mNote"),
    tgPick: r("tgPick"),
    tgCopied: r("tgCopied"),
    contactHref: `/${locale}/contact`,
  };

  return (
    <section id="hazir-rotalar" className="relative scroll-mt-24 py-20 sm:py-28" style={{ backgroundColor: "rgb(var(--background))" }}>
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{r("eyebrow")}</p>
          <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{r("title")}</h2>
          <p className="serif-italic mx-auto mt-5 max-w-xl text-balance text-[19px] leading-relaxed sm:text-[22px]" style={{ color: "rgb(var(--primary))" }}>
            {r("promise")}
          </p>
        </Reveal>

        {/* Endişeler üstü çizili → çözüldü (kullanıcının kendi soruları) */}
        <Reveal delay={70} className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
          {[r("worry1"), r("worry2"), r("worry3"), r("worry4")].map((w) => (
            <span key={w} className="rounded-full border px-3.5 py-1.5 text-[13px] line-through" style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--muted-foreground))" }}>{w}</span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold text-white shadow-md" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
            <IconCheck className="h-3.5 w-3.5" /> {r("worryResolved")}
          </span>
        </Reveal>
      </div>

      {/* Tam ekran sonsuz marquee — container DIŞINDA, kenara kadar */}
      <RouteGallery routes={routes} addons={addons} labels={labels} />
    </section>
  );
}
