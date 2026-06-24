import { Link } from "@/i18n/routing";
import { IconArrow } from "./icons";

export type Review = { name: string; country: string; flag: string; stars: number; text: string };

type Labels = { eyebrow: string; title: string; honest: string; emptyTitle: string; emptyText: string; serve: string; cta: string };

/**
 * Misafir sözleri paneli — DÜRÜST: uydurma yorum yok. Gerçek yorum geldikçe
 * `reviews` dizisine eklenir; boşken "yalnızca gerçek misafirler" duruşunu
 * bir güven sinyaline çevirir (sahte yorumdan daha ikna edici, markaya uygun).
 */
export function GuestVoices({ labels, reviews = [] }: { labels: Labels; reviews?: Review[] }) {
  const has = reviews.length > 0;
  return (
    <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{labels.eyebrow}</p>
          <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{labels.title}</h2>
        </div>

        {/* Dürüstlük rozeti */}
        <div className="mt-7 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))", color: "rgb(var(--primary))" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            {labels.honest}
          </span>
        </div>

        {has ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((rv, i) => (
              <figure key={i} className="flex h-full flex-col rounded-[1.75rem] border p-6 shadow-lg" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
                <span className="text-sm" style={{ color: "rgb(251 191 80)" }}>{"★".repeat(rv.stars)}</span>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>“{rv.text}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full text-lg" style={{ backgroundColor: "rgb(var(--muted))" }}>{rv.flag}</span>
                  <span>
                    <span className="block font-semibold" style={{ color: "rgb(var(--foreground))" }}>{rv.name}</span>
                    <span className="block text-[12px]" style={{ color: "rgb(var(--muted-foreground))" }}>{rv.country}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-[2rem] border p-8 text-center shadow-xl sm:p-12" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--card))" }}>
            <span className="font-display block text-6xl leading-none" style={{ color: "rgb(var(--lagoon))" }}>“</span>
            <h3 className="font-display mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: "rgb(var(--foreground))" }}>{labels.emptyTitle}</h3>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{labels.emptyText}</p>
            <p className="mt-6 text-[13px] font-medium" style={{ color: "rgb(var(--muted-foreground))" }}>
              <span className="mr-2 text-base">🇰🇿 🇷🇺 🇺🇿 🇹🇷</span>{labels.serve}
            </p>
            <Link href="/contact" className="btn-accent mt-7 shadow-lg shadow-black/10">{labels.cta} <IconArrow /></Link>
          </div>
        )}
      </div>
    </section>
  );
}
