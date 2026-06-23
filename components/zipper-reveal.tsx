"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type ZipItem = { name: string; sub: string; img: string; video?: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const TEETH = 64; // her kenarda diş sayısı

/**
 * GERÇEK fermuar — mavi-deniz dokulu iki yarı `clip-path` ile "V" gibi açılır;
 * üstte SVG ile birbirine geçmiş dişler + metalik sürgü (dil) aşağı iner.
 * Sürgünün üstü açık (içerik görünür), altı kapalı (dişler kenetli). Scroll-sürücü,
 * sadece clip-path/transform → akıcı. Yalnız aktif video oynar.
 */
export function ZipperReveal({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const leftSea = useRef<HTMLDivElement>(null);
  const rightSea = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const leftT = useRef<Array<SVGRectElement | null>>([]);
  const rightT = useRef<Array<SVGRectElement | null>>([]);
  const sliderRef = useRef<SVGGElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".zip-card"));
    const N = items.length;
    let activeIdx = -1;
    let W = window.innerWidth;
    let H = window.innerHeight;

    const sizeSvg = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      svgRef.current?.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };

    const apply = () => {
      const cx = W / 2;
      const total = root.offsetHeight - H;
      const top = root.getBoundingClientRect().top;
      const scrolled = clamp(-top, 0, total);
      const introPx = H * 0.95;
      const open = clamp(scrolled / introPx); // ilk ~1 ekranda tam açılır
      const after = Math.max(1, total - introPx);
      const cp = clamp((scrolled - introPx) / after);
      const idx = clamp(Math.floor(cp * (N - 0.0001)), 0, N - 1);

      const sliderY = open * H;
      const gapTop = W * 0.5 * open;

      // Deniz yarıları — V açılışı (clip-path)
      if (leftSea.current) leftSea.current.style.clipPath = `polygon(0 0, ${(cx - gapTop).toFixed(1)}px 0, ${cx.toFixed(1)}px ${sliderY.toFixed(1)}px, ${cx.toFixed(1)}px ${H}px, 0 ${H}px)`;
      if (rightSea.current) rightSea.current.style.clipPath = `polygon(${W}px 0, ${(cx + gapTop).toFixed(1)}px 0, ${cx.toFixed(1)}px ${sliderY.toFixed(1)}px, ${cx.toFixed(1)}px ${H}px, ${W}px ${H}px)`;

      // Dişler — kenar çizgisi boyunca
      const spacing = H / TEETH;
      for (let i = 0; i < TEETH; i++) {
        const yL = i * spacing + spacing * 0.5;
        const yR = i * spacing + spacing; // sağ dişler yarım kaydık → kenetlenme
        const tL = yL < sliderY ? 1 - yL / sliderY : 0;
        const tR = yR < sliderY ? 1 - yR / sliderY : 0;
        const lx = cx - gapTop * tL;
        const rx = cx + gapTop * tR;
        const lt = leftT.current[i];
        const rt = rightT.current[i];
        if (lt) {
          lt.setAttribute("x", (lx - 13).toFixed(1));
          lt.setAttribute("y", (yL - 5).toFixed(1));
          lt.style.opacity = yL > H ? "0" : "1";
        }
        if (rt) {
          rt.setAttribute("x", (rx - 1).toFixed(1));
          rt.setAttribute("y", (yR - 5).toFixed(1));
          rt.style.opacity = yR > H ? "0" : "1";
        }
      }
      // Sürgü (dil)
      if (sliderRef.current) {
        sliderRef.current.setAttribute("transform", `translate(${cx.toFixed(1)}, ${sliderY.toFixed(1)})`);
        sliderRef.current.style.opacity = String(1 - clamp((open - 0.9) * 8));
      }

      if (headRef.current) headRef.current.style.opacity = String(clamp((open - 0.55) * 2.4));
      if (contentRef.current) contentRef.current.style.transform = `scale(${(1 + (1 - open) * 0.1).toFixed(3)})`;

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

    sizeSvg();
    if (reduce) {
      if (leftSea.current) leftSea.current.style.clipPath = "polygon(0 0, 0 0, 0 100%, 0 100%)";
      if (rightSea.current) rightSea.current.style.clipPath = "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)";
      cards.forEach((c, k) => (c.style.opacity = k === 0 ? "1" : "0"));
      return;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { apply(); ticking = false; });
    };
    const onResize = () => { sizeSvg(); apply(); };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${items.length * 58 + 70}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* İÇERİK — fermuar açılınca görünür, sana doğru gelir */}
        <div ref={contentRef} className="absolute inset-0 will-change-transform">
          {items.map((it, k) => (
            <div key={it.name} className="zip-card absolute inset-0 will-change-[transform,opacity]" style={{ opacity: k === 0 ? 1 : 0 }}>
              <Image src={it.img} alt={it.name} fill sizes="100vw" className="object-cover" />
              {it.video && (
                <video ref={(el) => { vids.current[k] = el; }} className="absolute inset-0 h-full w-full object-cover" src={it.video} poster={it.img} muted loop playsInline preload="none" aria-hidden />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,18,28,0.3) 0%, transparent 30%, transparent 52%, rgba(2,18,28,0.85) 100%)" }} />
              <div className="container-wide absolute inset-x-0 bottom-0 z-10 flex items-end justify-between pb-20 text-white sm:pb-28">
                <div>
                  <span className="tracking-widest2 block text-[11px] uppercase text-white/65">{it.sub}</span>
                  <h3 className="font-display mt-2 font-semibold leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(2.4rem, 7.5vw, 5.5rem)" }}>{it.name}</h3>
                </div>
                <span className="font-display hidden text-4xl text-white/30 sm:block">{String(k + 1).padStart(2, "0")}<span className="text-xl text-white/20">/{String(items.length).padStart(2, "0")}</span></span>
              </div>
            </div>
          ))}
        </div>

        {/* Başlık */}
        <div ref={headRef} className="pointer-events-none absolute inset-x-0 top-[15%] z-30 text-center text-white" style={{ opacity: 0 }}>
          <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
          <h2 className="h-section mx-auto mt-3 max-w-2xl text-balance px-6">{title}</h2>
        </div>

        {/* DENİZ — sol/sağ yarı (clip-path V açılır) */}
        <div ref={leftSea} className="absolute inset-0 z-20" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, #0e7490 0%, #0a5f7b 45%, #053f59 100%)" }} />
          <Image src="/images/caustics.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25 mix-blend-screen" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,33,47,0.2), rgba(2,21,31,0.6))" }} />
        </div>
        <div ref={rightSea} className="absolute inset-0 z-20" style={{ clipPath: "polygon(100% 0, 50% 0, 50% 100%, 100% 100%)" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(245deg, #0e7490 0%, #0a5f7b 45%, #053f59 100%)" }} />
          <Image src="/images/caustics.jpg" alt="" fill sizes="100vw" className="object-cover opacity-25 mix-blend-screen" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,33,47,0.2), rgba(2,21,31,0.6))" }} />
        </div>

        {/* DİŞLER + SÜRGÜ (SVG) */}
        <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-30 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="tooth" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#dff6ff" />
              <stop offset="0.5" stopColor="#9fd6e6" />
              <stop offset="1" stopColor="#5fa6bd" />
            </linearGradient>
            <linearGradient id="slider" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fcd9a8" />
              <stop offset="0.5" stopColor="#f59e3c" />
              <stop offset="1" stopColor="#e1641f" />
            </linearGradient>
          </defs>
          {Array.from({ length: TEETH }).map((_, i) => (
            <rect key={`l${i}`} ref={(el) => { leftT.current[i] = el; }} width="14" height="10" rx="3" fill="url(#tooth)" />
          ))}
          {Array.from({ length: TEETH }).map((_, i) => (
            <rect key={`r${i}`} ref={(el) => { rightT.current[i] = el; }} width="14" height="10" rx="3" fill="url(#tooth)" />
          ))}
          <g ref={sliderRef}>
            <rect x="-17" y="-26" width="34" height="52" rx="9" fill="url(#slider)" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <rect x="-7" y="-20" width="14" height="40" rx="5" fill="rgba(255,255,255,0.18)" />
            <circle cx="0" cy="30" r="5" fill="url(#slider)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
            <rect x="-3.5" y="30" width="7" height="34" rx="3.5" fill="url(#slider)" />
          </g>
        </svg>
      </div>
    </section>
  );
}
