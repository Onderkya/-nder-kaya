"use client";

import { useRef, useState } from "react";

export type QA = { q: string; a: string };

/** Animasyonlu SSS akordeonu — yumuşak yükseklik geçişi + numara + ok dönmesi. */
export function FaqAccordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="border-b"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center gap-5 py-6 text-left"
            >
              <span className="serif-italic shrink-0 text-2xl leading-none" style={{ color: "rgb(var(--gold))" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display flex-1 text-lg font-semibold leading-snug sm:text-xl" style={{ color: "rgb(var(--foreground))" }}>
                {item.q}
              </span>
              <span
                className="shrink-0 transition-transform duration-300"
                style={{ transform: isOpen ? "rotate(45deg)" : "none", color: "rgb(var(--primary))" }}
                aria-hidden
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <Panel open={isOpen}>
              <p className="pb-7 pl-[2.9rem] pr-8 text-[15px] leading-relaxed" style={{ color: "rgb(var(--muted-foreground))" }}>
                {item.a}
              </p>
            </Panel>
          </div>
        );
      })}
    </div>
  );
}

function Panel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div ref={ref} style={{ overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}
