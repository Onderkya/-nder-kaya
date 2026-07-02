import { Reveal } from "./reveal";

export type LevelStep = {
  code: string;
  text: string;
  /** Öğretmenin bugünkü seviyesi — altın rozetle vurgulanır. */
  now?: boolean;
};

/**
 * 0'dan C2'ye seviye yolu — öğretmenin bizzat yürüdüğü çizgi.
 * Mobilde dikey zaman çizgisi, sm+ ekranda 2/3 sütunlu grid.
 * Kanıt anlatısı: her seviyede "neyi konuşabilir hale gelirsin" + C2'de
 * öğretmen rozeti. Animasyon Reveal ile (prefers-reduced-motion'da nötrlenir).
 */
export function LevelPath({
  eyebrow,
  title,
  note,
  daily,
  nowLabel,
  levels,
}: {
  eyebrow: string;
  title: string;
  note: string;
  daily: string;
  nowLabel: string;
  levels: LevelStep[];
}) {
  return (
    <section className="py-24 sm:py-28" style={{ backgroundColor: "rgb(var(--muted) / 0.5)" }}>
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center" style={{ color: "rgb(var(--accent))" }}>{eyebrow}</p>
          <h2 className="h-section mt-5 text-balance" style={{ color: "rgb(var(--foreground))" }}>{title}</h2>
          <p className="mt-5 text-lg leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>{note}</p>
        </Reveal>

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {levels.map((lv, i) => (
            <Reveal as="li" key={lv.code} delay={i * 80} className="h-full">
              <div
                className="card-lift relative flex h-full items-start gap-4 rounded-3xl border p-5"
                style={{
                  borderColor: lv.now ? "rgb(var(--gold) / 0.6)" : "rgb(var(--border))",
                  backgroundColor: "rgb(var(--card))",
                  ...(lv.now ? { boxShadow: "0 18px 40px -20px rgb(var(--gold) / 0.5)" } : {}),
                }}
              >
                <span className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-lg font-semibold text-white" style={{ backgroundImage: "linear-gradient(135deg, rgb(var(--lagoon)), rgb(var(--primary)))" }}>
                  {lv.code}
                </span>
                <div>
                  {lv.now ? (
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: "rgb(var(--gold) / 0.15)", color: "rgb(var(--gold))" }}>
                      ★ {nowLabel}
                    </span>
                  ) : null}
                  <p className="text-[14.5px] font-medium leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>{lv.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={120} className="mt-9">
          <p className="mx-auto flex max-w-xl items-center justify-center gap-2.5 rounded-full border px-5 py-3 text-center text-[13.5px] font-semibold" style={{ borderColor: "rgb(var(--primary) / 0.35)", backgroundColor: "rgb(var(--primary) / 0.07)", color: "rgb(var(--primary))" }}>
            <span aria-hidden>🐾</span>{daily}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
