"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type Experience = { name: string; sub: string; img: string; video?: string };

/**
 * Deneyim fermuarı — yatayda "fermuar gibi" açılır: üstüne gel/tıkla → panel
 * büyür, diğerleri kısalır. Yalnız AKTİF panelin videosu oynar (poster üstüne
 * yumuşak biner) → sticky-stack jank yok, performanslı. Mobilde dikey.
 */
export function ExperienceAccordion({ items, hint }: { items: Experience[]; hint?: string }) {
  const [active, setActive] = useState(0);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  return (
    <div>
      <div className="flex flex-col gap-2.5 sm:h-[72vh] sm:flex-row sm:gap-3">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <button
              key={it.name}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-expanded={on}
              className="group relative overflow-hidden rounded-3xl outline-none transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2"
              style={{ flexGrow: on ? 6 : 1, flexBasis: 0, minHeight: on ? "22rem" : "5.5rem" }}
            >
              <Image src={it.img} alt={it.name} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 30vw" className={`object-cover transition-transform duration-[1.2s] ${on ? "scale-100" : "scale-110"}`} />
              {it.video && (
                <video
                  ref={(el) => { vids.current[i] = el; }}
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                  style={{ opacity: on ? 1 : 0 }}
                  src={it.video}
                  poster={it.img}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0" style={{ background: on ? "linear-gradient(to top, rgba(4,18,24,0.82) 0%, rgba(4,18,24,0.12) 48%, transparent 78%)" : "linear-gradient(to top, rgba(4,18,24,0.8), rgba(4,18,24,0.34))" }} />

              <span className="absolute left-4 top-4 font-display text-lg text-white/65 sm:text-xl">{String(i + 1).padStart(2, "0")}</span>

              <div className="absolute inset-x-0 bottom-0 p-5 text-left text-white sm:p-6">
                <span className="font-display block leading-none transition-all duration-500" style={{ fontSize: on ? "clamp(1.9rem, 3.6vw, 3.1rem)" : "1.15rem", whiteSpace: "nowrap" }}>
                  {it.name}
                </span>
                <span className="tracking-widest2 mt-2 inline-block overflow-hidden text-[11px] uppercase text-white/80 transition-all duration-500" style={{ maxHeight: on ? "1.6rem" : 0, opacity: on ? 1 : 0 }}>
                  <span className="rounded-full bg-white/15 px-2.5 py-1">{it.sub}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
      {hint && <p className="tracking-widest2 mt-5 text-center text-[11px] uppercase" style={{ color: "rgb(var(--muted-foreground))" }}>{hint}</p>}
    </div>
  );
}
