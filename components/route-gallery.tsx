"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { RouteIcon } from "@/components/route-icons";
import { Pin3D } from "@/components/hotel-cards";
import { IconArrow, IconCheck } from "@/components/icons";
import { whatsappLink, siteConfig } from "@/lib/config";

type Step = { icon: string; day: number; t: string; d: string; dl: string };
type Route = {
  key: string; name: string; tag: string; best: string; aud: string;
  days: number; stars: number; hotel: string; loc: string; img: string;
  steps: Step[]; wa: string | null;
};
type Inclusion = { icon: string; label: string };
type Addon = { key: string; label: string };
type Labels = {
  daysWord: string; routeLabel: string; bestForLabel: string; allInLabel: string;
  ctaPick: string; oneMessage: string; flightsNote: string; custom: string;
  curated: string; details: string; close: string; dayByDay: string; contactHref: string;
  custTitle: string; custHint: string; addonsTitle: string; addNotePh: string;
  mIntro2: string; mKept: string; mRemoved: string; mAddons: string; mNote: string;
};

const CORE_STEPS = 3; // uçuş + transfer + giriş her zaman dahil (çıkarılamaz)

/**
 * Modern paket vitrini: kompakt kartlar yan yana (ızgara) + tıkla → animasyonlu
 * detay modalı ("içine gir"). Kart sade kalır; gün gün plan + tüm dahiller
 * modalda. Tek baskın aksiyon: "Bu tatili iste".
 */
export function RouteGallery({ routes, inclusions, addons, labels }: { routes: Route[]; inclusions: Inclusion[]; addons: Addon[]; labels: Labels }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const railRef = useRef<HTMLDivElement>(null);
  const active = routes.find((r) => r.key === openKey) ?? null;

  const scrollRail = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-pkg-card]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  useEffect(() => { setMounted(true); }, []);

  // Modal her açıldığında kişiselleştirme seçimleri sıfırlanır.
  useEffect(() => { setExcluded(new Set()); setPicked(new Set()); setNote(""); }, [openKey]);

  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenKey(null); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [active]);

  const toggleStep = (i: number) =>
    setExcluded((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const toggleAddon = (k: string) =>
    setPicked((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Kişiselleştirilmiş paketi WhatsApp mesajına çevirir (numara yoksa /contact).
  function sendRequest() {
    if (!active) return;
    const program = active.steps.filter((_, i) => i < CORE_STEPS || !excluded.has(i)).map((s) => `• ${s.t}`);
    const removed = active.steps.filter((s, i) => i >= CORE_STEPS && excluded.has(i)).map((s) => s.t);
    const wantedAddons = addons.filter((a) => picked.has(a.key)).map((a) => a.label);
    const lines = [
      labels.mIntro2,
      `${active.name} — ${active.days} ${labels.daysWord}, ${active.hotel}`,
      `${labels.mKept}:`,
      ...program,
    ];
    if (removed.length) lines.push(`${labels.mRemoved}: ${removed.join(", ")}`);
    if (wantedAddons.length) lines.push(`${labels.mAddons}: ${wantedAddons.join(", ")}`);
    if (note.trim()) lines.push(`${labels.mNote}: ${note.trim()}`);
    const msg = lines.join("\n");
    if (siteConfig.whatsappConfigured) window.open(whatsappLink(msg), "_blank", "noopener");
    else window.location.href = labels.contactHref;
  }

  return (
    <>
      <Reveal className="relative mt-12">
        {/* Oklar — masaüstü */}
        <button type="button" aria-label="‹" onClick={() => scrollRail(-1)} className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border p-2.5 shadow-lg backdrop-blur transition hover:scale-105 sm:grid lg:-left-5" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card) / 0.9)", color: "rgb(var(--foreground))" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button type="button" aria-label="›" onClick={() => scrollRail(1)} className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 place-items-center rounded-full border p-2.5 shadow-lg backdrop-blur transition hover:scale-105 sm:grid lg:-right-5" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card) / 0.9)", color: "rgb(var(--foreground))" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>

        <div ref={railRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-3">
          {routes.map((rt) => (
            <button
              key={rt.key}
              data-pkg-card
              type="button"
              onClick={() => setOpenKey(rt.key)}
              aria-label={`${rt.name} — ${labels.details}`}
              className="route-card group relative w-[84vw] max-w-[360px] shrink-0 snap-center overflow-hidden rounded-[2rem] text-left ring-1 ring-black/5 sm:w-[360px]"
            >
              <div className="route-img relative aspect-[5/7] overflow-hidden">
                <Image src={rt.img} alt={`${rt.name} — ${rt.hotel}`} fill sizes="(max-width:640px) 84vw, 360px" className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.15) 0%, transparent 24%, rgba(4,18,24,0.5) 50%, rgba(4,18,24,0.96) 100%)" }} />
                <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>{rt.aud}</span>
                <div className="glass absolute right-4 top-4 flex items-center gap-1 rounded-full border px-2.5 py-1 text-white" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.45)" }}>
                  <span className="font-display text-lg leading-none">{rt.days}</span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wide text-white/80">{labels.daysWord}</span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="text-[12px]" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(rt.stars)}</span>
                  <h3 className="font-display mt-1 font-semibold leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(1.95rem, 5.4vw, 2.35rem)" }}>{rt.name}</h3>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-1.5 pr-2.5" style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(4 28 40 / 0.4)" }}>
                    <Pin3D />
                    <span className="text-[11px] font-semibold">{rt.hotel}</span>
                  </div>
                  <p className="mt-3.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/85"><IconCheck className="h-3 w-3" /> {labels.allInLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {inclusions.map((inc) => (
                      <span key={inc.icon} title={inc.label} aria-label={inc.label} className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ backgroundColor: "rgb(255 255 255 / 0.16)" }}>
                        <RouteIcon name={inc.icon} className="h-[14px] w-[14px]" />
                      </span>
                    ))}
                  </div>
                  <span className="btn-accent pointer-events-none mt-4 w-full justify-center">{labels.details} <IconArrow /></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Reveal>
      <p className="mt-3 text-center text-[15px] tracking-[0.5em] sm:hidden" style={{ color: "rgb(var(--muted-foreground))" }} aria-hidden>‹ ›</p>

      {active && mounted && createPortal(
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

              {/* Kişiselleştir: durak çıkar + ekle */}
              <div className="mt-7 flex items-baseline justify-between gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgb(var(--accent))" }}>{labels.dayByDay}</p>
                <p className="text-[12px] font-semibold" style={{ color: "rgb(var(--primary))" }}>{labels.custTitle}</p>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.custHint}</p>
              <ol className="mt-4">
                {active.steps.map((s, si) => {
                  const newDay = si === 0 || s.day !== active.steps[si - 1].day;
                  const last = si === active.steps.length - 1;
                  const toggleable = si >= CORE_STEPS;
                  const off = excluded.has(si);
                  return (
                    <li key={si} className={`flex gap-4 transition-opacity ${off ? "opacity-40" : ""}`}>
                      <div className="flex flex-col items-center">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white shadow-md" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
                          <RouteIcon name={s.icon} className="h-[18px] w-[18px]" />
                        </span>
                        {!last && <span className="my-1 w-0.5 flex-1 rounded-full" style={{ backgroundColor: "rgb(var(--border))" }} />}
                      </div>
                      <div className={`flex-1 ${last ? "pb-0" : "pb-5"}`}>
                        {newDay && (
                          <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: "rgb(var(--accent) / 0.12)", color: "rgb(var(--accent))" }}>{s.dl}</span>
                        )}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={`font-semibold ${newDay ? "mt-1.5" : ""} ${off ? "line-through" : ""}`} style={{ color: "rgb(var(--foreground))" }}>{s.t}</p>
                            <p className="mt-0.5 text-[13.5px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{s.d}</p>
                          </div>
                          {toggleable && (
                            <button
                              type="button"
                              onClick={() => toggleStep(si)}
                              aria-pressed={!off}
                              aria-label={s.t}
                              className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition"
                              style={off
                                ? { borderColor: "rgb(var(--border))", color: "rgb(var(--muted-foreground))", backgroundColor: "transparent" }
                                : { borderColor: "transparent", color: "#fff", backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}
                            >
                              {off
                                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                                : <IconCheck className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {/* Eklemek ister misin? */}
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgb(var(--accent))" }}>{labels.addonsTitle}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {addons.map((a) => {
                  const on = picked.has(a.key);
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => toggleAddon(a.key)}
                      aria-pressed={on}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition"
                      style={on
                        ? { borderColor: "transparent", color: "#fff", backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }
                        : { borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))", backgroundColor: "transparent" }}
                    >
                      {on ? <IconCheck className="h-3.5 w-3.5" /> : <span className="text-base leading-none">+</span>} {a.label}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={labels.addNotePh}
                rows={2}
                className="mt-4 w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-[14px] outline-none transition focus:ring-2"
                style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
              />

              {/* Kişiselleştirilmiş paketi gönder */}
              <button type="button" onClick={sendRequest} className="btn-accent mt-6 w-full justify-center py-4 text-base shadow-xl shadow-black/15">
                {labels.ctaPick} <IconArrow />
              </button>
              <p className="mt-3 text-center text-[12.5px]" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.oneMessage}</p>
              <p className="mx-auto mt-1 max-w-sm text-center text-[11.5px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.flightsNote} · {labels.custom}</p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
