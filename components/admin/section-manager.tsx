"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveSection, setSectionVisible } from "@/lib/section-actions";

type PageMeta = { key: string; label: string };
type SectionItem = { id: string; label: string };

/**
 * Bölüm yöneticisi. Üstte 7 sayfa seçici (pill), altında seçili sayfanın
 * bölümleri SIRALI liste: her satır label + ↑ ↓ + göster/gizle anahtarı.
 * ↑↓ `moveSection`, anahtar `setSectionVisible` server action'ını çağırır
 * (useTransition + iyimser yerel güncelleme). Kayıt yoksa varsayılan geçerli;
 * site asla bozulmaz.
 */
export function SectionManager({
  pages,
  sectionsByPage,
  hidden,
  orders: _orders,
}: {
  pages: PageMeta[];
  sectionsByPage: Record<string, SectionItem[]>;
  hidden: string[];
  orders: Record<string, string[]>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState<string>(pages[0]?.key ?? "");

  // İyimser yerel durum: sıralama sayfa->id[] ve gizli id kümesi.
  const [order, setOrder] = useState<Record<string, string[]>>(() => {
    const o: Record<string, string[]> = {};
    for (const p of pages) o[p.key] = (sectionsByPage[p.key] ?? []).map((s) => s.id);
    return o;
  });
  const [hiddenSet, setHiddenSet] = useState<Set<string>>(() => new Set(hidden));

  const labelOf = (page: string, id: string) =>
    (sectionsByPage[page] ?? []).find((s) => s.id === id)?.label ?? id;

  const move = (page: string, id: string, dir: "up" | "down") => {
    // İyimser: yerel sırada komşu ile yer değiştir.
    setOrder((prev) => {
      const list = [...(prev[page] ?? [])];
      const idx = list.indexOf(id);
      if (idx < 0) return prev;
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= list.length) return prev;
      [list[idx], list[swap]] = [list[swap], list[idx]];
      return { ...prev, [page]: list };
    });
    start(async () => {
      await moveSection(page, id, dir);
      router.refresh();
    });
  };

  const toggle = (id: string, visible: boolean) => {
    // İyimser: gizli kümesini anında güncelle.
    setHiddenSet((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(id);
      else next.add(id);
      return next;
    });
    start(async () => {
      await setSectionVisible(id, visible);
      router.refresh();
    });
  };

  const activeIds = order[active] ?? [];

  return (
    <div className="adm-card adm-card-pad">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--primary))" }} />
        <h3 className="adm-section-title">Bölümler — sıra & göster / gizle</h3>
      </div>
      <p className="adm-help mb-4 mt-0">
        Bir sayfa seç; o sayfanın bölümlerini sırala ve sitede aç/kapat. Değişiklik anında yayınlanır.
      </p>

      {/* Sayfa seçici pill'ler */}
      <div className="mb-4 flex flex-wrap gap-2">
        {pages.map((p) => {
          const on = p.key === active;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setActive(p.key)}
              className="rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
              style={{
                borderColor: on ? "rgb(var(--primary) / 0.35)" : "rgb(var(--border))",
                background: on ? "rgb(var(--primary) / 0.1)" : "transparent",
                color: on ? "rgb(var(--primary))" : "rgb(var(--muted-foreground))",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <p className="adm-help mb-3 mt-0" style={{ fontSize: 12.5 }}>
        Sıralamak için okları kullan.
      </p>

      {/* Seçili sayfanın bölümleri */}
      <div className="space-y-2">
        {activeIds.length === 0 ? (
          <p className="adm-help mt-0">Bu sayfada sıralanabilir bölüm yok.</p>
        ) : (
          activeIds.map((id, i) => {
            const vis = !hiddenSet.has(id);
            const first = i === 0;
            const last = i === activeIds.length - 1;
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      aria-label="Yukarı taşı"
                      disabled={first || pending}
                      onClick={() => move(active, id, "up")}
                      className="flex h-5 w-6 items-center justify-center rounded-md border text-[11px] leading-none transition-colors disabled:opacity-30"
                      style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      aria-label="Aşağı taşı"
                      disabled={last || pending}
                      onClick={() => move(active, id, "down")}
                      className="flex h-5 w-6 items-center justify-center rounded-md border text-[11px] leading-none transition-colors disabled:opacity-30"
                      style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
                    >
                      ▼
                    </button>
                  </div>
                  <span
                    className="truncate text-[14px] font-medium"
                    style={{ color: "rgb(var(--foreground))" }}
                  >
                    {labelOf(active, id)}
                  </span>
                </div>
                <label className="adm-switch" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={vis}
                    disabled={pending}
                    onChange={(e) => toggle(id, e.target.checked)}
                  />
                  <span className="adm-switch-track" />
                  <span
                    className="adm-switch-label"
                    style={{
                      color: vis ? "rgb(var(--primary))" : "rgb(var(--muted-foreground))",
                      minWidth: 42,
                    }}
                  >
                    {vis ? "Açık" : "Kapalı"}
                  </span>
                </label>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
