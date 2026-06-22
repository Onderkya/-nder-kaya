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

export function DiveHero({ title, subtitle, ctaPrimary, ctaSecondary, deepLine, scrollCue, brand, soundLabel }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const q = (s: string) => root.querySelector<HTMLElement>(s);
    const aerial = q(".dive-aerial");
    const aerialImg = aerial?.querySelector("img") as HTMLElement | null;
    const grade = q(".dive-grade-blue");
    const depth = q(".dive-depth");
    const flash = q(".dive-flash");
    const phase1 = q(".dive-phase1");
    const phase2 = q(".dive-phase2");
    const deepen = q(".dive-deepen");
    const vignette = q(".dive-vignette-bottom");
    const cue = q(".dive-cue");

    const v = videoRef.current;
    if (v) v.play().catch(() => {});

    if (reduce) return;

    let cur = 0;
    let raf = 0;
    let running = true;

    const apply = (p: number) => {
      if (aerialImg) aerialImg.style.transform = `scale(${(1.05 + p * 1.0).toFixed(3)})`;
      if (aerial) aerial.style.opacity = String(1 - seg(p, 0.46, 0.6));
      if (grade) grade.style.opacity = String(seg(p, 0, 0.5) * 0.5);
      if (cue) cue.style.opacity = String(1 - seg(p, 0, 0.12));
      if (phase1) {
        phase1.style.opacity = String(1 - seg(p, 0.05, 0.34));
        phase1.style.transform = `translate3d(0, ${(-seg(p, 0, 0.34) * 60).toFixed(1)}px, 0)`;
      }
      if (flash) {
        const f = p < 0.42 ? seg(p, 0.3, 0.42) : 1 - seg(p, 0.42, 0.55);
        flash.style.opacity = String(Math.max(0, f) * 0.85);
      }
      if (depth) depth.style.opacity = String(seg(p, 0.34, 0.56));
      if (phase2) {
        phase2.style.opacity = String(seg(p, 0.54, 0.72));
        phase2.style.transform = `translate3d(-50%, calc(-50% + ${((1 - seg(p, 0.54, 0.72)) * 18).toFixed(1)}px), 0)`;
      }
      if (deepen) deepen.style.opacity = String(seg(p, 0.58, 0.86) * 0.9);
      if (vignette) vignette.style.opacity = String(seg(p, 0.82, 1));
    };

    const frame = () => {
      const vh = window.innerHeight;
      const total = root.offsetHeight - vh;
      const top = root.getBoundingClientRect().top;
      const target = total > 0 ? Math.min(1, Math.max(0, -top / total)) : 0;
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0005) cur = target;
      apply(cur);
      if (running) raf = requestAnimationFrame(frame);
    };

    // Yalnızca sahne görünürken rAF çalışsın (performans).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !running) {
            running = true;
            raf = requestAnimationFrame(frame);
          } else if (!e.isIntersecting && running) {
            running = false;
            cancelAnimationFrame(raf);
          }
        }
      },
      { threshold: 0 },
    );
    io.observe(root);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
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
        {/* HAVADAN — turkuaz Kaputaş */}
        <div className="dive-aerial absolute inset-0">
          <Image
            src="/images/kaputas.jpg"
            alt="Kaputaş Plajı — turkuaz Akdeniz, Antalya"
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover"
          />
          <div
            className="dive-grade-blue absolute inset-0 opacity-0"
            style={{ background: "linear-gradient(180deg, rgba(10,120,150,0.25), rgba(2,45,65,0.6))" }}
          />
          <div className="img-scrim absolute inset-0" />
        </div>

        {/* SUALTI — gerçek video */}
        <div className="dive-depth absolute inset-0 opacity-0">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src="/media/dive-underwater.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(3,60,85,0.25), rgba(2,28,42,0.55))" }} />
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="bubble"
              style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            />
          ))}
          <div
            className="dive-deepen absolute inset-0 opacity-0"
            style={{ background: "radial-gradient(120% 120% at 50% 40%, transparent 30%, rgba(2,16,26,0.85) 100%)" }}
          />
          <div
            className="dive-vignette-bottom absolute inset-x-0 bottom-0 h-44 opacity-0"
            style={{ background: "linear-gradient(180deg, transparent, rgb(var(--background)))" }}
          />
        </div>

        {/* Yüzey kırılma flaşı */}
        <div
          className="dive-flash pointer-events-none absolute inset-0 opacity-0"
          style={{ background: "radial-gradient(circle at 50% 42%, rgba(220,250,255,0.9), rgba(170,235,250,0.25) 45%, transparent 72%)" }}
        />

        {/* İÇERİK */}
        <div className="container-wide absolute inset-0 z-10 flex flex-col justify-end pb-16 sm:pb-24">
          <div className="dive-phase1 max-w-4xl text-white">
            <p className="eyebrow text-white/85">{brand} — Antalya · Kaputaş</p>
            <h1 className="h-hero mt-6 text-balance">{title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">{subtitle}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-accent shadow-xl shadow-black/20">
                {ctaPrimary} <IconArrow />
              </Link>
              <Link href="/antalya" className="btn-ghost-light glass">
                {ctaSecondary}
              </Link>
            </div>
          </div>

          <div
            className="dive-phase2 pointer-events-none absolute left-1/2 top-1/2 w-full max-w-3xl px-6 text-center text-white opacity-0"
            style={{ transform: "translate3d(-50%, -50%, 0)" }}
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
        className="glass fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold text-white"
        style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(4 28 40 / 0.55)" }}
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
