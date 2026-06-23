"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { IconArrow } from "@/components/icons";

type Props = {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  deepLine: string;
  scrollCue: string;
  brand: string;
  soundLabel: string;
  diffLabel: string;
  proof: string[];
  /** Varsa havadan Kaputaş dron VİDEOSU (poster = kaputas.jpg fallback). */
  aerialVideo?: string;
};

const BUBBLES = Array.from({ length: 14 }, (_, i) => {
  const rnd = (seed: number) => {
    const x = Math.sin((i + 1) * seed) * 10000;
    return x - Math.floor(x);
  };
  return {
    left: `${(rnd(78.233) * 100).toFixed(1)}%`,
    size: Math.round(5 + rnd(12.9898) * 18),
    dur: (10 + rnd(3.17) * 12).toFixed(1),
    delay: (-rnd(91.7) * 16).toFixed(1),
  };
});

const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export function DiveHero({ title, subtitle, ctaPrimary, ctaSecondary, deepLine, scrollCue, brand, soundLabel, diffLabel, proof, aerialVideo }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;

    const v = videoRef.current;
    if (v) v.play().catch(() => {});

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const q = (s: string) => root.querySelector<HTMLElement>(s);
    const aerialWrap = q(".dive-aerial-wrap");
    const aerial = q(".dive-aerial");
    const grade = q(".dive-grade-blue");
    const depth = q(".dive-depth");
    const flash = q(".dive-flash");
    const phase1 = q(".dive-phase1");
    const phase2 = q(".dive-phase2");
    const deepen = q(".dive-deepen");
    const vignette = q(".dive-vignette-bottom");
    const cue = q(".dive-cue");

    const set = (el: HTMLElement | null, prop: "opacity" | "transform", val: string) => {
      if (el) el.style[prop] = val;
    };

    const apply = (p: number) => {
      set(aerialWrap, "transform", `scale(${(1.05 + p * 1.05).toFixed(3)})`);
      set(aerial, "opacity", String(1 - seg(p, 0.46, 0.6)));
      set(grade, "opacity", String(seg(p, 0, 0.5) * 0.5));
      set(cue, "opacity", String(1 - seg(p, 0, 0.12)));
      set(phase1, "opacity", String(1 - seg(p, 0.05, 0.34)));
      set(phase1, "transform", `translate3d(0, ${(-seg(p, 0, 0.34) * 60).toFixed(1)}px, 0)`);
      const f = p < 0.42 ? seg(p, 0.3, 0.42) : 1 - seg(p, 0.42, 0.55);
      set(flash, "opacity", String(Math.max(0, f) * 0.85));
      set(depth, "opacity", String(seg(p, 0.34, 0.56)));
      set(phase2, "opacity", String(seg(p, 0.54, 0.72)));
      set(phase2, "transform", `translate3d(-50%, calc(-50% + ${((1 - seg(p, 0.54, 0.72)) * 18).toFixed(1)}px), 0)`);
      set(deepen, "opacity", String(seg(p, 0.66, 0.92) * 0.55));
      set(vignette, "opacity", String(seg(p, 0.82, 1)));
    };

    const compute = () => {
      const total = root.offsetHeight - window.innerHeight;
      const top = root.getBoundingClientRect().top;
      return total > 0 ? Math.min(1, Math.max(0, -top / total)) : 0;
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        apply(compute());
        ticking = false;
      });
    };

    apply(compute()); // ilk durum
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Sualtı videosu yalnızca hero görünürken oynar (aktivitelere inince durur).
  useEffect(() => {
    const root = rootRef.current;
    const v = videoRef.current;
    if (!root || !v) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.01 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  // İlk kullanıcı jestinde (tıklama/dokunma/tuş) dalga sesini otomatik başlat.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      a.volume = 0.4;
      a.play().then(() => setSound(true)).catch(() => {});
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("touchstart", start);
    };
    window.addEventListener("pointerdown", start, { passive: true });
    window.addEventListener("keydown", start);
    window.addEventListener("touchstart", start, { passive: true });
    return cleanup;
  }, []);

  const toggleSound = () => {
    const a = audioRef.current;
    if (!a) return;
    if (sound) {
      a.pause();
      setSound(false);
    } else {
      a.volume = 0.45;
      a.play().then(() => setSound(true)).catch(() => {});
    }
  };

  return (
    <section ref={rootRef} className="relative" style={{ height: "360vh", backgroundColor: "#02212f" }}>
      <div className="dive-stage sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* HAVADAN — turkuaz Kaputaş (wrapper transform edilir) */}
        <div className="dive-aerial absolute inset-0">
          <div className="dive-aerial-wrap absolute inset-0 will-change-transform" style={{ transform: "scale(1.05)" }}>
            {aerialVideo ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={aerialVideo}
                poster="/images/kaputas.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden
              />
            ) : (
              <Image
                src="/images/kaputas.jpg"
                alt="Kaputaş Plajı — turkuaz Akdeniz, Antalya"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
          </div>
          <div
            className="dive-grade-blue absolute inset-0 opacity-0"
            style={{ background: "linear-gradient(180deg, rgba(10,120,150,0.25), rgba(2,45,65,0.6))" }}
          />
          <div className="img-scrim absolute inset-0" />
        </div>

        {/* SUALTI — gerçek video */}
        <div className="dive-depth absolute inset-0" style={{ opacity: 0 }}>
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="/media/dive-fish.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(3,60,85,0.08), rgba(2,28,42,0.28))" }} />
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="bubble"
              style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            />
          ))}
          <div
            className="dive-deepen absolute inset-0"
            style={{ opacity: 0, background: "radial-gradient(120% 120% at 50% 40%, transparent 30%, rgba(2,16,26,0.85) 100%)" }}
          />
          <div
            className="dive-vignette-bottom absolute inset-x-0 bottom-0 h-44"
            style={{ opacity: 0, background: "linear-gradient(180deg, transparent, rgb(var(--background)))" }}
          />
        </div>

        {/* Yüzey kırılma flaşı */}
        <div
          className="dive-flash pointer-events-none absolute inset-0"
          style={{ opacity: 0, background: "radial-gradient(circle at 50% 42%, rgba(220,250,255,0.9), rgba(170,235,250,0.25) 45%, transparent 72%)" }}
        />

        {/* İÇERİK — alt-hizalı, satış odaklı */}
        <div className="container-wide absolute inset-0 z-10 flex flex-col justify-end pb-12 sm:pb-16">
          <div className="dive-phase1 max-w-3xl text-white">
            <span
              className="badge-glow inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em]"
              style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))", color: "rgb(var(--accent-foreground))" }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              {diffLabel}
            </span>
            <h1
              className="font-display mt-5 font-semibold leading-[0.98] tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(2.1rem, 5vw, 4.4rem)" }}
            >
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{subtitle}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-accent shadow-xl shadow-black/25">
                {ctaPrimary} <IconArrow />
              </Link>
              <Link href="/antalya" className="btn-ghost-light glass">
                {ctaSecondary}
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              {proof.map((p) => (
                <li key={p} className="inline-flex items-center gap-2 text-[13px] font-medium text-white/80">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: "rgb(var(--lagoon) / 0.25)" }}>
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="rgb(175 240 255)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4L19 7" /></svg>
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="dive-phase2 pointer-events-none absolute left-1/2 top-1/2 w-full max-w-3xl px-6 text-center text-white"
            style={{ opacity: 0, transform: "translate3d(-50%, -50%, 0)" }}
          >
            <p className="eyebrow justify-center" style={{ color: "rgb(175 240 255)" }}>{brand}</p>
            <p className="mt-5 font-display text-3xl font-medium leading-snug sm:text-5xl">{deepLine}</p>
          </div>
        </div>

        {/* Kaydırma ipucu */}
        <div className="dive-cue absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-white/70">
          <span className="tracking-widest2 block text-[10px] uppercase">{scrollCue}</span>
          <span className="float-soft mx-auto mt-2 block h-8 w-[1.5px] bg-white/50" />
        </div>
      </div>

      {/* Dalga sesi toggle */}
      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={sound}
        aria-label={soundLabel}
        className="glass fixed right-4 top-[5.25rem] z-40 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-black/25 transition-transform hover:-translate-y-0.5 sm:right-6"
        style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.5)" }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H2v6h4l5 4z" />
          {sound ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></> : <path d="m17 9 5 6m0-6-5 6" />}
        </svg>
        {soundLabel}
        {sound && <span className="sound-pulse h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "rgb(120 230 255)" }} />}
      </button>
      <audio ref={audioRef} src="/media/waves.mp3" loop preload="none" />
    </section>
  );
}
