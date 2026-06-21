"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-3">
      <div className="sm:col-span-1">
        <label className="mb-1 block text-xs font-medium text-slate-500">Görsel (PNG, JPG, WEBP, GIF · ≤5MB)</label>
        <input ref={fileRef} name="file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" required className={`${field} w-full`} />
      </div>
      <div className="sm:col-span-1">
        <label className="mb-1 block text-xs font-medium text-slate-500">Alt metni (erişilebilirlik/SEO)</label>
        <input name="alt" placeholder="Görsel açıklaması" className={`${field} w-full`} />
      </div>
      <div className="flex items-end">
        <button disabled={busy} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Yükleniyor…" : "Yükle"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 sm:col-span-3">{error}</p>}
    </form>
  );
}
