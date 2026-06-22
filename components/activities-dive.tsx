"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type DiveScene = {
  kind: "video" | "image";
  src: string;
  title: string;
  place: string;
};

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export function ActivitiesDive({ eyebrow, scenes }: { eyebrow: string; scenes: DiveScene[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const videoEls = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const N = scenes.length;
    const layers = Array.from(root.querySelectorAll<HTMLElement>(".act-scene"));
    const wraps = Array.from(root.querySelectorAll<HTMLElement>(".act-wrap"));
    const labels = Array.from(root.querySelectorAll<HTMLElement>(".act-label"));
    let activeIdx = -1;

    const apply = () => {
      const total = root.offsetHeight - window.innerHeight;
      const top = root.getBoundingClientRect().top;
      const p = total > 0 ? Math.min(1, Math.max(0, -top / total)) : 0;
      const pos = p * N;
      for (let k = 0; k < N; k++) {
        if (layers[k]) layers[k].style.opacity = String(seg(pos, k - 0.6, k));
        if (wraps[k]) wraps[k].style.transform = `scale(${(1.08 + seg(pos, k - 0.5, k + 0.5) * 0.2).toFixed(3)})`;
        if (labels[k]) {
          labels[k].style.opacity = String(Math.max(0, seg(pos, k - 0.15, k + 0.1) - seg(pos, k + 0.75, k + 1.0)));
        }
      }
      // Yalnız görünür sahnenin videosu oynar (performans).
      const idx = Math.max(0, Math.min(N - 1, Math.round(pos)));
      if (idx !== activeIdx) {
        activeIdx = idx;
        videoEls.current.forEach((v, i) => {
          if (!v) return;
          if (i === idx) v.play().catch(() => {});
          else v.pause();
        });
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
  }, [scenes.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${scenes.length * 100}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {scenes.map((sc, k) => (
          <div key={k} className="act-scene absolute inset-0" style={{ opacity: k === 0 ? 1 : 0 }}>
            <div className="act-wrap absolute inset-0 will-change-transform" style={{ transform: "scale(1.08)" }}>
              {sc.kind === "video" ? (
                <video
                  ref={(el) => {
                    videoEls.current[k] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={sc.src}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                />
              ) : (
                <Image src={sc.src} alt={sc.title} fill sizes="100vw" className="object-cover" />
              )}
            </div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,18,28,0.3), rgba(2,18,28,0.78))" }} />
          </div>
        ))}

        {/* Etiketler */}
        <div className="container-wide pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-20 sm:pb-28">
          <p className="eyebrow text-white/80">{eyebrow}</p>
          <div className="relative mt-4 h-24 sm:h-32">
            {scenes.map((sc, k) => (
              <div key={k} className="act-label absolute inset-0 text-white" style={{ opacity: k === 0 ? 1 : 0 }}>
                <h2 className="h-section leading-none">{sc.title}</h2>
                <span className="tracking-widest2 mt-3 inline-block text-[11px] uppercase text-white/60">{sc.place}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
