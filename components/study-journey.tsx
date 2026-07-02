"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type JourneyStep = {
  n: string;
  title: string;
  text: string;
  place: string;
  /** Arka plan görseli. Gizlenirse (undefined) degrade taban kalır. */
  img?: string;
  /** Varsa arka plan videosu (poster = img); yalnız aktif adım oynar. */
  video?: string;
  points?: string[];
  /** "Bu adımda biz …" — danışmanlık değerini somutlaştıran kısa not. */
  weDo?: string;
};

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

/**
 * "Türkiye'de okuma" immersive iniş — her adımda arka plan çapraz geçer,
 * içerik kartı (numara + başlık + maddeler) kayarak girer. Ana sayfadaki
 * ActivitiesDive ile aynı scroll-sürücü mekanik (rAF + seg).
 */
export function StudyJourney({ eyebrow, steps, weDoLabel }: { eyebrow: string; steps: JourneyStep[]; weDoLabel?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const videoEls = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Hareket azaltılmışsa tüm kartları görünür yap
      root.querySelectorAll<HTMLElement>(".sj-card").forEach((el) => (el.style.opacity = "1"));
      root.querySelectorAll<HTMLElement>(".sj-bg").forEach((el, i) => (el.style.opacity = i === 0 ? "1" : "0"));
      return;
    }

    const N = steps.length;
    const bgs = Array.from(root.querySelectorAll<HTMLElement>(".sj-bg"));
    const wraps = Array.from(root.querySelectorAll<HTMLElement>(".sj-bg-wrap"));
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".sj-card"));

    const apply = () => {
      const total = root.offsetHeight - window.innerHeight;
      const top = root.getBoundingClientRect().top;
      const p = total > 0 ? Math.min(1, Math.max(0, -top / total)) : 0;
      const pos = p * N;
      const active = Math.max(0, Math.min(N - 1, Math.round(pos)));
      videoEls.current.forEach((v, i) => {
        if (!v) return;
        if (i === active) v.play().catch(() => {});
        else v.pause();
      });
      for (let k = 0; k < N; k++) {
        if (bgs[k]) bgs[k].style.opacity = String(seg(pos, k - 0.6, k));
        if (wraps[k]) wraps[k].style.transform = `scale(${(1.06 + seg(pos, k - 0.5, k + 0.5) * 0.16).toFixed(3)})`;
        if (cards[k]) {
          const inOut = Math.max(0, seg(pos, k - 0.12, k + 0.12) - seg(pos, k + 0.78, k + 1.0));
          cards[k].style.opacity = String(inOut);
          cards[k].style.transform = `translate3d(0, ${((1 - seg(pos, k - 0.12, k + 0.12)) * 40).toFixed(1)}px, 0)`;
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
  }, [steps.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${steps.length * 100}vh`, backgroundColor: "#061a22" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Arka planlar */}
        {steps.map((st, k) => (
          <div key={k} className="sj-bg absolute inset-0" style={{ opacity: k === 0 ? 1 : 0 }}>
            <div className="sj-bg-wrap absolute inset-0 will-change-transform" style={{ transform: "scale(1.06)" }}>
              {st.video ? (
                <video
                  ref={(el) => {
                    videoEls.current[k] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={st.video}
                  poster={st.img}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                />
              ) : st.img ? (
                <Image src={st.img} alt={st.title} fill sizes="100vw" className="object-cover" />
              ) : null}
            </div>
            <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(4,18,26,0.86) 0%, rgba(4,18,26,0.55) 45%, rgba(4,18,26,0.25) 100%)" }} />
          </div>
        ))}

        {/* İçerik kartları */}
        <div className="container-wide absolute inset-0 z-10 flex items-center">
          <div className="relative w-full max-w-xl">
            <p className="eyebrow mb-5 text-white/80">{eyebrow}</p>
            <div className="relative min-h-[27rem]">
              {steps.map((st, k) => (
                <div key={k} className="sj-card absolute inset-0 text-white" style={{ opacity: k === 0 ? 1 : 0 }}>
                  <span className="serif-italic block text-5xl sm:text-6xl" style={{ color: "rgb(var(--gold))" }}>{st.n}</span>
                  <h2 className="font-display mt-4 font-semibold leading-[1.02] tracking-[-0.015em]" style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)" }}>
                    {st.title}
                  </h2>
                  <span className="tracking-widest2 mt-3 inline-block text-[11px] uppercase text-white/55">{st.place}</span>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">{st.text}</p>
                  {st.points?.length ? (
                    <ul className="mt-6 space-y-2.5">
                      {st.points.map((pt) => (
                        <li key={pt} className="flex items-start gap-3 text-white/80">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "rgb(var(--lagoon))" }} />
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {st.weDo && weDoLabel ? (
                    <p className="mt-5 max-w-md rounded-2xl border px-4 py-3 text-[14px] leading-relaxed text-white/90" style={{ borderColor: "rgb(255 255 255 / 0.22)", backgroundColor: "rgb(255 255 255 / 0.08)" }}>
                      <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest" style={{ color: "rgb(var(--gold))" }}>{weDoLabel}</span>
                      {st.weDo}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adım göstergesi */}
        <div className="container-wide pointer-events-none absolute inset-x-0 bottom-7 z-10">
          <div className="flex items-center gap-2">
            {steps.map((_, k) => (
              <span key={k} className="h-0.5 flex-1 rounded-full" style={{ backgroundColor: "rgb(255 255 255 / 0.25)" }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
