"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type Place = { img: string; name: string; sub: string; video?: string };

export function HorizontalPlaces({ eyebrow, title, places }: { eyebrow: string; title: string; places: Place[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const videoEls = useRef<Array<HTMLVideoElement | null>>([]);

  // Yalnız görünür kartların videosu oynar (yatay galeride performans).
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && e.intersectionRatio > 0.5) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    videoEls.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, [places.length]);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const apply = () => {
      const total = root.offsetHeight - window.innerHeight;
      const top = root.getBoundingClientRect().top;
      const p = total > 0 ? Math.min(1, Math.max(0, -top / total)) : 0;
      const maxX = Math.max(0, track.scrollWidth - window.innerWidth);
      track.style.transform = `translate3d(${(-p * maxX).toFixed(1)}px, 0, 0)`;
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
  }, [places.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${Math.max(220, places.length * 42)}vh`, backgroundColor: "rgb(var(--background))" }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="container-wide mb-7">
          <p className="eyebrow" style={{ color: "rgb(var(--accent))" }}>{eyebrow}</p>
          <h2 className="h-section mt-4" style={{ color: "rgb(var(--foreground))" }}>{title}</h2>
        </div>

        <div ref={trackRef} className="flex gap-5 px-5 will-change-transform sm:px-8">
          {places.map((pl, i) => (
            <figure
              key={i}
              className="img-zoom relative h-[58vh] w-[80vw] shrink-0 overflow-hidden rounded-3xl shadow-xl sm:w-[46vw] lg:w-[33vw]"
            >
              {pl.video ? (
                <video
                  ref={(el) => {
                    videoEls.current[i] = el;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={pl.video}
                  poster={pl.img}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                />
              ) : (
                <Image src={pl.img} alt={pl.name} fill sizes="(max-width: 1024px) 80vw, 33vw" className="object-cover" />
              )}
              <div className="img-scrim absolute inset-0" />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                <span className="font-display text-3xl leading-none sm:text-4xl">{pl.name}</span>
                <span className="tracking-widest2 text-[10px] uppercase text-white/70">{pl.sub}</span>
              </figcaption>
              <span className="absolute left-6 top-5 font-display text-2xl text-white/80">{String(i + 1).padStart(2, "0")}</span>
            </figure>
          ))}
        </div>

        <div className="container-wide mt-7">
          <p className="tracking-widest2 text-[11px] uppercase" style={{ color: "rgb(var(--muted-foreground))" }}>
            ← kaydır · scroll →
          </p>
        </div>
      </div>
    </section>
  );
}
