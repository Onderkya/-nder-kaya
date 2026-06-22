"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
};

// Hydration güvenli (deterministik) baloncuklar.
const BUBBLES = Array.from({ length: 16 }, (_, i) => {
  const rnd = (seed: number) => {
    const x = Math.sin((i + 1) * seed) * 10000;
    return x - Math.floor(x);
  };
  return {
    left: `${(rnd(78.233) * 100).toFixed(1)}%`,
    size: Math.round(6 + rnd(12.9898) * 22),
    dur: (9 + rnd(3.17) * 12).toFixed(1),
    delay: (-rnd(91.7) * 14).toFixed(1),
  };
});

export function DiveHero({ title, subtitle, ctaPrimary, ctaSecondary, deepLine, scrollCue, brand }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=2600",
          scrub: 1,
          pin: ".dive-stage",
          anticipatePin: 1,
        },
      });
      // 1) İNİŞ: havadan görüntü büyür, mavi tonlanır; ilk metin yukarı süzülüp kaybolur.
      tl.to(".dive-aerial img", { scale: 1.95, ease: "none" }, 0)
        .to(".dive-grade-blue", { opacity: 0.6, ease: "none" }, 0)
        .to(".dive-cue", { opacity: 0, ease: "none" }, 0)
        .to(".dive-phase1", { yPercent: -28, opacity: 0, ease: "none" }, 0)
        // 2) YÜZEYİ GEÇ: sualtı sahnesi belirir, havadan görüntü kaybolur.
        .fromTo(".dive-depth", { opacity: 0 }, { opacity: 1, ease: "none" }, 0.3)
        .to(".dive-aerial", { opacity: 0, ease: "none" }, 0.42)
        // 3) DERİNE DAL: sualtı mesajı belirir, renk derinleşir, alt geçiş açılır.
        .fromTo(".dive-phase2", { opacity: 0, yPercent: 16 }, { opacity: 1, yPercent: 0, ease: "none" }, 0.52)
        .to(".dive-deepen", { opacity: 0.92, ease: "none" }, 0.55)
        .to(".dive-vignette-bottom", { opacity: 1, ease: "none" }, 0.82);
    }, root);

    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400);
    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="relative" style={{ backgroundColor: "#02212f" }}>
      <div className="dive-stage relative h-[100svh] w-full overflow-hidden">
        {/* HAVADAN — Kaputaş */}
        <div className="dive-aerial absolute inset-0">
          <Image
            src="/images/kaputas.jpg"
            alt="Kaputaş Plajı — turkuaz koy, Antalya"
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover"
          />
          <div
            className="dive-grade-blue absolute inset-0 opacity-0"
            style={{ background: "linear-gradient(180deg, rgba(8,90,120,0.25), rgba(2,40,60,0.72))" }}
          />
          <div className="img-scrim absolute inset-0" />
        </div>

        {/* SUALTI — tasarlanmış derinlik sahnesi */}
        <div className="dive-depth absolute inset-0 opacity-0">
          <div className="dive-caustics absolute inset-0">
            <Image src="/images/caustics.jpg" alt="" fill sizes="100vw" className="object-cover" aria-hidden />
          </div>
          <div className="god-rays" />
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="bubble"
              style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
            />
          ))}
          <div
            className="dive-deepen absolute inset-0 opacity-0"
            style={{ background: "radial-gradient(120% 120% at 50% 38%, transparent 28%, rgba(2,18,28,0.88) 100%)" }}
          />
          <div
            className="dive-vignette-bottom absolute inset-x-0 bottom-0 h-44 opacity-0"
            style={{ background: "linear-gradient(180deg, transparent, rgb(var(--background)))" }}
          />
        </div>

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

          <div className="dive-phase2 pointer-events-none absolute left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 px-6 text-center text-white opacity-0">
            <p className="eyebrow justify-center" style={{ color: "rgb(165 240 255)" }}>{brand}</p>
            <p className="mt-5 font-display text-3xl font-medium leading-snug sm:text-5xl">{deepLine}</p>
          </div>
        </div>

        {/* Kaydırma ipucu */}
        <div className="dive-cue absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-white/70">
          <span className="tracking-widest2 block text-[10px] uppercase">{scrollCue}</span>
          <span className="float-soft mx-auto mt-2 block h-8 w-[1.5px] bg-white/50" />
        </div>
      </div>
    </section>
  );
}
