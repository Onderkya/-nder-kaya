"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

export type ZipItem = { name: string; sub: string; img: string; video?: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

// SSR'da sorun çıkarmadan ilk boyamadan önce çalışsın.
const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * İki modlu "Antalya deneyimi":
 *  • Mobil / dokunmatik / reduced-motion → native scroll-snap galeri (tarayıcının
 *    kendi akıcılığı, sıfır rAF, sıfır clip-path, video decode yok → yağ gibi).
 *  • Masaüstü (pointer:fine, ≥1024) → imza çapraz fermuar; ama SÜREKLİ rAF yerine
 *    yalnız scroll'da tek karelik hesap (boştayken sıfır repaint).
 */
export function ZipperReveal({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  // SSR ve ilk render: hafif galeri (herkeste çalışır). Masaüstünde boyamadan önce fermuara yükselt.
  const [heavy, setHeavy] = useState(false);
  useIso(() => {
    const ok = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (ok && !reduce) setHeavy(true);
  }, []);

  return heavy ? (
    <ZipperExperience eyebrow={eyebrow} title={title} items={items} />
  ) : (
    <PlacesCarousel eyebrow={eyebrow} title={title} items={items} />
  );
}

/* ----------------------------- MOBİL / VARSAYILAN ----------------------------- */
/** Hafif, native scroll-snap yatay galeri. Görseller lazy; video yok. */
function PlacesCarousel({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  return (
    <section className="py-20 sm:py-24" style={{ backgroundColor: "#02151f" }}>
      <div className="container-wide text-center text-white">
        <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
        <h2 className="h-section mx-auto mt-3 max-w-2xl text-balance">{title}</h2>
      </div>
      <div className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2">
        {items.map((it, k) => (
          <article
            key={it.name}
            className="relative aspect-[3/4] w-[78vw] max-w-[340px] shrink-0 snap-center overflow-hidden rounded-3xl sm:w-[320px]"
          >
            <Image
              src={it.img}
              alt={it.name}
              fill
              sizes="(max-width: 640px) 78vw, 320px"
              className="object-cover"
              loading={k < 2 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,18,28,0.1) 35%, rgba(2,18,28,0.88) 100%)" }} />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="tracking-widest2 block text-[10px] uppercase text-white/65">{it.sub}</span>
              <h3 className="font-display mt-1 font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(1.8rem, 6vw, 2.4rem)" }}>{it.name}</h3>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] uppercase tracking-widest2 text-white/40">‹ kaydır ›</p>
    </section>
  );
}

/* ------------------------------ MASAÜSTÜ: DALIŞ PORTALI ------------------------------ */
/**
 * Deniz "örtüsü" ortadan büyüyen bir DAİRE ile açılır → alttaki Antalya sahnesine
 * dalış hissi. Fermuar dişleri/sürgüsü yerine kenarda ışıltılı su halkası + hafif
 * dalga (ripple). Perf: yalnız scroll'da tek kare; clip-path bir çember deliği
 * (evenodd), boştayken sıfır repaint (eski çapraz dikişten de ucuz).
 */
function ZipperExperience({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const rippleRef = useRef<SVGCircleElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".zip-card"));
    const N = items.length;
    let activeIdx = -1;
    let W = window.innerWidth;
    let H = window.innerHeight;
    let scheduled = false;

    const sizeSvg = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      svgRef.current?.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };

    // Tek karelik hesap — yalnız scroll/resize'da çağrılır (boştayken repaint yok).
    const compute = () => {
      scheduled = false;
      const cx = W / 2;
      const cy = H * 0.5;
      const total = root.offsetHeight - H;
      const top = root.getBoundingClientRect().top;
      const scrolled = clamp(-top, 0, total);
      const introPx = H * 1.05;
      const open = smooth(clamp(scrolled / introPx));
      const after = Math.max(1, total - introPx);
      const cp = clamp((scrolled - introPx) / after);
      const idx = clamp(Math.floor(cp * (N - 0.0001)), 0, N - 1);

      // Ortadan büyüyen çember. Rmax köşeye ulaşınca örtü tamamen kalkar.
      const corner = 0.5 * Math.hypot(W, H);
      const R = open * corner * 1.06;

      // Örtü = tam dikdörtgen EKSİ çember deliği (evenodd). Delik büyüdükçe sahne açılır.
      const clipD =
        `M0 0 H${W} V${H} H0 Z ` +
        `M${(cx - R).toFixed(1)} ${cy.toFixed(1)} ` +
        `a ${R.toFixed(1)} ${R.toFixed(1)} 0 1 0 ${(2 * R).toFixed(1)} 0 ` +
        `a ${R.toFixed(1)} ${R.toFixed(1)} 0 1 0 ${(-2 * R).toFixed(1)} 0 Z`;
      if (cover.current) cover.current.style.clipPath = `path(evenodd, '${clipD}')`;

      // Işıltılı su halkası + hafif dış dalga.
      const rr = R.toFixed(1);
      if (ringRef.current) { ringRef.current.setAttribute("cx", String(cx)); ringRef.current.setAttribute("cy", String(cy)); ringRef.current.setAttribute("r", rr); }
      if (glowRef.current) { glowRef.current.setAttribute("cx", String(cx)); glowRef.current.setAttribute("cy", String(cy)); glowRef.current.setAttribute("r", rr); }
      if (rippleRef.current) { rippleRef.current.setAttribute("cx", String(cx)); rippleRef.current.setAttribute("cy", String(cy)); rippleRef.current.setAttribute("r", (R + 14).toFixed(1)); }

      const fade = 1 - clamp((open - 0.92) * 12);
      if (svgRef.current) svgRef.current.style.opacity = String(fade);
      if (headRef.current) headRef.current.style.opacity = String(clamp((open - 0.6) * 2.4));
      if (contentRef.current) contentRef.current.style.transform = `scale(${(1 + (1 - open) * 0.08).toFixed(3)})`;

      for (let k = 0; k < N; k++) {
        const card = cards[k];
        if (!card) continue;
        const local = cp * N - k;
        const vis = 1 - Math.min(1, Math.abs(local) * 1.3);
        card.style.opacity = String(vis);
        card.style.transform = `scale(${(0.94 + vis * 0.06).toFixed(3)})`;
        card.style.zIndex = String(k === idx ? 2 : 1);
      }
      if (idx !== activeIdx) {
        activeIdx = idx;
        vids.current.forEach((v, i) => {
          if (!v) return;
          if (i === idx) v.play().catch(() => {});
          else v.pause();
        });
      }
    };

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(compute);
    };

    sizeSvg();
    compute();

    // Yalnız görünürken scroll dinle (boştayken hiçbir iş yok).
    let listening = false;
    const io = new IntersectionObserver(
      (es) => {
        const vis = !!es[0]?.isIntersecting;
        if (vis && !listening) {
          listening = true;
          window.addEventListener("scroll", onScroll, { passive: true });
          onScroll();
        } else if (!vis && listening) {
          listening = false;
          window.removeEventListener("scroll", onScroll);
        }
      },
      { threshold: 0 },
    );
    io.observe(root);
    window.addEventListener("resize", sizeSvg, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", sizeSvg);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${items.length * 56 + 90}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <div ref={contentRef} className="absolute inset-0 will-change-transform">
          {items.map((it, k) => (
            <div key={it.name} className="zip-card absolute inset-0" style={{ opacity: k === 0 ? 1 : 0 }}>
              <Image src={it.img} alt={it.name} fill sizes="100vw" className="object-cover" loading={k === 0 ? "eager" : "lazy"} />
              {it.video && (
                <video ref={(el) => { vids.current[k] = el; }} className="absolute inset-0 h-full w-full object-cover" src={it.video} poster={it.img} muted loop playsInline preload="none" aria-hidden />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,18,28,0.3) 0%, transparent 30%, transparent 52%, rgba(2,18,28,0.85) 100%)" }} />
              <div className="container-wide absolute inset-x-0 bottom-0 z-10 flex items-end justify-between pb-20 text-white sm:pb-28">
                <div>
                  <span className="tracking-widest2 block text-[11px] uppercase text-white/65">{it.sub}</span>
                  <h3 className="font-display mt-2 font-semibold leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(2.4rem, 7.5vw, 5.5rem)" }}>{it.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div ref={headRef} className="pointer-events-none absolute inset-x-0 top-[15%] z-40 text-center text-white" style={{ opacity: 0 }}>
          <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
          <h2 className="h-section mx-auto mt-3 max-w-2xl text-balance px-6">{title}</h2>
        </div>

        <div ref={cover} className="absolute inset-0 z-20 will-change-[clip-path]" style={{ clipPath: "path(evenodd, 'M0 0 H100 V100 H0 Z')" }}>
          <video className="absolute inset-0 h-full w-full object-cover" src="/media/kaputas-drone.mp4" poster="/images/kaputas.jpg" autoPlay muted loop playsInline preload="none" aria-hidden />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,148,168,0.35), rgba(5,95,123,0.45))" }} />
        </div>

        <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-30 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="waterRing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#8fe6f2" />
              <stop offset="1" stopColor="#2aa9c4" />
            </linearGradient>
            <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          {/* dış dalga (ripple) */}
          <circle ref={rippleRef} cx="0" cy="0" r="0" fill="none" stroke="#bfeef7" strokeWidth="1.5" opacity="0.35" />
          {/* yumuşak dış parıltı */}
          <circle ref={glowRef} cx="0" cy="0" r="0" fill="none" stroke="#6fdcec" strokeWidth="10" opacity="0.5" filter="url(#ringGlow)" />
          {/* keskin su halkası */}
          <circle ref={ringRef} cx="0" cy="0" r="0" fill="none" stroke="url(#waterRing)" strokeWidth="3.5" />
        </svg>
      </div>
    </section>
  );
}
