"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export type ZipItem = { name: string; sub: string; img: string; video?: string };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * FERMUAR açılışı — scroll'la sayfa ORTADAN ikiye ayrılır (üst yukarı, alt aşağı),
 * aradan deneyimler/yerler tek tek (biraz biraz) çıkar. Yalnız aktif videonun
 * oynaması ve sadece transform/opacity kullanımı → kasma yok, GPU-dostu.
 */
export function ZipperReveal({ eyebrow, title, items }: { eyebrow: string; title: string; items: ZipItem[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const top = root.querySelector<HTMLElement>(".zip-top");
    const bot = root.querySelector<HTMLElement>(".zip-bot");
    const seam = root.querySelector<HTMLElement>(".zip-seam");
    const pull = root.querySelector<HTMLElement>(".zip-pull");
    const head = root.querySelector<HTMLElement>(".zip-head");
    const cards = Array.from(root.querySelectorAll<HTMLElement>(".zip-card"));
    const N = items.length;
    let activeIdx = -1;

    const apply = () => {
      const total = root.offsetHeight - window.innerHeight;
      const t = root.getBoundingClientRect().top;
      const p = total > 0 ? clamp(-t / total) : 0;

      // Fermuar açılış oranı — ilk yarıda tam açılır.
      const open = clamp(p * 1.85);
      if (top) top.style.transform = `translate3d(0, ${(-open * 100).toFixed(2)}%, 0)`;
      if (bot) bot.style.transform = `translate3d(0, ${(open * 100).toFixed(2)}%, 0)`;
      if (seam) seam.style.opacity = String(1 - clamp(open * 1.4));
      if (pull) pull.style.transform = `translate3d(-50%, ${(open * 46).toFixed(1)}vh, 0)`;
      if (head) head.style.opacity = String(clamp((open - 0.5) * 2));

      // İçerik: her yeni öğe biraz biraz çıkar (crossfade + hafif kayma).
      const fpos = p * N;
      const idx = clamp(Math.floor(p * (N - 0.001)), 0, N - 1);
      for (let k = 0; k < N; k++) {
        const card = cards[k];
        if (!card) continue;
        const local = clamp(fpos - k, -1, 1); // -1..1 around its slot
        const vis = 1 - Math.min(1, Math.abs(local) * 1.25);
        card.style.opacity = String(vis);
        card.style.transform = `translate3d(0, ${(local * -4).toFixed(1)}%, 0) scale(${(0.985 + vis * 0.015).toFixed(3)})`;
        card.style.zIndex = String(k === idx ? 2 : 1);
      }
      if (idx !== activeIdx) {
        activeIdx = idx;
        vids.current.forEach((v, i) => {
          if (!v) return;
          if (i === idx) v.play().catch(() => {});
          else v.pause();
        });
      }
    };

    if (reduce) {
      // Hareket azaltılmışsa: fermuar açık, ilk öğe görünür.
      if (top) top.style.transform = "translateY(-100%)";
      if (bot) bot.style.transform = "translateY(100%)";
      cards.forEach((c, k) => (c.style.opacity = k === 0 ? "1" : "0"));
      return;
    }

    let ticking = false;
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
  }, [items.length]);

  return (
    <section ref={rootRef} className="relative" style={{ height: `${items.length * 75 + 60}vh`, backgroundColor: "#02151f" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* İÇERİK — fermuar açılınca görünür, tek tek crossfade */}
        <div className="absolute inset-0">
          {items.map((it, k) => (
            <div key={it.name} className="zip-card absolute inset-0 will-change-[transform,opacity]" style={{ opacity: k === 0 ? 1 : 0 }}>
              <Image src={it.img} alt={it.name} fill sizes="100vw" className="object-cover" />
              {it.video && (
                <video
                  ref={(el) => { vids.current[k] = el; }}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={it.video}
                  poster={it.img}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,18,28,0.35) 0%, transparent 32%, transparent 55%, rgba(2,18,28,0.82) 100%)" }} />
              <div className="container-wide absolute inset-x-0 bottom-0 z-10 flex items-end justify-between pb-20 text-white sm:pb-28">
                <div>
                  <span className="tracking-widest2 block text-[11px] uppercase text-white/65">{it.sub}</span>
                  <h3 className="font-display mt-2 font-semibold leading-[0.9] tracking-[-0.02em]" style={{ fontSize: "clamp(2.4rem, 7.5vw, 5.5rem)" }}>{it.name}</h3>
                </div>
                <span className="font-display hidden text-4xl text-white/30 sm:block">{String(k + 1).padStart(2, "0")}<span className="text-xl text-white/20">/{String(items.length).padStart(2, "0")}</span></span>
              </div>
            </div>
          ))}
        </div>

        {/* Başlık (açılırken belirir) */}
        <div className="zip-head pointer-events-none absolute inset-x-0 top-[15%] z-30 text-center text-white" style={{ opacity: 0 }}>
          <p className="eyebrow justify-center text-white/85">{eyebrow}</p>
          <h2 className="h-section mx-auto mt-3 max-w-2xl text-balance px-6">{title}</h2>
        </div>

        {/* FERMUAR — üst yarı (gökyüzü/deniz yüzeyi) */}
        <div className="zip-top absolute inset-x-0 top-0 z-20 h-1/2 will-change-transform">
          <Image src="/images/kaputas.jpg" alt="" fill sizes="100vw" className="object-cover object-bottom" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(2,33,47,0.35), rgba(2,33,47,0.7))" }} />
        </div>
        {/* FERMUAR — alt yarı (sualtı) */}
        <div className="zip-bot absolute inset-x-0 bottom-0 z-20 h-1/2 will-change-transform" style={{ background: "linear-gradient(180deg, #0a7e9c 0%, #053f59 55%, #02151f 100%)" }}>
          <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(120% 120% at 50% 0%, rgba(120,220,240,0.25), transparent 60%)" }} />
        </div>

        {/* Dikiş çizgisi + fermuar dili */}
        <div className="zip-seam pointer-events-none absolute inset-x-0 top-1/2 z-30 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgb(var(--gold)), transparent)" }} />
        <div className="zip-pull pointer-events-none absolute left-1/2 top-[calc(50%-18px)] z-30">
          <div className="grid h-9 w-9 place-items-center rounded-full text-white shadow-xl" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--accent2)), rgb(var(--accent)))" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </div>
        </div>
      </div>
    </section>
  );
}
