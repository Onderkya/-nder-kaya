"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Field } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

export function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file || busy) return;
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        e.currentTarget.reset();
        setFileName(null);
        router.refresh();
      } else {
        setError(data.error || "Yükleme başarısız.");
      }
    } catch {
      setError("Ağ hatası.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        {/* Sürükle-bırak görünümlü büyük seçim alanı */}
        <label
          htmlFor="media-file"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition hover:opacity-90"
          style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--muted) / 0.4)" }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}>
            <Icon name="upload" size={22} />
          </span>
          <span className="font-semibold text-[14.5px]" style={{ color: "rgb(var(--foreground))" }}>
            Görseli buraya seç — PNG, JPG, WEBP (en fazla 5MB)
          </span>
          {fileName ? (
            <span className="adm-badge adm-badge-success mt-1">{fileName}</span>
          ) : (
            <span className="adm-muted text-[13px]">Tıklayın ve bilgisayarınızdan bir görsel seçin</span>
          )}
          <input
            id="media-file"
            ref={fileRef}
            name="file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            required
            className="sr-only"
            onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
          />
        </label>

        <Field
          label="Görsel açıklaması — ne olduğunu yaz, ör. 'Konyaaltı sahili'"
          htmlFor="media-alt"
          help="Bu açıklama görme engelli ziyaretçiler ve arama motorları (SEO) için kullanılır. Kısa ve net yazın."
        >
          <input id="media-alt" name="alt" placeholder="ör. Konyaaltı sahili" className="adm-input" />
        </Field>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={busy} className="adm-btn adm-btn-primary">
            <Icon name="upload" size={16} />
            {busy ? "Yükleniyor…" : "Yükle"}
          </button>
          {error ? <p className="adm-help" style={{ color: "rgb(var(--accent))" }}>{error}</p> : null}
        </div>
      </form>
    </Card>
  );
}
