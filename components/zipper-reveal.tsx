"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type ZipItem = { name: string; sub: string; img: string; video?: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

/**
 * ÇAPRAZ fermuar (Coca-Cola "real magic" tarzı) — turkuaz deniz örtüsü, kıvrımlı
 * çapraz dikiş boyunca GERÇEK metal dişler (kalın dash stroke) + metalik sürgü
 * (sallanan kulp). Scroll'la dikiş çapraz süpürür, deniz açılıp içeriği gösterir.
 * Yalnız görünürken rAF (yumuşak salınım). Yalnız aktif video oynar.
 */
export function ZipperReveal({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tapeRef = useRef<SVGPathElement>(null);
  const teethRef = useRef<SVGPathElement>(null);
  const teeth2Ref = useRef<SVGPathElement>(null);
  const seamRef = useRef<SVGPathElement>(null);
  const sliderRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
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
      const cy = H / 2;
      const total = root.offsetHeight - H;
      const top = root.getBoundingClientRect().top;
      const scrolled = clamp(-top, 0, total);
      const introPx = H * 1.05;
      const open = smooth(clamp(scrolled / introPx));
      const after = Math.max(1, total - introPx);
      const cp = clamp((scrolled - introPx) / after);
      const idx = clamp(Math.floor(cp * (N - 0.0001)), 0, N - 1);

      // Çapraz kıvrımlı dikiş: x(y) = L - y + bulge ; L süpürür → açılır.
      const span = W + H;
      const L = -0.1 * span + open * 1.2 * span + Math.sin(t * 0.0011) * 10; // salınım
      const amp = W * 0.13;
      const xSeam = (y: number) => L - y * 0.9 + amp * Math.sin((y / H) * Math.PI);

      // Dikiş path + örtü clip-path (dikişin sağı kapalı)
      const SAMP = 16;
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

      // Sürgü — dikiş orta noktasında, dikişe hizalı; kulp aşağı sarkar/sallanır
      const sx = xSeam(cy);
      const slope = -0.9 + amp * (Math.PI / H) * Math.cos((cy / H) * Math.PI); // dx/dy
      const deg = (Math.atan2(1, slope) * 180) / Math.PI; // dikiş yönü
      if (sliderRef.current) sliderRef.current.setAttribute("transform", `translate(${sx.toFixed(1)}, ${cy.toFixed(1)})`);
      if (bodyRef.current) bodyRef.current.setAttribute("transform", `rotate(${deg.toFixed(1)})`);
      if (pullRef.current) pullRef.current.setAttribute("transform", `rotate(${(Math.sin(t * 0.0019) * 12).toFixed(1)})`);

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
      raf = requestAnimationFrame(frame);
    };

    sizeSvg();
    if (reduce) {
      if (cover.current) cover.current.style.opacity = "0";
      cards.forEach((c, k) => (c.style.opacity = k === 0 ? "1" : "0"));
      return;
    }

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
    <section ref={rootRef} className="relative" style={{ height: `${items.length * 56 + 90}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* İÇERİK (dikişin solu — açılınca görünür) */}
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
        <div ref={headRef} className="pointer-events-none absolute inset-x-0 top-[15%] z-40 text-center text-white" style={{ opacity: 0 }}>
          <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
          <h2 className="h-section mx-auto mt-3 max-w-2xl text-balance px-6">{title}</h2>
        </div>

        {/* TURKUAZ DENİZ ÖRTÜSÜ (dikişin sağı — clip-path) */}
        <div ref={cover} className="absolute inset-0 z-20" style={{ clipPath: "path('M50% 0 L50% 100% L100% 100% L100% 0 Z')" }}>
          <video className="absolute inset-0 h-full w-full object-cover" src="/media/kaputas-drone.mp4" poster="/images/kaputas.jpg" autoPlay muted loop playsInline preload="metadata" aria-hidden />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,148,168,0.35), rgba(5,95,123,0.45))" }} />
        </div>

        {/* DİKİŞ + DİŞLER + SÜRGÜ */}
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
          {/* Kumaş bandı (dikişin altında) */}
          <path ref={tapeRef} fill="none" stroke="#06303d" strokeWidth="34" strokeLinecap="round" opacity="0.5" />
          {/* Metal dişler — kalın dash stroke (iki sıra kenetli) */}
          <path ref={teethRef} fill="none" stroke="url(#tooth)" strokeWidth="22" strokeDasharray="7 7" strokeLinecap="butt" />
          <path ref={teeth2Ref} fill="none" stroke="url(#tooth)" strokeWidth="22" strokeDasharray="7 7" strokeDashoffset="7" strokeLinecap="butt" opacity="0.92" />
          {/* Orta birleşim çizgisi */}
          <path ref={seamRef} fill="none" stroke="#063a49" strokeWidth="2.5" opacity="0.7" />
          {/* Sürgü */}
          <g ref={sliderRef}>
            <g ref={bodyRef}>
              <rect x="-15" y="-30" width="30" height="60" rx="11" fill="url(#zslider)" stroke="#7d8c96" strokeWidth="1.4" />
              <rect x="-15" y="-7" width="30" height="14" rx="5" fill="#c3d0d8" />
              <rect x="-6" y="-26" width="12" height="20" rx="5" fill="rgba(255,255,255,0.6)" />
            </g>
            <g ref={pullRef}>
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
