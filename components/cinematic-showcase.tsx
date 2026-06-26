"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type ShowItem = { name: string; sub: string; img: string; video?: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Editoryal sinematik vitrin — fermuar yok. Tam ekran sabitlenmiş sahne;
 * scroll'la sahneler cross-fade geçer, aktif sahne videoda yavaş Ken Burns zoom
 * yapar, dev serif yer adı içeri kayar. Sağda dikey ilerleme rayı (aktif yanar),
 * "0X / 09" sayaç, altta ilerleme çizgisi. Yalnız görünürken rAF; yalnız aktif
 * video oynar (perf). goturkiye / Aman / Six Senses editoryal lüks dili.
 */
export function CinematicShowcase({ eyebrow, title, items }: { eyebrow: string; title: string; items: ShowItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const panelsRef = useRef<Array<HTMLDivElement | null>>([]);
  const mediaRef = useRef<Array<HTMLDivElement | null>>([]);
  const capRef = useRef<Array<HTMLDivElement | null>>([]);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);
  const railRef = useRef<Array<HTMLLIElement | null>>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = items.length;
    let activeIdx = -1;
    let raf = 0;
    let running = false;

    const frame = () => {
      const H = window.innerHeight;
      const total = Math.max(1, root.offsetHeight - H);
      const top = root.getBoundingClientRect().top;
      const p = clamp(-top / total);
      const f = p * (N - 1); // kesirli aktif indeks
      const idx = Math.round(f);

      for (let k = 0; k < N; k++) {
        const near = clamp(1 - Math.abs(f - k));
        const op = smooth(near);
        const panel = panelsRef.current[k];
        if (panel) {
          panel.style.opacity = String(op);
          panel.style.zIndex = String(k === idx ? 2 : 1);
        }
        // Ken Burns: sahnenin ömrü boyunca sürekli yavaş zoom
        const life = clamp((f - (k - 1)) / 2);
        const media = mediaRef.current[k];
        if (media) media.style.transform = `scale(${(1.04 + life * 0.12).toFixed(4)})`;
        // Başlık aşağıdan yukarı kayarak gelir; intro başlığı ile çakışmasın diye p ile geç açılır
        const cap = capRef.current[k];
        if (cap) {
          const co = op * clamp(p * 4);
          cap.style.opacity = String(co);
          cap.style.transform = `translateY(${((1 - op) * 28).toFixed(1)}px)`;
        }
      }

      if (idx !== activeIdx) {
        activeIdx = idx;
        vids.current.forEach((v, i) => { if (!v) return; if (i === idx) v.play().catch(() => {}); else v.pause(); });
        railRef.current.forEach((li, i) => {
          if (!li) return;
          li.style.color = i === idx ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.4)";
          const bar = li.querySelector<HTMLElement>(".rail-bar");
          if (bar) bar.style.transform = `scaleX(${i === idx ? 1 : 0})`;
        });
        if (counterRef.current) counterRef.current.textContent = String(idx + 1).padStart(2, "0");
      }
      if (progRef.current) progRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (headRef.current) headRef.current.style.opacity = String(clamp(1 - p * 2.4));
      raf = requestAnimationFrame(frame);
    };

    if (reduce) {
      panelsRef.current.forEach((pn, k) => { if (pn) pn.style.opacity = k === 0 ? "1" : "0"; });
      capRef.current.forEach((c, k) => { if (c) c.style.opacity = k === 0 ? "1" : "0"; });
      if (headRef.current) headRef.current.style.opacity = "0";
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
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [items.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${items.length * 80 + 40}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* SAHNELER */}
        {items.map((it, k) => (
          <div key={it.name} ref={(el) => { panelsRef.current[k] = el; }} className="absolute inset-0 will-change-[opacity]" style={{ opacity: k === 0 ? 1 : 0 }}>
            <div ref={(el) => { mediaRef.current[k] = el; }} className="absolute inset-0 will-change-transform">
              <Image src={it.img} alt={it.name} fill sizes="100vw" className="object-cover" priority={k === 0} />
              {it.video && (
                <video ref={(el) => { vids.current[k] = el; }} className="absolute inset-0 h-full w-full object-cover" src={it.video} poster={it.img} muted loop playsInline preload="none" aria-hidden />
              )}
            </div>
            {/* sinematik vinyet + alt degrade */}
            <div className="absolute inset-0" style={{ background: "radial-gradient(125% 85% at 50% 28%, transparent 42%, rgba(2,18,28,0.55) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,18,28,0.4) 0%, transparent 26%, transparent 50%, rgba(2,18,28,0.92) 100%)" }} />
            {/* başlık */}
            <div ref={(el) => { capRef.current[k] = el; }} className="container-wide absolute inset-x-0 bottom-0 z-10 pb-24 text-white will-change-[transform,opacity] sm:pb-28" style={{ opacity: 0 }}>
              <span className="tracking-widest2 mb-3 block text-[11px] uppercase text-white/70">{it.sub}</span>
              <h3 className="font-display max-w-3xl font-semibold leading-[0.86] tracking-[-0.02em]" style={{ fontSize: "clamp(2.8rem, 9vw, 6.5rem)" }}>{it.name}</h3>
              <span className="mt-5 inline-block h-px w-24 bg-white/50" />
            </div>
          </div>
        ))}

        {/* INTRO BAŞLIK — sahneler devraldıkça erir */}
        <div ref={headRef} className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center text-white">
          <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
          <h2 className="h-section mt-4 max-w-3xl text-balance">{title}</h2>
        </div>

        {/* SAYAÇ */}
        <div className="pointer-events-none absolute right-6 top-6 z-30 flex items-baseline gap-1.5 text-white sm:right-10 sm:top-9">
          <span ref={counterRef} className="font-display text-3xl leading-none sm:text-4xl">01</span>
          <span className="text-sm text-white/55">/ {String(items.length).padStart(2, "0")}</span>
        </div>

        {/* DİKEY RAY (masaüstü) */}
        <ul className="pointer-events-none absolute right-8 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
          {items.map((it, k) => (
            <li key={it.name} ref={(el) => { railRef.current[k] = el; }} className="tracking-widest2 flex items-center justify-end gap-3 text-[11px] uppercase" style={{ color: k === 0 ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.4)" }}>
              <span className="text-right">{it.name}</span>
              <span className="relative block h-px w-10 bg-white/25">
                <span className="rail-bar absolute inset-0 origin-left bg-white transition-transform duration-500" style={{ transform: k === 0 ? "scaleX(1)" : "scaleX(0)" }} />
              </span>
            </li>
          ))}
        </ul>

        {/* İLERLEME ÇİZGİSİ */}
        <div className="absolute inset-x-0 bottom-0 z-30 h-[3px] bg-white/15">
          <div ref={progRef} className="h-full origin-left bg-white will-change-transform" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}
