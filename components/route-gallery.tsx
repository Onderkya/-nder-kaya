"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { TourIcon, type TourIconData } from "@/components/tour-icon";
import { Pin3D } from "@/components/hotel-cards";
import { IconArrow, IconCheck } from "@/components/icons";
import { whatsappLink, telegramLink, siteConfig } from "@/lib/config";

type Step = { icon: TourIconData; day: number; t: string; d: string; dl: string };
type Inclusion = { icon: TourIconData; label: string };
type Route = {
  key: string; name: string; tag: string; best: string; aud: string;
  days: number; stars: number; hotel: string; loc: string; img?: string;
  steps: Step[]; inclusions: Inclusion[]; wa: string | null;
  hotelWhy: string; hotelNote: string; mapQ: string;
};
type Addon = { key: string; label: string };
type Labels = {
  daysWord: string; routeLabel: string; bestForLabel: string; allInLabel: string;
  ctaPick: string; oneMessage: string; flightsNote: string; custom: string;
  curated: string; details: string; close: string; dayByDay: string; contactHref: string;
  priceLabel: string; whyHotel: string; mapTitle: string; noteLabel: string;
  custTitle: string; custHint: string; addonsTitle: string; addNotePh: string;
  mIntro2: string; mKept: string; mRemoved: string; mAddons: string; mNote: string;
  tgPick: string; tgCopied: string; emailPick: string;
};

const CORE_STEPS = 3; // uçuş + transfer + giriş her zaman dahil (çıkarılamaz)

/**
 * Modern paket vitrini: kompakt kartlar yan yana (ızgara) + tıkla → animasyonlu
 * detay modalı ("içine gir"). Kart sade kalır; gün gün plan + tüm dahiller
 * modalda. Tek baskın aksiyon: "Bu tatili iste".
 */
export function RouteGallery({ routes, addons, labels }: { routes: Route[]; addons: Addon[]; labels: Labels }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [excluded, setExcluded] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [tgCopied, setTgCopied] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const activeRef = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = routes.find((r) => r.key === openKey) ?? null;

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { activeRef.current = !!active; }, [active]);

  // Sonsuz otomatik kaydırma (sola). Üstüne gelince / dokununca / modal açıkken durur.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const tick = () => {
      if (el && !pausedRef.current && !activeRef.current && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += 0.5;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // İleri/geri — kart genişliği kadar kaydır; başa gelince sona sar (sonsuz).
  const step = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    pausedRef.current = true; // otomatik kaymayı durdur — kendi yumuşak tween'imiz var
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    const card = el.querySelector<HTMLElement>("[data-pkg-card]");
    const w = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    const half = el.scrollWidth / 2;
    if (dir < 0 && el.scrollLeft - w < 0) el.scrollLeft += half; // başta → sona sar
    // Elle yumuşak kaydırma (native smooth, rAF yazımıyla çakıştığı için güvenilmez).
    const startX = el.scrollLeft;
    const target = startX + dir * w;
    const dur = 480;
    let t0 = 0;
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);
    const anim = (now: number) => {
      if (!t0) t0 = now;
      const p = Math.min(1, (now - t0) / dur);
      el.scrollLeft = startX + (target - startX) * ease(p);
      if (p < 1) requestAnimationFrame(anim);
      else resumeTimer.current = setTimeout(() => { pausedRef.current = false; }, 700);
    };
    requestAnimationFrame(anim);
  };

  // Modal her açıldığında kişiselleştirme seçimleri sıfırlanır.
  useEffect(() => { setExcluded(new Set()); setPicked(new Set()); setNote(""); setTgCopied(false); }, [openKey]);

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

  // Kişiselleştirilmiş paketi mesaja çevirir; kanalı müşteri seçer.
  // WhatsApp: mesaj önyazılı açılır. Telegram: t.me önyazmayı desteklemediği için
  // özet panoya kopyalanır, müşteri yapıştırıp gönderir. Hiçbiri yoksa /contact.
  function buildMessage(): string | null {
    if (!active) return null;
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
    return lines.join("\n");
  }

  function sendRequest() {
    const msg = buildMessage();
    if (msg == null) return;
    if (siteConfig.whatsappConfigured) {
      window.open(whatsappLink(msg), "_blank", "noopener");
    } else {
      // WhatsApp yoksa: özet iletişim formuna taşınır (lead olarak yakalanır).
      try { sessionStorage.setItem("pkgRequest", msg); } catch { /* yok say */ }
      window.location.href = labels.contactHref;
    }
  }

  function sendViaTelegram() {
    const msg = buildMessage();
    if (msg == null) return;
    // Panoya kopyala (başarısız olsa da Telegram yine açılır).
    try { void navigator.clipboard?.writeText(msg); } catch { /* yok say */ }
    setTgCopied(true);
    window.open(telegramLink(), "_blank", "noopener");
  }

  function sendViaEmail() {
    const msg = buildMessage();
    if (msg == null || !active) return;
    // mailto: konu = paket adı, gövde = kişiselleştirilmiş özet.
    window.location.href = `mailto:${siteConfig.email}?subject=${encodeURIComponent(active.name)}&body=${encodeURIComponent(msg)}`;
  }

  return (
    <>
      <div className="relative mt-12 w-full">
        {/* Kenar yumuşatma (sinematik fade) */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-28" style={{ background: "linear-gradient(90deg, rgb(var(--background)), transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-28" style={{ background: "linear-gradient(270deg, rgb(var(--background)), transparent)" }} />

        {/* İleri / geri */}
        <button type="button" aria-label="‹" onClick={() => step(-1)} className="absolute left-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border shadow-lg backdrop-blur transition hover:scale-105 sm:left-4" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card) / 0.92)", color: "rgb(var(--foreground))" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <button type="button" aria-label="›" onClick={() => step(1)} className="absolute right-2 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border shadow-lg backdrop-blur transition hover:scale-105 sm:right-4" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card) / 0.92)", color: "rgb(var(--foreground))" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>

        <div
          ref={railRef}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
          onTouchStart={() => { pausedRef.current = true; }}
          onTouchEnd={() => { pausedRef.current = false; }}
          className="no-scrollbar flex gap-5 overflow-x-auto px-3 py-2"
        >
          {[...routes, ...routes].map((rt, i) => (
            <button
              key={`${rt.key}-${i}`}
              data-pkg-card
              type="button"
              onClick={() => setOpenKey(rt.key)}
              aria-label={`${rt.name} — ${labels.details}`}
              className="route-card group relative w-[80vw] max-w-[360px] shrink-0 overflow-hidden rounded-[2rem] text-left ring-1 ring-black/5 sm:w-[360px]"
            >
              <div className="route-img relative aspect-[5/7] overflow-hidden">
                {rt.img ? <Image src={rt.img} alt={`${rt.name} — ${rt.hotel}`} fill sizes="(max-width:640px) 84vw, 360px" className="object-cover" /> : null}
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,18,24,0.15) 0%, transparent 24%, rgba(4,18,24,0.5) 50%, rgba(4,18,24,0.96) 100%)" }} />
                <span className="absolute left-4 top-4 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-wide text-white shadow-lg" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>{rt.aud}</span>
                <div className="glass absolute right-4 top-4 flex items-center gap-1 rounded-full border px-2.5 py-1 text-white" style={{ borderColor: "rgb(255 255 255 / 0.3)", backgroundColor: "rgb(4 28 40 / 0.45)" }}>
                  <span className="font-display text-lg leading-none">{rt.days}</span>
                  <span className="text-[9.5px] font-semibold uppercase tracking-wide text-white/80">{labels.daysWord}</span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <span className="text-[12px]" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(rt.stars)}</span>
                  <h3 className="font-display mt-1 font-semibold leading-[0.9] tracking-[-0.015em]" style={{ fontSize: "clamp(2.15rem, 6vw, 2.7rem)", textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}>{rt.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border py-0.5 pl-1.5 pr-2.5" style={{ borderColor: "rgb(255 255 255 / 0.25)", backgroundColor: "rgb(4 28 40 / 0.4)" }}>
                      <Pin3D />
                      <span className="text-[11px] font-semibold">{rt.hotel}</span>
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ backgroundColor: "rgb(var(--gold) / 0.22)", color: "rgb(var(--gold))" }}>{labels.priceLabel}</span>
                  </div>
                  <p className="mt-3.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/85"><IconCheck className="h-3 w-3" /> {labels.allInLabel}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {rt.inclusions.map((inc, ii) => (
                      <span key={ii} title={inc.label} aria-label={inc.label} className="grid h-7 w-7 place-items-center rounded-lg text-white" style={{ backgroundColor: "rgb(255 255 255 / 0.16)" }}>
                        <TourIcon icon={inc.icon} className="h-[14px] w-[14px]" />
                      </span>
                    ))}
                  </div>
                  <span className="btn-accent pointer-events-none mt-4 w-full justify-center">{labels.details} <IconArrow /></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && mounted && createPortal(
        <div data-lenis-prevent className="fixed inset-0 z-[80] flex items-end justify-center overscroll-contain sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={active.name} onClick={() => setOpenKey(null)}>
          <div className="pkg-overlay absolute inset-0" style={{ backgroundColor: "rgb(2 12 18 / 0.66)", backdropFilter: "blur(4px)" }} />
          <div
            data-lenis-prevent
            className="pkg-panel relative z-10 max-h-[94vh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-[2rem] shadow-2xl sm:rounded-[2rem]"
            style={{ backgroundColor: "rgb(var(--card))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Görsel başlık */}
            <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/8]">
              {active.img ? <Image src={active.img} alt={`${active.name} — ${active.hotel}`} fill sizes="(max-width:768px) 100vw, 672px" className="object-cover" /> : null}
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
                <h3 className="font-display mt-2 font-semibold leading-[0.92] tracking-[-0.015em]" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3rem)", textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}>{active.name}</h3>
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

              {/* Neden bu otel — satış metni */}
              {active.hotelWhy && (
                <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--muted) / 0.4)" }}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgb(var(--accent))" }}>{labels.whyHotel}</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>{active.hotelWhy}</p>
                  {active.hotelNote && (
                    <p className="mt-2 text-[12.5px] italic leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.noteLabel}: {active.hotelNote}</p>
                  )}
                </div>
              )}

              {/* Otelin tam konumu — gerçek harita (denizin kenarı) */}
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: "rgb(var(--accent))" }}>{labels.mapTitle}</p>
              <div className="mt-3 overflow-hidden rounded-2xl border" style={{ borderColor: "rgb(var(--border))" }}>
                <iframe
                  title={active.hotel}
                  src={`https://www.google.com/maps?q=${active.mapQ}&z=14&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-[230px] w-full"
                  style={{ border: 0 }}
                />
              </div>

              {/* Her şey dahil */}
              <div className="mt-5 rounded-2xl border p-4 sm:p-5" style={{ borderColor: "rgb(var(--primary) / 0.18)", backgroundColor: "rgb(var(--lagoon) / 0.06)" }}>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "rgb(var(--primary))" }}>
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}><IconCheck className="h-3 w-3" /></span>
                  {labels.allInLabel}
                </p>
                <ul className="mt-3.5 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
                  {active.inclusions.map((inc, ii) => (
                    <li key={ii} className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: "rgb(var(--primary) / 0.1)", color: "rgb(var(--primary))" }}>
                        <TourIcon icon={inc.icon} className="h-[15px] w-[15px]" />
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
                          <TourIcon icon={s.icon} className="h-[18px] w-[18px]" />
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

              {/* Kişiselleştirilmiş paketi gönder — kanal seçimi müşteride */}
              <button type="button" onClick={sendRequest} className="btn-accent mt-6 w-full justify-center py-4 text-base shadow-xl shadow-black/15">
                {labels.ctaPick} <IconArrow />
              </button>
              {siteConfig.telegramConfigured ? (
                <button
                  type="button"
                  onClick={sendViaTelegram}
                  className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:brightness-110"
                  style={{ borderColor: "rgb(34 158 217 / 0.55)", backgroundColor: "rgb(34 158 217 / 0.10)", color: "#229ED9" }}
                >
                  {labels.tgPick}
                </button>
              ) : null}
              <button
                type="button"
                onClick={sendViaEmail}
                className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:brightness-110"
                style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--muted) / 0.5)", color: "rgb(var(--foreground))" }}
              >
                {labels.emailPick}
              </button>
              {tgCopied ? (
                <p className="mt-2 text-center text-[12px] font-semibold" style={{ color: "#229ED9" }}>{labels.tgCopied}</p>
              ) : null}
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
