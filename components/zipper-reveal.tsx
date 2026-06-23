"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type ZipItem = { name: string; sub: string; img: string; video?: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10); // smootherstep — yağ gibi
const TEETH = 60;

/**
 * GERÇEK fermuar — deniz VİDEOSU iki yarı; clip-path ile KIVRIMLI "V" açılır.
 * SVG dişler kenar boyunca (kıvrımlı), metalik sürgü aşağı iner ve sarkaç gibi
 * SALLANIR. Sonunda yarılar tümüyle ekrandan çıkar → tam açılır. Sürekli rAF
 * (yalnız görünürken) → yumuşak salınım + akıcılık. Yalnız aktif video oynar.
 */
export function ZipperReveal({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const leftSea = useRef<HTMLDivElement>(null);
  const rightSea = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const leftT = useRef<Array<SVGRectElement | null>>([]);
  const rightT = useRef<Array<SVGRectElement | null>>([]);
  const sliderRef = useRef<SVGGElement>(null);
  const pullRef = useRef<SVGGElement>(null);
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
    let raf = 0;
    let running = false;

    const sizeSvg = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      svgRef.current?.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };

    const frame = () => {
      const t = performance.now();
      const cxBase = W / 2;
      const sway = Math.sin(t * 0.0011) * 7; // bütün fermuar hafif salınım
      const cx = cxBase + sway;
      const total = root.offsetHeight - H;
      const top = root.getBoundingClientRect().top;
      const scrolled = clamp(-top, 0, total);
      const introPx = H * 0.95;
      const open = smooth(clamp(scrolled / introPx)); // ease — yağ gibi
      const after = Math.max(1, total - introPx);
      const cp = clamp((scrolled - introPx) / after);
      const idx = clamp(Math.floor(cp * (N - 0.0001)), 0, N - 1);

      const unzip = clamp(open / 0.82); // V açılışı (sürgü iner)
      const full = clamp((open - 0.82) / 0.18); // son: yarılar ekrandan çıkar
      const sliderY = unzip * H;
      const gapTop = W * 0.5 * unzip;

      // Kıvrımlı kenar: x(y)
      const offset = (y: number) => (y < sliderY ? gapTop * Math.pow(1 - y / sliderY, 0.62) : 0);

      // clip-path path() — kıvrımlı V + tam açılış kayması
      const S = 9;
      let dL = "M0 0";
      let dR = `M${W} 0`;
      for (let s = 0; s <= S; s++) {
        const y = sliderY * (s / S);
        dL += ` L${(cx - offset(y)).toFixed(1)} ${y.toFixed(1)}`;
        dR += ` L${(cx + offset(y)).toFixed(1)} ${y.toFixed(1)}`;
      }
      dL += ` L${cx.toFixed(1)} ${H} L0 ${H} Z`;
      dR += ` L${cx.toFixed(1)} ${H} L${W} ${H} Z`;
      if (leftSea.current) {
        leftSea.current.style.clipPath = `path('${dL}')`;
        leftSea.current.style.transform = `translate3d(${(-full * 75).toFixed(1)}%, 0, 0)`;
      }
      if (rightSea.current) {
        rightSea.current.style.clipPath = `path('${dR}')`;
        rightSea.current.style.transform = `translate3d(${(full * 75).toFixed(1)}%, 0, 0)`;
      }

      // Dişler
      const spacing = H / TEETH;
      const teethOp = 1 - full;
      for (let i = 0; i < TEETH; i++) {
        const yL = i * spacing + spacing * 0.5;
        const yR = i * spacing + spacing;
        const lt = leftT.current[i];
        const rt = rightT.current[i];
        if (lt) {
          lt.setAttribute("x", (cx - offset(yL) - 13).toFixed(1));
          lt.setAttribute("y", (yL - 5).toFixed(1));
          lt.style.opacity = yL > H ? "0" : String(teethOp);
        }
        if (rt) {
          rt.setAttribute("x", (cx + offset(yR) - 1).toFixed(1));
          rt.setAttribute("y", (yR - 5).toFixed(1));
          rt.style.opacity = yR > H ? "0" : String(teethOp);
        }
      }
      // Sürgü + sarkan kulp (sallanır)
      if (sliderRef.current) {
        sliderRef.current.setAttribute("transform", `translate(${cx.toFixed(1)}, ${sliderY.toFixed(1)})`);
        sliderRef.current.style.opacity = String((1 - clamp((open - 0.9) * 8)) * (1 - full));
      }
      if (pullRef.current) {
        const swing = Math.sin(t * 0.0019) * 11; // kulp sarkaç gibi
        pullRef.current.setAttribute("transform", `rotate(${swing.toFixed(1)})`);
      }

      if (headRef.current) headRef.current.style.opacity = String(clamp((open - 0.6) * 2.4));
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
      raf = requestAnimationFrame(frame);
    };

    sizeSvg();
    if (reduce) {
      if (leftSea.current) leftSea.current.style.transform = "translateX(-100%)";
      if (rightSea.current) rightSea.current.style.transform = "translateX(100%)";
      cards.forEach((c, k) => (c.style.opacity = k === 0 ? "1" : "0"));
      return;
    }

    // Yalnız görünürken sürekli rAF (salınım için) çalışır.
    const io = new IntersectionObserver(
      (es) => {
        const vis = es[0]?.isIntersecting;
        if (vis && !running) { running = true; raf = requestAnimationFrame(frame); }
        else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
      },
      { threshold: 0 },
    );
    io.observe(root);
    window.addEventListener("resize", sizeSvg);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeSvg);
    };
  }, [items.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${items.length * 56 + 80}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* İÇERİK */}
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
              </div>
            </div>
          ))}
        </div>

        {/* Başlık */}
        <div ref={headRef} className="pointer-events-none absolute inset-x-0 top-[15%] z-30 text-center text-white" style={{ opacity: 0 }}>
          <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
          <h2 className="h-section mx-auto mt-3 max-w-2xl text-balance px-6">{title}</h2>
        </div>

        {/* DENİZ — gerçek su videosu, iki yarı (clip-path V) */}
        <div ref={leftSea} className="absolute inset-0 z-20 will-change-transform" style={{ clipPath: "path('M0 0 L50% 0 L50% 100% L0 100% Z')" }}>
          <video className="absolute inset-0 h-full w-full object-cover" src="/media/dive-fish.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden />
          <div className="absolute inset-0" style={{ background: "linear-gradient(115deg, rgba(14,116,144,0.55) 0%, rgba(5,63,89,0.65) 100%)" }} />
        </div>
        <div ref={rightSea} className="absolute inset-0 z-20 will-change-transform" style={{ clipPath: "path('M100% 0 L50% 0 L50% 100% L100% 100% Z')" }}>
          <video className="absolute inset-0 h-full w-full object-cover" src="/media/dive-fish.mp4" autoPlay muted loop playsInline preload="metadata" aria-hidden />
          <div className="absolute inset-0" style={{ background: "linear-gradient(245deg, rgba(14,116,144,0.55) 0%, rgba(5,63,89,0.65) 100%)" }} />
        </div>

        {/* DİŞLER + SÜRGÜ */}
        <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-30 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="tooth" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#eafaff" />
              <stop offset="0.5" stopColor="#a8dceb" />
              <stop offset="1" stopColor="#5fa6bd" />
            </linearGradient>
            <linearGradient id="zslider" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde2b8" />
              <stop offset="0.5" stopColor="#f59e3c" />
              <stop offset="1" stopColor="#dd5e1c" />
            </linearGradient>
          </defs>
          {Array.from({ length: TEETH }).map((_, i) => (
            <rect key={`l${i}`} ref={(el) => { leftT.current[i] = el; }} width="14" height="10" rx="3.5" fill="url(#tooth)" />
          ))}
          {Array.from({ length: TEETH }).map((_, i) => (
            <rect key={`r${i}`} ref={(el) => { rightT.current[i] = el; }} width="14" height="10" rx="3.5" fill="url(#tooth)" />
          ))}
          <g ref={sliderRef}>
            <rect x="-18" y="-26" width="36" height="50" rx="10" fill="url(#zslider)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.6" />
            <rect x="-7" y="-19" width="14" height="36" rx="6" fill="rgba(255,255,255,0.2)" />
            {/* sarkan kulp (sallanır) */}
            <g ref={pullRef}>
              <line x1="0" y1="22" x2="0" y2="34" stroke="url(#zslider)" strokeWidth="4" strokeLinecap="round" />
              <rect x="-9" y="34" width="18" height="26" rx="6" fill="url(#zslider)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" />
              <circle cx="0" cy="44" r="4" fill="rgba(255,255,255,0.35)" />
            </g>
          </g>
        </svg>
      </div>
    </section>
  );
}
