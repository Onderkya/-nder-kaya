import { Link } from "@/i18n/routing";
import { IconArrow } from "./icons";
import { Reveal } from "./reveal";

/**
 * Paylaşılan kapanış dönüşüm bandı — mevcut "lived" güven bandıyla aynı
 * görsel dilde (turkuaz→deniz gradyan). Birincil aksiyon her zaman çalışan,
 * yerelleştirilmiş bir iç bağlantıdır (lead yakalama). İkincil WhatsApp
 * yalnızca numara yapılandırılmışsa render edilir → ölü link yok.
 */
export function ConversionBand({
  eyebrow,
  title,
  text,
  ctaLabel,
  ctaHref = "/contact",
  waLabel,
  waHref,
  tgLabel,
  tgHref,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  ctaLabel: string;
  ctaHref?: string;
  waLabel?: string;
  waHref?: string;
  tgLabel?: string;
  tgHref?: string;
}) {
  return (
    <section className="relative overflow-hidden py-20 text-white sm:py-24" style={{ background: "linear-gradient(135deg, #0d94a8 0%, #0e7490 50%, #07303d 130%)" }}>
      <span className="sheen" />
      <div className="container-wide relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          {eyebrow ? <p className="eyebrow justify-center text-white/80">{eyebrow}</p> : null}
          <h2 className="h-section mt-4 text-balance">{title}</h2>
          {text ? <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/85">{text}</p> : null}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href={ctaHref} className="btn-accent shadow-xl shadow-black/25">{ctaLabel} <IconArrow /></Link>
            {waLabel && waHref ? (
              <a href={waHref} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                {waLabel}
              </a>
            ) : null}
            {tgLabel && tgHref ? (
              <a href={tgHref} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                {tgLabel}
              </a>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
