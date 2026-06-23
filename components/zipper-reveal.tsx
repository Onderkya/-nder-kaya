"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type ZipItem = { name: string; sub: string; img: string; video?: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * DİKEY FERMUAR — bir ceketin fermuarı gibi denizi ORTADAN sola-sağa açar.
 * Pul aşağı iner, iki yarı yana kayar; aradan scuba ve diğerleri SANA DOĞRU
 * (zoom) gelir. Açılış ilk ~1 ekranda biter (hızlı). Yalnız aktif video oynar.
 */
export function ZipperReveal({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const left = root.querySelector<HTMLElement>(".zip-l");
    const right = root.querySelector<HTMLElement>(".zip-r");
    const teeth = root.querySelector<HTMLElement>(".zip-teeth");
    const pull = root.querySelector<HTMLElement>(".zip-pull");
    const stageInner = root.querySelector<HTMLElement>(".zip-content");
    const head = root.querySelector<HTMLElement>(".zip-head");
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".zip-card"));
    const N = items.length;
    let activeIdx = -1;

    const apply = () => {
      const innerH = window.innerHeight;
      const total = root.offsetHeight - innerH;
      const top = root.getBoundingClientRect().top;
      const scrolled = clamp(-top, 0, total);
      const introPx = innerH * 0.9;
      const open = clamp(scrolled / introPx); // fermuar ilk ~1 ekranda tam açılır
      const after = Math.max(1, total - introPx);
      const cp = clamp((scrolled - introPx) / after); // içerik ilerlemesi
      const idx = clamp(Math.floor(cp * (N - 0.0001)), 0, N - 1);

      if (left) left.style.transform = `translate3d(${(-open * 101).toFixed(2)}%, 0, 0)`;
      if (right) right.style.transform = `translate3d(${(open * 101).toFixed(2)}%, 0, 0)`;
      if (teeth) teeth.style.opacity = String(1 - clamp(open * 1.5));
      if (pull) {
        pull.style.transform = `translate3d(-50%, ${(open * 86).toFixed(1)}vh, 0)`;
        pull.style.opacity = String(1 - clamp((open - 0.85) * 6));
      }
      if (head) head.style.opacity = String(clamp((open - 0.55) * 2.4));
      // İçerik sana doğru "gelir": kapalıyken yakın (zoom), açılınca yerine oturur.
      if (stageInner) stageInner.style.transform = `scale(${(1.0 + (1 - open) * 0.1).toFixed(3)})`;

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

    if (reduce) {
      if (left) left.style.transform = "translateX(-101%)";
      if (right) right.style.transform = "translateX(101%)";
      cards.forEach((c, k) => (c.style.opacity = k === 0 ? "1" : "0"));
      return;
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { apply(); ticking = false; });
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${items.length * 62 + 60}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* İÇERİK — fermuar açılınca görünür, sana doğru gelir */}
        <div className="zip-content absolute inset-0 will-change-transform">
          {items.map((it, k) => (
            <div key={it.name} className="zip-card absolute inset-0 will-change-[transform,opacity]" style={{ opacity: k === 0 ? 1 : 0 }}>
              <Image src={it.img} alt={it.name} fill sizes="100vw" className="object-cover" />
              {it.video && (
                <video
                  ref={(el) => { vids.current[k] = el; }}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={it.video}
                  poster={it.img}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                />
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
        <div className="zip-head pointer-events-none absolute inset-x-0 top-[16%] z-30 text-center text-white" style={{ opacity: 0 }}>
          <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
          <h2 className="h-section mx-auto mt-3 max-w-2xl text-balance px-6">{title}</h2>
        </div>

        {/* FERMUAR — sol yarı (deniz) */}
        <div className="zip-l absolute inset-y-0 left-0 z-20 w-1/2 will-change-transform" style={{ background: "linear-gradient(120deg, #0e7490 0%, #0a5e78 50%, #053f59 100%)" }}>
          <Image src="/images/kaputas.jpg" alt="" fill sizes="50vw" className="object-cover opacity-60" style={{ objectPosition: "left center" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(2,33,47,0.45), rgba(2,33,47,0.75))" }} />
        </div>
        {/* FERMUAR — sağ yarı (deniz) */}
        <div className="zip-r absolute inset-y-0 right-0 z-20 w-1/2 will-change-transform" style={{ background: "linear-gradient(240deg, #0e7490 0%, #0a5e78 50%, #053f59 100%)" }}>
          <Image src="/images/kaputas.jpg" alt="" fill sizes="50vw" className="object-cover opacity-60" style={{ objectPosition: "right center" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(240deg, rgba(2,33,47,0.45), rgba(2,33,47,0.75))" }} />
        </div>

        {/* Fermuar dişleri (dikey orta) */}
        <div className="zip-teeth pointer-events-none absolute inset-y-0 left-1/2 z-30 w-4 -translate-x-1/2" style={{ background: "repeating-linear-gradient(180deg, rgb(var(--gold)) 0 7px, transparent 7px 14px)", filter: "drop-shadow(0 0 6px rgba(0,0,0,0.4))" }} />
        {/* Fermuar dili (aşağı iner) */}
        <div className="zip-pull pointer-events-none absolute left-1/2 top-0 z-30">
          <div className="grid h-12 w-12 place-items-center rounded-full text-white shadow-2xl ring-2 ring-white/30" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </div>
        </div>
      </div>
    </section>
  );
}
