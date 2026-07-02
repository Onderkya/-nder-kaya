import Image from "next/image";
import { Link } from "@/i18n/routing";
import { IconArrow } from "./icons";

export type HotelCard = {
  name: string;
  location: string;
  img: string;
  best: string;
  why: string;
  note: string;
  /** Önceden doldurulmuş wa.me linki; WhatsApp ayarlı değilse null/undefined. */
  wa?: string | null;
  /** t.me linki; Telegram ayarlı değilse null/undefined. Müşteri kanalı kendi seçer. */
  tg?: string | null;
  /** mailto linki (konu+gövde önyazılı). E-posta her zaman ayarlı olduğundan hep dolu gelir. */
  em?: string | null;
};

type Labels = { cta: string; bestFor: string; why: string; note: string; waAsk?: string; tgAsk?: string; emailAsk?: string };

/** 3D görünümlü konum pini — katmanlı gradient + iç parlama + yumuşak gölge. */
export function Pin3D() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.45))" }}>
      <defs>
        <linearGradient id="pin3d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fe9ff" />
          <stop offset="45%" stopColor="rgb(var(--lagoon))" />
          <stop offset="100%" stopColor="rgb(var(--primary))" />
        </linearGradient>
        <radialGradient id="pin3dHi" cx="35%" cy="28%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <path d="M12 1.6c-4 0-7.2 3.1-7.2 7 0 5 6.2 13 6.7 13.6.3.3.7.3 1 0 .5-.6 6.7-8.6 6.7-13.6 0-3.9-3.2-7-7.2-7Z" fill="url(#pin3d)" stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" />
      <path d="M12 1.6c-4 0-7.2 3.1-7.2 7 0 5 6.2 13 6.7 13.6.3.3.7.3 1 0 .5-.6 6.7-8.6 6.7-13.6 0-3.9-3.2-7-7.2-7Z" fill="url(#pin3dHi)" />
      <circle cx="12" cy="8.5" r="2.8" fill="#06222c" />
      <circle cx="12" cy="8.5" r="2.8" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.7" />
    </svg>
  );
}

/**
 * Otel kartları — premium grid. Her kartın sağ üstünde 3D konum pini + yer adı.
 * Görsel + isim/yıldız üstte; gövdede "kimler için · neden · dürüst not" + teklif CTA.
 */
export function HotelCards({ hotels, labels }: { hotels: HotelCard[]; labels: Labels }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {hotels.map((h, i) => (
        <article
          key={h.name}
          className="card-lift group flex h-full flex-col overflow-hidden rounded-[1.75rem] shadow-xl ring-1 ring-black/5"
          style={{ backgroundColor: "rgb(var(--card))" }}
        >
          <div className="img-zoom relative aspect-[4/3] overflow-hidden">
            <Image
              src={h.img}
              alt={`${h.name}, ${h.location}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              priority={i < 3}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.28) 0%, transparent 32%, rgba(4,18,24,0.35) 62%, rgba(4,18,24,0.86) 100%)" }} />

            {/* 3D konum pini — sağ üst */}
            <div className="glass absolute right-3 top-3 flex items-center gap-1.5 rounded-full border py-1.5 pl-2 pr-3 text-white" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.42)" }}>
              <Pin3D />
              <span className="text-[12px] font-semibold leading-none">{h.location}</span>
            </div>

            {/* İsim + yıldız */}
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="text-[13px] tracking-wide" style={{ color: "rgb(251 191 80)" }}>★★★★★</span>
              <h3 className="font-display mt-0.5 font-semibold leading-[0.98] tracking-[-0.02em]" style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}>
                {h.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <span className="inline-flex w-fit items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon) / 0.16), rgb(var(--primary) / 0.16))", color: "rgb(var(--primary))" }}>
              {labels.bestFor}: {h.best}
            </span>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
              <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{labels.why}:</span> {h.why}
            </p>
            <p className="mt-2 mb-6 flex gap-1.5 text-[12.5px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
              <span aria-hidden="true">ⓘ</span>
              <span><span className="font-semibold">{labels.note}:</span> {h.note}</span>
            </p>
            <div className="mt-auto">
              <Link href="/contact" className="btn-accent w-full justify-center shadow-lg shadow-black/10">
                {labels.cta} <IconArrow />
              </Link>
              {(h.wa && labels.waAsk) || (h.tg && labels.tgAsk) || (h.em && labels.emailAsk) ? (
                /* Kanal seçimi müşteride: WhatsApp · Telegram · E-posta */
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {h.wa && labels.waAsk ? (
                    <a
                      href={h.wa}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-[13px] font-semibold transition hover:brightness-110"
                      style={{ borderColor: "rgb(37 211 102 / 0.55)", backgroundColor: "rgb(37 211 102 / 0.10)", color: "#1da851" }}
                    >
                      {labels.waAsk}
                    </a>
                  ) : null}
                  {h.tg && labels.tgAsk ? (
                    <a
                      href={h.tg}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-[13px] font-semibold transition hover:brightness-110"
                      style={{ borderColor: "rgb(34 158 217 / 0.55)", backgroundColor: "rgb(34 158 217 / 0.10)", color: "#229ED9" }}
                    >
                      {labels.tgAsk}
                    </a>
                  ) : null}
                  {h.em && labels.emailAsk ? (
                    <a
                      href={h.em}
                      className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border px-3 py-2.5 text-[13px] font-semibold transition hover:brightness-110"
                      style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--muted) / 0.5)", color: "rgb(var(--foreground))" }}
                    >
                      {labels.emailAsk}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
