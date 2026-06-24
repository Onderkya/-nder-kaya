"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * İç sayfa sinematik hero — scroll'la yavaş zoom + parallax.
 * - `image`: taban poster (her zaman, perf + fallback).
 * - `video`: tek arka plan videosu. `videos`: birden çok → otomatik GEÇİŞ (cross-fade).
 * - `flag`: sağ üstte premium Türk bayrağı rozeti.
 * Yalnız aktif video oynar; videolar taban posterin üstüne yumuşak biner.
 */
export function CinematicHero({
  eyebrow,
  title,
  intro,
  image,
  video,
  videos,
  flag = false,
  emblem = false,
  align = "end",
  height = "78svh",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  image: string;
  video?: string;
  videos?: string[];
  flag?: boolean;
  emblem?: boolean;
  align?: "end" | "center";
  height?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoEls = useRef<Array<HTMLVideoElement | null>>([]);
  const clips = videos && videos.length ? videos : video ? [video] : [];
  const [active, setActive] = useState(0);

  // Scroll parallax
  useEffect(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    const apply = () => {
      const top = root.getBoundingClientRect().top;
      const h = root.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, -top / h));
      media.style.transform = `scale(${(1.1 + p * 0.16).toFixed(3)}) translate3d(0, ${(p * 7).toFixed(1)}%, 0)`;
    };
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
  }, []);

  // Videolar arası otomatik geçiş
  useEffect(() => {
    if (clips.length <= 1) return;
    const id = setInterval(() => setActive((a) => (a + 1) % clips.length), 6500);
    return () => clearInterval(id);
  }, [clips.length]);

  // Yalnız aktif video oynar (perf)
  useEffect(() => {
    videoEls.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  return (
    <section
      ref={rootRef}
      className={`cine-hero relative flex overflow-hidden ${align === "center" ? "items-center text-center" : "items-end"}`}
      style={{ minHeight: height }}
    >
      <div ref={mediaRef} className="cine-media absolute inset-0 will-change-transform" style={{ transform: "scale(1.1)" }}>
        {/* Taban poster — anında boyanır, fallback */}
        <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
        {/* Videolar — aktif olan yumuşak biner */}
        {clips.map((src, i) => (
          <video
            key={src}
            ref={(el) => { videoEls.current[i] = el; }}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === active ? 1 : 0 }}
            src={src}
            poster={image}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
          />
        ))}
      </div>
      <div className="cine-scrim absolute inset-0" />

      {/* Premium Türk bayrağı (sağ üst) */}
      {flag ? (
        <div className="absolute right-4 top-24 z-20 sm:right-8">
          <div className="flag-wave overflow-hidden rounded-md shadow-xl ring-1 ring-white/25">
            <svg viewBox="0 0 60 40" width="60" height="40" aria-label="Türk bayrağı" role="img">
              <rect width="60" height="40" fill="#E30A17" />
              <circle cx="25" cy="20" r="10" fill="#fff" />
              <circle cx="28.5" cy="20" r="8" fill="#E30A17" />
              <polygon points="41.5,20 35.8,21.8 35.8,21.8 33.9,16.2 32,21.8 26.3,21.8 30.9,25.3 29.1,30.9 33.9,27.4 38.7,30.9 36.9,25.3" fill="#fff" />
            </svg>
          </div>
        </div>
      ) : null}

      {/* Mezuniyet/diploma madalyonu (eğitim sayfası) */}
      {emblem ? (
        <div className="absolute right-4 top-24 z-20 sm:right-8">
          <div className="float-soft grid h-16 w-16 place-items-center rounded-full text-white shadow-xl ring-1 ring-white/30 backdrop-blur sm:h-20 sm:w-20" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon) / 0.55), rgb(var(--primary) / 0.55))" }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
              <path d="M22 10v5.5" />
              <circle cx="22" cy="17" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </div>
        </div>
      ) : null}

      <div className={`container-wide relative z-10 w-full pb-16 pt-36 text-white sm:pb-24 ${align === "center" ? "mx-auto" : ""}`}>
        {eyebrow ? <p className={`eyebrow cine-rise text-white/85 ${align === "center" ? "justify-center" : ""}`}>{eyebrow}</p> : null}
        <h1 className="h-hero cine-rise mt-6 max-w-4xl text-balance" style={{ animationDelay: "0.1s", marginInline: align === "center" ? "auto" : undefined }}>
          {title}
        </h1>
        {intro ? (
          <p className={`cine-rise mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl ${align === "center" ? "mx-auto" : ""}`} style={{ animationDelay: "0.22s" }}>
            {intro}
          </p>
        ) : null}
      </div>

      <div className="dive-cue absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center text-white/65">
        <span className="float-soft mx-auto block h-8 w-[1.5px] bg-white/50" />
      </div>
    </section>
  );
}
