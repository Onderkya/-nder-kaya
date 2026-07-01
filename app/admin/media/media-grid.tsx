"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, Badge, EmptyState } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

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
    return (
      <EmptyState
        icon="image"
        title="Henüz görsel yok"
        description="Yukarıdaki alandan ilk görselinizi yükleyin. Yüklediğiniz görseller burada listelenir ve sayfaları düzenlerken seçilebilir hâle gelir."
      />
    );
  }

  return (
    <div>
      {error ? <p className="adm-help mb-3" style={{ color: "rgb(var(--accent))" }}>{error}</p> : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <Card key={m.id} pad={false} className="overflow-hidden">
            <div className="relative aspect-square w-full" style={{ background: "rgb(var(--muted) / 0.5)" }}>
              <Image
                src={m.url}
                alt={m.alt ?? ""}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain"
              />
            </div>
            <div className="space-y-2.5 p-3">
              <p className="truncate text-[13px] font-medium" style={{ color: "rgb(var(--foreground))" }} title={m.alt ?? ""}>
                {m.alt || "Açıklama yok"}
              </p>
              <Badge tone={m.inUse > 0 ? "warn" : "neutral"}>{m.inUse > 0 ? "Kullanımda" : "Boşta"}</Badge>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => navigator.clipboard?.writeText(m.url)}
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                >
                  <Icon name="content" size={14} />
                  URL kopyala
                </button>
                <button
                  onClick={() => remove(m.id)}
                  disabled={busy === m.id || m.inUse > 0}
                  title={m.inUse > 0 ? "İçerikte kullanılıyor" : "Sil"}
                  className="adm-btn adm-btn-danger adm-btn-sm"
                >
                  {busy === m.id ? "…" : m.inUse > 0 ? "Kullanımda" : "Sil"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
