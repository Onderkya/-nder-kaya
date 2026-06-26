"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconArrow } from "./icons";

export type Hotel = { name: string; place: string; img: string };

/**
 * Otel vitrini — büyük sinematik "sahne" + altında yatay küçük resim rayı.
 * Aktif otel tam ekran kartta yavaş Ken Burns zoom ile durur (5★ rozet, dev serif
 * ad, yer + CTA). Ray'dan birine gel/tıkla → cross-fade ile değişir. Kullanıcı
 * etkileşimi yokken nazik otomatik geçiş; fareyle/odakla durur. Resort-web lüks dili.
 */
export function HotelShowcase({ hotels, ctaLabel, ctaHref = "/contact" }: { hotels: Hotel[]; ctaLabel: string; ctaHref?: string }) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const N = hotels.length;

  useEffect(() => {
    if (N <= 1) return;
    const id = window.setInterval(() => {
      if (!paused.current) setActive((a) => (a + 1) % N);
    }, 5000);
    return () => window.clearInterval(id);
  }, [N]);

  return (
    <div onMouseEnter={() => (paused.current = true)} onMouseLeave={() => (paused.current = false)}>
      {/* SAHNE */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] sm:aspect-[16/9] lg:aspect-[21/9]">
        {hotels.map((h, i) => (
          <div key={h.name} className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}>
            <Image src={h.img} alt={`${h.name}, ${h.place}`} fill sizes="100vw" className={`object-cover transition-transform duration-[6000ms] ease-out ${i === active ? "scale-110" : "scale-100"}`} priority={i === 0} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.35) 0%, transparent 30%, transparent 46%, rgba(4,18,24,0.9) 100%)" }} />
          </div>
        ))}

        {/* sayaç */}
        <span className="font-display absolute left-6 top-5 z-10 text-xl text-white/70 sm:left-9 sm:top-7 sm:text-2xl">
          {String(active + 1).padStart(2, "0")} <span className="text-white/40">/ {String(N).padStart(2, "0")}</span>
        </span>

        {/* başlık */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white sm:p-10">
          <span className="mb-2 block text-sm font-semibold" style={{ color: "rgb(251 191 80)" }}>
            ★★★★★ <span className="font-normal text-white/70">Lüks resort</span>
          </span>
          <h3 className="font-display font-semibold leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.5rem)" }}>{hotels[active].name}</h3>
          <div className="tracking-widest2 mt-4 flex items-center gap-3 text-[11px] uppercase text-white/85">
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">{hotels[active].place}</span>
            <a href={ctaHref} className="inline-flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-white/75">{ctaLabel} <IconArrow /></a>
          </div>
        </div>
      </div>

      {/* KÜÇÜK RESİM RAYI */}
      <div className="-mx-6 mt-4 flex gap-2.5 overflow-x-auto px-6 pb-2 sm:mx-0 sm:mt-5 sm:flex-wrap sm:gap-3 sm:overflow-visible sm:px-0" style={{ scrollbarWidth: "none" }}>
        {hotels.map((h, i) => (
          <button
            key={h.name}
            type="button"
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-label={`${h.name}, ${h.place}`}
            aria-pressed={i === active}
            className="group relative h-20 w-28 shrink-0 overflow-hidden rounded-2xl outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-offset-2 sm:h-24 sm:w-36"
            style={{ opacity: i === active ? 1 : 0.6, boxShadow: i === active ? "0 0 0 2px rgb(var(--accent))" : "none" }}
          >
            <Image src={h.img} alt="" fill sizes="160px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <span className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,18,24,0.78), transparent 65%)" }} />
            <span className="font-display absolute inset-x-0 bottom-0 truncate px-2.5 py-1.5 text-left text-xs text-white sm:text-sm">{h.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
