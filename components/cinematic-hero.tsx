"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * İç sayfalar için sinematik hero — scroll'la yavaş zoom + parallax kayma,
 * üstte serif başlık. `video` verilirse foto yerine arka plan videosu oynar
 * (poster olarak `image` kullanılır). Ana sayfanın immersive diliyle uyumlu.
 */
export function CinematicHero({
  eyebrow,
  title,
  intro,
  image,
  video,
  align = "end",
  height = "78svh",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  image: string;
  video?: string;
  align?: "end" | "center";
  height?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    if (!root || !media) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const apply = () => {
      const top = root.getBoundingClientRect().top;
      const h = root.offsetHeight || 1;
      const p = Math.min(1, Math.max(0, -top / h)); // 0 → 1 sayfa geçerken
      media.style.transform = `scale(${(1.1 + p * 0.16).toFixed(3)}) translate3d(0, ${(p * 7).toFixed(1)}%, 0)`;
    };
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
  }, []);

  return (
    <section
      ref={rootRef}
      className={`cine-hero relative flex overflow-hidden ${align === "center" ? "items-center text-center" : "items-end"}`}
      style={{ minHeight: height }}
    >
      <div ref={mediaRef} className="cine-media absolute inset-0 will-change-transform" style={{ transform: "scale(1.1)" }}>
        {video ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={video}
            poster={image}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        ) : (
          <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
        )}
      </div>
      <div className="cine-scrim absolute inset-0" />

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
