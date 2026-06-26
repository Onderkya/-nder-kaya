import { getTranslations, getLocale } from "next-intl/server";
import { Reveal } from "@/components/reveal";
import { IconCheck } from "@/components/icons";
import { RouteGallery } from "@/components/route-gallery";
import { siteConfig, whatsappLink } from "@/lib/config";

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

  const flightStep = { icon: "plane", day: 1, t: r("st_flight_t"), d: r("st_flight_d") };
  const transferStep = { icon: "car", day: 1, t: r("st_transfer_t"), d: r("st_transfer_d") };
  const checkin = (ckKey: string) => ({ icon: "bed", day: 1, t: r("st_checkin_t"), d: r(ckKey) });

  const baseRoutes = [
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

  const waReady = siteConfig.whatsappConfigured;
  const routes = baseRoutes.map((rt) => ({
    ...rt,
    steps: rt.steps.map((s) => ({ ...s, dl: r("dayLabel", { n: s.day }) })),
    wa: waReady ? whatsappLink(r("waMsg", { name: rt.name, days: rt.days, hotel: rt.hotel })) : null,
  }));

  const inclusions = [
    { icon: "plane", label: r("inc_flight") },
    { icon: "car", label: r("inc_transfer") },
    { icon: "bed", label: r("inc_hotel") },
    { icon: "utensils", label: r("inc_board") },
    { icon: "landmark", label: r("inc_tours") },
    { icon: "headset", label: r("inc_support") },
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

        <RouteGallery routes={routes} inclusions={inclusions} labels={labels} />
      </div>
    </section>
  );
}
