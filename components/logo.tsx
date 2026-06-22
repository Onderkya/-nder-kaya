/**
 * Antalya Bridge marka işareti: güneş kemeri + köprü/dalga.
 * currentColor kullanır; açık/koyu temada otomatik uyumlu.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="ab-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="ab-sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
      </defs>
      {/* Güneş */}
      <circle cx="24" cy="19" r="8" fill="url(#ab-sun)" />
      {/* Köprü kemeri */}
      <path d="M6 30c6-9 30-9 36 0" stroke="url(#ab-sea)" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Dalgalar */}
      <path d="M5 37c3-2.5 5.5-2.5 8.5 0s5.5 2.5 8.5 0 5.5-2.5 8.5 0 5.5 2.5 8.5 0" stroke="url(#ab-sea)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M8 43c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 7 0 4.5 2 7 0" stroke="url(#ab-sea)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
    </svg>
  );
}

export function Logo({
  withText = true,
  on = "surface",
}: {
  withText?: boolean;
  on?: "hero" | "surface";
}) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className="h-9 w-9" />
      {withText && (
        <span
          className="font-display text-[1.55rem] font-semibold leading-none tracking-[-0.01em]"
          style={on === "hero" ? { color: "#fff" } : { color: "rgb(var(--foreground))" }}
        >
          Antalya<span style={{ color: "rgb(var(--accent))" }}> Bridge</span>
        </span>
      )}
    </span>
  );
}
