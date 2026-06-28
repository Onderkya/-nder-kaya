import { Reveal } from "./reveal";

/**
 * Dürüst güven rozetleri sırası — paylaşılan dönüşüm bileşeni.
 * `trust.p1-p5` gibi zaten 5 dile çevrilmiş maddeleri yatay bir kanıt
 * şeridine çevirir. Uydurma yok; somut, doğrulanabilir vaatler.
 * about / faq / education / contact sayfalarında yeniden kullanılır.
 */
export function TrustStrip({ title, points }: { title?: string; points: string[] }) {
  return (
    <Reveal className="mx-auto max-w-5xl">
      {title ? (
        <h2 className="h-section mb-9 text-center text-balance" style={{ color: "rgb(var(--foreground))" }}>{title}</h2>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {points.map((p) => (
          <li
            key={p}
            className="flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-[14px] font-medium leading-snug"
            style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))", color: "rgb(var(--foreground))" }}
          >
            <span
              className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            {p}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
