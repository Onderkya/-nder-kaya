import { Link } from "@/i18n/routing";
import { IconArrow } from "./icons";
import { PetLingoLive } from "./petlingo-live";

/**
 * PetLingo destek vitrini — Türkçe öğrenme sayfasında "her gün pratik" aracı.
 * Sol: CANLI uygulama demosu (gerçek Lottie pet'leri, interaktif). Sağ: özellikler + CTA.
 * Uygulama henüz mağazalarda değil → mağaza rozetleri "yakında".
 */

type Labels = {
  eyebrow: string;
  title: string;
  desc: string;
  features: string[];
  cta: string;
  soon: string;
  combo: string;
};

export function PetLingoShowcase({ labels }: { labels: Labels }) {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" style={{ background: "radial-gradient(120% 110% at 15% 0%, #0c4a5c 0%, #07303d 45%, #061a22 100%)" }}>
      <div className="container-wide grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Telefon mockup */}
        <div className="order-2 flex justify-center lg:order-1">
          <div className="phone-mock float-soft">
            <div className="phone-notch" />
            <div className="phone-screen">
              <PetLingoLive />
            </div>
          </div>
        </div>

        {/* Metin + özellikler */}
        <div className="order-1 lg:order-2">
          <p className="eyebrow" style={{ color: "rgb(var(--accent2))" }}>{labels.eyebrow}</p>
          <h2 className="font-display mt-5 font-semibold leading-[1.0] tracking-[-0.015em] text-white" style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)" }}>
            {labels.title}
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">{labels.desc}</p>

          <div className="mt-8 grid max-w-lg grid-cols-2 gap-3">
            {labels.features.map((f) => (
              <div key={f} className="flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium text-white/90" style={{ borderColor: "rgb(255 255 255 / 0.14)", backgroundColor: "rgb(255 255 255 / 0.05)" }}>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: "rgb(var(--accent2))" }} />
                {f}
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/contact" className="btn-accent shadow-xl shadow-black/30">
              {labels.cta} <IconArrow />
            </Link>
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold text-white/70" style={{ borderColor: "rgb(255 255 255 / 0.2)" }}> App Store</span>
                <span className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold text-white/70" style={{ borderColor: "rgb(255 255 255 / 0.2)" }}>▶ Google Play</span>
              </div>
              <span className="text-[11px] text-white/45">{labels.soon}</span>
            </div>
          </div>

          <p className="mt-7 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold" style={{ backgroundColor: "rgb(var(--accent2) / 0.16)", color: "rgb(var(--accent2))" }}>
            ⚡ {labels.combo}
          </p>
        </div>
      </div>
    </section>
  );
}
