"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { RouteIcon } from "@/components/route-icons";
import { Pin3D } from "@/components/hotel-cards";
import { IconArrow, IconCheck } from "@/components/icons";

type Step = { icon: string; day: number; t: string; d: string; dl: string };
type Route = {
  key: string; name: string; tag: string; best: string; aud: string;
  days: number; stars: number; hotel: string; loc: string; img: string;
  steps: Step[]; wa: string | null;
};
type Inclusion = { icon: string; label: string };
type Labels = {
  daysWord: string; routeLabel: string; bestForLabel: string; allInLabel: string;
  ctaPick: string; oneMessage: string; flightsNote: string; custom: string;
  curated: string; details: string; close: string; dayByDay: string; contactHref: string;
};

/**
 * Modern paket vitrini: kompakt kartlar yan yana (ızgara) + tıkla → animasyonlu
 * detay modalı ("içine gir"). Kart sade kalır; gün gün plan + tüm dahiller
 * modalda. Tek baskın aksiyon: "Bu tatili iste".
 */
export function RouteGallery({ routes, inclusions, labels }: { routes: Route[]; inclusions: Inclusion[]; labels: Labels }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const active = routes.find((r) => r.key === openKey) ?? null;

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenKey(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [active]);

  return (
    <>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((rt, i) => (
          <Reveal key={rt.key} delay={(i % 3) * 90}>
            <button
              type="button"
              onClick={() => setOpenKey(rt.key)}
              aria-label={`${rt.name} — ${labels.details}`}
              className="route-card group flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] text-left ring-1 ring-black/5"
              style={{ backgroundColor: "rgb(var(--card))" }}
            >
              <div className="route-img relative aspect-[5/6] overflow-hidden">
                <Image src={rt.img} alt={`${rt.name} — ${rt.hotel}`} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.18) 0%, transparent 32%, rgba(4,18,24,0.55) 64%, rgba(4,18,24,0.92) 100%)" }} />
                <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>{rt.aud}</span>
                <div className="glass absolute right-4 top-4 flex items-center gap-1 rounded-full border px-2.5 py-1 text-white" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.45)" }}>
                  <span className="font-display text-lg leading-none">{rt.days}</span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wide text-white/80">{labels.daysWord}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="text-[12px]" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(rt.stars)}</span>
                  <h3 className="font-display mt-1 font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(1.6rem, 2.4vw, 2rem)" }}>{rt.name}</h3>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-1.5 pr-2.5" style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(4 28 40 / 0.4)" }}>
                    <Pin3D />
                    <span className="text-[11px] font-semibold">{rt.hotel}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "rgb(var(--primary))" }}>
                  <IconCheck className="h-3.5 w-3.5" /> {labels.allInLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {inclusions.map((inc) => (
                    <span key={inc.icon} title={inc.label} aria-label={inc.label} className="grid h-8 w-8 place-items-center rounded-lg" style={{ backgroundColor: "rgb(var(--primary) / 0.1)", color: "rgb(var(--primary))" }}>
                      <RouteIcon name={inc.icon} className="h-[16px] w-[16px]" />
                    </span>
                  ))}
                </div>
                <span className="btn-accent pointer-events-none mt-5 w-full justify-center">{labels.details} <IconArrow /></span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={active.name} onClick={() => setOpenKey(null)}>
          <div className="pkg-overlay absolute inset-0" style={{ backgroundColor: "rgb(2 12 18 / 0.66)", backdropFilter: "blur(4px)" }} />
          <div
            className="pkg-panel relative z-10 max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] shadow-2xl sm:rounded-[2rem]"
            style={{ backgroundColor: "rgb(var(--card))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Görsel başlık */}
            <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/8]">
              <Image src={active.img} alt={`${active.name} — ${active.hotel}`} fill sizes="(max-width:768px) 100vw, 672px" className="object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.25) 0%, transparent 35%, rgba(4,18,24,0.6) 70%, rgba(4,18,24,0.95) 100%)" }} />
              <button type="button" onClick={() => setOpenKey(null)} aria-label={labels.close} className="glass absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border text-white transition hover:bg-black/40" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.5)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>{active.aud}</span>
                  <span className="text-[12px]" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(active.stars)}</span>
                  <span className="text-[12px] font-semibold text-white/85">{active.days} {labels.daysWord}</span>
                </div>
                <h3 className="font-display mt-2 font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>{active.name}</h3>
                <p className="mt-1.5 max-w-md text-[14px] text-white/85">{active.tag}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border py-1 pl-1.5 pr-3" style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(4 28 40 / 0.4)" }}>
                  <Pin3D />
                  <span className="text-[12px] font-semibold">{active.hotel} · {active.loc}</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-7">
              <p className="text-[14px] leading-snug" style={{ color: "rgb(var(--muted-foreground))" }}>
                <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{labels.bestForLabel}:</span> {active.best}
              </p>

              {/* Her şey dahil */}
              <div className="mt-5 rounded-2xl border p-4 sm:p-5" style={{ borderColor: "rgb(var(--primary) / 0.18)", backgroundColor: "rgb(var(--lagoon) / 0.06)" }}>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "rgb(var(--primary))" }}>
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}><IconCheck className="h-3 w-3" /></span>
                  {labels.allInLabel}
                </p>
                <ul className="mt-3.5 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
                  {inclusions.map((inc) => (
                    <li key={inc.icon} className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: "rgb(var(--primary) / 0.1)", color: "rgb(var(--primary))" }}>
                        <RouteIcon name={inc.icon} className="h-[15px] w-[15px]" />
                      </span>
                      <span className="text-[13.5px] font-medium leading-tight" style={{ color: "rgb(var(--foreground))" }}>{inc.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gün gün plan */}
              <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgb(var(--accent))" }}>{labels.dayByDay}</p>
              <ol className="mt-4">
                {active.steps.map((s, si) => {
                  const newDay = si === 0 || s.day !== active.steps[si - 1].day;
                  const last = si === active.steps.length - 1;
                  return (
                    <li key={si} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-md" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
                          <RouteIcon name={s.icon} className="h-[18px] w-[18px]" />
                        </span>
                        {!last && <span className="my-1 w-0.5 flex-1 rounded-full" style={{ backgroundColor: "rgb(var(--border))" }} />}
                      </div>
                      <div className={last ? "pb-0" : "pb-5"}>
                        {newDay && (
                          <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}>{s.dl}</span>
                        )}
                        <p className={`font-semibold ${newDay ? "mt-1.5" : ""}`} style={{ color: "rgb(var(--foreground))" }}>{s.t}</p>
                        <p className="mt-0.5 text-[13.5px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{s.d}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Tek baskın aksiyon */}
              <a
                href={active.wa ?? labels.contactHref}
                target={active.wa ? "_blank" : undefined}
                rel={active.wa ? "noopener noreferrer" : undefined}
                className="btn-accent mt-7 w-full justify-center py-4 text-base shadow-xl shadow-black/15"
              >
                {labels.ctaPick} <IconArrow />
              </a>
              <p className="mt-3 text-center text-[12.5px]" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.oneMessage}</p>
              <p className="mx-auto mt-1 max-w-sm text-center text-[11.5px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.flightsNote} · {labels.custom}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
