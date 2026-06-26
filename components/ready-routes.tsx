import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Reveal } from "@/components/reveal";
import { RouteIcon } from "@/components/route-icons";
import { Pin3D } from "@/components/hotel-cards";
import { IconArrow, IconCheck } from "@/components/icons";
import { siteConfig, whatsappLink } from "@/lib/config";

/**
 * HAZIR ROTALAR — sinematik paket vitrini. Hem ana sayfada hem "Antalya
 * Danışmanlık" (/antalya) sayfasında kullanılır; iki sayfa ayrışmasın diye
 * tek bileşen. "Her şey düşünülmüş, sadece seç" hissi:
 * koyu spot bandı · dönüşümlü editoryal spreadler · endişeler üstü çizili →
 * çözüldü · her şey dahil manifestosu · tek baskın "Bu tatili iste".
 */
export async function ReadyRoutes() {
  const r = await getTranslations("routes");
  const hd = await getTranslations("hotelsd");

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

  const inclusions = [
    { icon: "plane", label: r("inc_flight") },
    { icon: "car", label: r("inc_transfer") },
    { icon: "bed", label: r("inc_hotel") },
    { icon: "utensils", label: r("inc_board") },
    { icon: "landmark", label: r("inc_tours") },
    { icon: "headset", label: r("inc_support") },
  ];

  const waReady = siteConfig.whatsappConfigured;
  const routeWaLink = (rt: (typeof routes)[number]) =>
    whatsappLink(r("waMsg", { name: rt.name, days: rt.days, hotel: rt.hotel }));

  return (
    <section id="hazir-rotalar" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32" style={{ background: "linear-gradient(180deg, #061d26 0%, #0a2a36 48%, #061d26 100%)" }}>
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

        <Reveal delay={80} className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <span className="text-[12px] font-semibold uppercase tracking-wide text-white/45">{r("worryLead")}</span>
          {[r("worry1"), r("worry2"), r("worry3"), r("worry4")].map((w) => (
            <span key={w} className="rounded-full border px-3.5 py-1.5 text-[13px] line-through" style={{ borderColor: "rgb(255 255 255 / 0.14)", color: "rgb(255 255 255 / 0.42)" }}>{w}</span>
          ))}
          <span className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
            <IconCheck className="h-3.5 w-3.5" /> {r("worryResolved")}
          </span>
        </Reveal>

        <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-24">
          {routes.map((rt, i) => {
            const flip = i % 2 === 1;
            const num = String(i + 1).padStart(2, "0");
            return (
              <Reveal key={rt.key}>
                <article className="route-spread group grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
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

                  <div className="lg:col-span-5">
                    <p className="text-[14px] leading-snug text-white/65">
                      <span className="font-semibold text-white">{r("bestForLabel")}:</span> {rt.best}
                    </p>

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
  );
}
