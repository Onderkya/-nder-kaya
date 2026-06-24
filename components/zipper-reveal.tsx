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

/* ------------------------------- MASAÜSTÜ FERMUAR ------------------------------- */
function ZipperExperience({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tapeRef = useRef<SVGPathElement>(null);
  const teethRef = useRef<SVGPathElement>(null);
  const teeth2Ref = useRef<SVGPathElement>(null);
  const seamRef = useRef<SVGPathElement>(null);
  const sliderRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
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
      const cy = H / 2;
      const total = root.offsetHeight - H;
      const top = root.getBoundingClientRect().top;
      const scrolled = clamp(-top, 0, total);
      const introPx = H * 1.05;
      const open = smooth(clamp(scrolled / introPx));
      const after = Math.max(1, total - introPx);
      const cp = clamp((scrolled - introPx) / after);
      const idx = clamp(Math.floor(cp * (N - 0.0001)), 0, N - 1);

      // Çapraz kıvrımlı dikiş (salınım YOK → boştayken sabit, jank yok).
      const span = W + H;
      const L = -0.1 * span + open * 1.2 * span;
      const amp = W * 0.13;
      const xSeam = (y: number) => L - y * 0.9 + amp * Math.sin((y / H) * Math.PI);

      const SAMP = 14;
      let d = `M${xSeam(0).toFixed(1)} 0`;
      for (let s = 1; s <= SAMP; s++) {
        const y = (H * s) / SAMP;
        d += ` L${xSeam(y).toFixed(1)} ${y.toFixed(1)}`;
      }
      const clipD = d + ` L${W} ${H} L${W} 0 Z`;
      if (cover.current) cover.current.style.clipPath = `path('${clipD}')`;
      tapeRef.current?.setAttribute("d", d);
      seamRef.current?.setAttribute("d", d);
      teethRef.current?.setAttribute("d", d);
      teeth2Ref.current?.setAttribute("d", d);

      const sx = xSeam(cy);
      const slope = -0.9 + amp * (Math.PI / H) * Math.cos((cy / H) * Math.PI);
      const deg = (Math.atan2(1, slope) * 180) / Math.PI;
      if (sliderRef.current) sliderRef.current.setAttribute("transform", `translate(${sx.toFixed(1)}, ${cy.toFixed(1)})`);
      if (bodyRef.current) bodyRef.current.setAttribute("transform", `rotate(${deg.toFixed(1)})`);

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

        <div ref={cover} className="absolute inset-0 z-20 will-change-[clip-path]" style={{ clipPath: "path('M50% 0 L50% 100% L100% 100% L100% 0 Z')" }}>
          <video className="absolute inset-0 h-full w-full object-cover" src="/media/kaputas-drone.mp4" poster="/images/kaputas.jpg" autoPlay muted loop playsInline preload="none" aria-hidden />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,148,168,0.35), rgba(5,95,123,0.45))" }} />
        </div>

        <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-30 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="tooth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f2fbff" />
              <stop offset="0.5" stopColor="#b8dfec" />
              <stop offset="1" stopColor="#5f93a6" />
            </linearGradient>
            <linearGradient id="zslider" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fdf1da" />
              <stop offset="0.45" stopColor="#e9eef2" />
              <stop offset="1" stopColor="#9fb0bb" />
            </linearGradient>
          </defs>
          <path ref={tapeRef} fill="none" stroke="#06303d" strokeWidth="34" strokeLinecap="round" opacity="0.5" />
          <path ref={teethRef} fill="none" stroke="url(#tooth)" strokeWidth="22" strokeDasharray="7 7" strokeLinecap="butt" />
          <path ref={teeth2Ref} fill="none" stroke="url(#tooth)" strokeWidth="22" strokeDasharray="7 7" strokeDashoffset="7" strokeLinecap="butt" opacity="0.92" />
          <path ref={seamRef} fill="none" stroke="#063a49" strokeWidth="2.5" opacity="0.7" />
          <g ref={sliderRef}>
            <g ref={bodyRef}>
              <rect x="-15" y="-30" width="30" height="60" rx="11" fill="url(#zslider)" stroke="#7d8c96" strokeWidth="1.4" />
              <rect x="-15" y="-7" width="30" height="14" rx="5" fill="#c3d0d8" />
              <rect x="-6" y="-26" width="12" height="20" rx="5" fill="rgba(255,255,255,0.6)" />
            </g>
            <g className="zip-pull">
              <line x1="0" y1="6" x2="0" y2="22" stroke="#aab8c0" strokeWidth="4.5" strokeLinecap="round" />
              <rect x="-10" y="20" width="20" height="30" rx="7" fill="url(#zslider)" stroke="#7d8c96" strokeWidth="1.4" />
              <circle cx="0" cy="32" r="4.5" fill="rgba(120,140,150,0.5)" />
            </g>
          </g>
        </svg>
      </div>
    </section>
  );
}
