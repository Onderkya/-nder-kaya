"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; url: string; alt: string | null; inUse: number };

export function MediaGrid({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) router.refresh();
      else setError(data.error || "Silinemedi.");
    } catch {
      setError("Ağ hatası.");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return <p className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">Henüz görsel yok.</p>;
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <div key={m.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt ?? ""} className="h-36 w-full bg-slate-50 object-contain" />
            <div className="space-y-2 p-3">
              <p className="truncate text-xs text-slate-500" title={m.alt ?? ""}>{m.alt || "—"}</p>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => navigator.clipboard?.writeText(m.url)}
                  className="rounded-lg border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                >
                  URL kopyala
                </button>
                <button
                  onClick={() => remove(m.id)}
                  disabled={busy === m.id || m.inUse > 0}
                  title={m.inUse > 0 ? "İçerikte kullanılıyor" : "Sil"}
                  className="text-xs text-red-600 hover:underline disabled:opacity-40"
                >
                  {busy === m.id ? "…" : m.inUse > 0 ? "Kullanımda" : "Sil"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
