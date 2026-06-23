"use client";

import { useState } from "react";
import Image from "next/image";
import { IconArrow } from "./icons";

export type Hotel = { name: string; place: string; img: string };

/**
 * Otel akordeonu — yatayda "fermuar gibi" açılır: üstüne gelince/tıklayınca o
 * panel büyür, diğerleri kısalır. Mobilde dikey istiflenir. CSS flex-grow geçişi.
 */
export function HotelAccordion({ hotels, ctaLabel }: { hotels: Hotel[]; ctaLabel: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-2.5 sm:h-[70vh] sm:flex-row sm:gap-3">
      {hotels.map((h, i) => {
        const isActive = i === active;
        return (
          <button
            key={h.name}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-expanded={isActive}
            className="group relative overflow-hidden rounded-3xl outline-none ring-offset-2 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2"
            style={{
              flexGrow: isActive ? 6 : 1,
              flexBasis: 0,
              minHeight: isActive ? "20rem" : "5rem",
            }}
          >
            <Image
              src={h.img}
              alt={`${h.name}, Antalya`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-[1.2s] ${isActive ? "scale-100" : "scale-110"}`}
            />
            <div className="absolute inset-0" style={{ background: isActive ? "linear-gradient(to top, rgba(4,18,24,0.82) 0%, rgba(4,18,24,0.15) 45%, transparent 75%)" : "linear-gradient(to top, rgba(4,18,24,0.78), rgba(4,18,24,0.32))" }} />

            {/* Numara */}
            <span className="absolute left-4 top-4 font-display text-lg text-white/70 sm:text-xl">
              {String(i + 1).padStart(2, "0")}
            </span>

            {/* Aktif: büyük başlık + yer + CTA */}
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-left text-white sm:p-6">
              <div className="min-w-0">
                <span
                  className="block overflow-hidden text-sm transition-all duration-500"
                  style={{ maxHeight: isActive ? "1.5rem" : 0, opacity: isActive ? 1 : 0, color: "rgb(251 191 80)" }}
                >
                  ★★★★★ <span className="text-white/70">Lüks resort</span>
                </span>
                <span
                  className="font-display block leading-none transition-all duration-500"
                  style={{ fontSize: isActive ? "clamp(1.8rem, 3.4vw, 3rem)" : "1.1rem", whiteSpace: "nowrap" }}
                >
                  {h.name}
                </span>
                <span
                  className="tracking-widest2 mt-2 inline-flex items-center gap-2 overflow-hidden text-[11px] uppercase text-white/75 transition-all duration-500"
                  style={{ maxHeight: isActive ? "2rem" : 0, opacity: isActive ? 1 : 0 }}
                >
                  <span className="rounded-full bg-white/15 px-2.5 py-1">{h.place}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white/90">{ctaLabel} <IconArrow /></span>
                </span>
              </div>
            </figcaption>
          </button>
        );
      })}
    </div>
  );
}
