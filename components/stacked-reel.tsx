"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type ReelItem = {
  /** /media/*.mp4 — yoksa poster fotoğrafı görünür (graceful). */
  video?: string;
  poster: string;
  name: string;
  sub: string;
};

/**
 * Scroll'da kartların birbirinin ÜSTÜNE bindiği (goturkiye tarzı) sinematik
 * bölge reel'i. Her panel `sticky top-0`; sonraki panel öncekinin üstüne kayar,
 * önceki hafifçe küçülüp kararır (derinlik). Yalnız görünür panelin videosu oynar.
 */
export function StackedReel({
  eyebrow,
  title,
  intro,
  items,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  items: ReelItem[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoEls = useRef<Array<HTMLVideoElement | null>>([]);

  // Derinlik efekti: bir panel, bir sonraki tarafından örtüldükçe küçülüp kararır.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>(".reel-panel"));
    const inners = panels.map((p) => p.querySelector<HTMLElement>(".reel-inner"));

    const apply = () => {
      const vh = window.innerHeight;
      for (let i = 0; i < panels.length - 1; i++) {
        const nextTop = panels[i + 1].getBoundingClientRect().top;
        const cover = Math.min(1, Math.max(0, 1 - nextTop / vh));
        const el = inners[i];
        if (el) {
          el.style.transform = `scale(${(1 - cover * 0.07).toFixed(3)})`;
          el.style.filter = `brightness(${(1 - cover * 0.45).toFixed(3)})`;
          el.style.borderRadius = `${(cover * 2).toFixed(2)}rem`;
        }
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        apply();
        ticking = false;
      });
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items.length]);

  // Yalnız ekranda baskın olan panelin videosu oynar (performans).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && e.intersectionRatio > 0.55) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: [0, 0.55, 1] },
    );
    videoEls.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <section className="relative" style={{ backgroundColor: "#02151f" }}>
      {/* Başlık paneli */}
      <div className="container-wide flex min-h-[60vh] flex-col justify-center py-20 text-white sm:py-28">
        <p className="eyebrow text-white/80">{eyebrow}</p>
        <h2 className="h-section mt-5 max-w-2xl text-balance">{title}</h2>
        {intro && <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">{intro}</p>}
        <span className="tracking-widest2 mt-10 inline-flex items-center gap-2 text-[11px] uppercase text-white/45">
          <span className="float-soft inline-block h-7 w-[1.5px] bg-white/40" />
          kaydır
        </span>
      </div>

      {/* Sticky-stack kartlar */}
      <div ref={rootRef} className="relative">
        {items.map((it, i) => (
          <div key={it.name} className="reel-panel sticky top-0 h-[100svh] overflow-hidden">
            <div
              className="reel-inner absolute inset-0 overflow-hidden will-change-transform"
              style={{ transformOrigin: "center top" }}
            >
              {/* Optimize edilmiş poster (lazy) — taban katman */}
              <Image src={it.poster} alt={it.name} fill sizes="100vw" className="object-cover" />
              {/* Video yalnız oynarken üste yumuşakça biner */}
              {it.video && (
                <video
                  ref={(el) => {
                    videoEls.current[i] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
                  src={it.video}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                  onPlaying={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                  onPause={(e) => {
                    e.currentTarget.style.opacity = "0";
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(2,18,28,0.15) 0%, transparent 30%, transparent 55%, rgba(2,18,28,0.82) 100%)" }}
              />

              {/* Etiket */}
              <div className="container-wide absolute inset-x-0 bottom-0 z-10 flex items-end justify-between pb-16 text-white sm:pb-24">
                <div>
                  <span className="tracking-widest2 block text-[11px] uppercase text-white/60">{it.sub}</span>
                  <h3 className="font-display mt-2 font-semibold leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(2.6rem, 8vw, 6rem)" }}>
                    {it.name}
                  </h3>
                </div>
                <span className="font-display hidden text-5xl text-white/30 sm:block">
                  {String(i + 1).padStart(2, "0")}<span className="text-2xl text-white/20">/{String(items.length).padStart(2, "0")}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
