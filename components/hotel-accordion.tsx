"use client";

import { useState } from "react";
import Image from "next/image";
import { IconArrow } from "./icons";

export type Hotel = {
  name: string;
  place: string;
  img: string;
  best?: string;
  why?: string;
  note?: string;
};

type Labels = { cta: string; bestFor: string; why: string; note: string };

/**
 * Otel akordeonu — yatayda "fermuar gibi" açılır: üstüne gelince/tıklayınca o
 * panel büyür, diğerleri kısalır. Aktif panelde otel seçmeye yardımcı detaylar
 * (kimler için · neden öneriyoruz · dürüst not) + teklif CTA gösterilir.
 * Mobilde dikey istiflenir. CSS flex-grow geçişi.
 */
export function HotelAccordion({ hotels, labels }: { hotels: Hotel[]; labels: Labels }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-2.5 sm:h-[78vh] sm:flex-row sm:gap-3">
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
            aria-label={h.name}
            className="group relative overflow-hidden rounded-3xl outline-none ring-offset-2 transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2"
            style={{
              flexGrow: isActive ? 6 : 1,
              flexBasis: 0,
              minHeight: isActive ? "24rem" : "5rem",
            }}
          >
            <Image
              src={h.img}
              alt={`${h.name}, Antalya`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-transform duration-[1.2s] ${isActive ? "scale-100" : "scale-110"}`}
            />
            <div className="absolute inset-0" style={{ background: isActive ? "linear-gradient(to top, rgba(4,18,24,0.9) 0%, rgba(4,18,24,0.35) 50%, transparent 80%)" : "linear-gradient(to top, rgba(4,18,24,0.78), rgba(4,18,24,0.32))" }} />

            {/* Numara */}
            <span className="absolute left-4 top-4 font-display text-lg text-white/70 sm:text-xl">
              {String(i + 1).padStart(2, "0")}
            </span>

            <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-left text-white sm:p-6">
              <div className="min-w-0">
                <span
                  className="block overflow-hidden text-sm transition-all duration-500"
                  style={{ maxHeight: isActive ? "1.5rem" : 0, opacity: isActive ? 1 : 0, color: "rgb(251 191 80)" }}
                >
                  ★★★★★ <span className="text-white/70">Lüks resort · {h.place}</span>
                </span>
                <span
                  className="font-display block leading-none transition-all duration-500"
                  style={{ fontSize: isActive ? "clamp(1.7rem, 3.2vw, 2.8rem)" : "1.1rem", whiteSpace: "nowrap" }}
                >
                  {h.name}
                </span>
              </div>

              {/* Aktif: seçmeye yardımcı detaylar */}
              <div
                className="overflow-hidden transition-all duration-500"
                style={{ maxHeight: isActive ? "22rem" : 0, opacity: isActive ? 1 : 0 }}
              >
                {h.best && (
                  <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold">
                    {labels.bestFor}: {h.best}
                  </p>
                )}
                {h.why && (
                  <p className="max-w-md text-[13.5px] leading-relaxed text-white/90">
                    <span className="font-semibold">{labels.why}:</span> {h.why}
                  </p>
                )}
                {h.note && (
                  <p className="mt-1.5 max-w-md text-[12.5px] leading-relaxed text-white/65">
                    <span className="font-semibold">{labels.note}:</span> {h.note}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[#06222c]">
                  {labels.cta} <IconArrow />
                </span>
              </div>
            </figcaption>
          </button>
        );
      })}
    </div>
  );
}
