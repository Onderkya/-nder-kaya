"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAsset } from "@/lib/asset-actions";
import { Icon } from "./icons";
import type { AssetSlot } from "@/lib/asset-slots";

type MediaItem = { id?: string; url: string; alt: string | null };

/**
 * Sayfa içi görsel/video yöneticisi. Her slot için önizleme + "Değiştir"
 * (yükle / kütüphaneden seç / URL) + "Sıfırla". Kütüphaneden görsel silinebilir.
 * Değişiklik anında kaydedilir (setAsset → ISR tazelenir).
 */
export function AssetManager({ slots, overrides, media }: { slots: AssetSlot[]; overrides: Record<string, string>; media: MediaItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<AssetSlot | null>(null);

  const apply = (slotId: string, url: string) =>
    start(async () => {
      await setAsset(slotId, url);
      setOpen(null);
      router.refresh();
    });

  if (slots.length === 0) return null;

  return (
    <div className="adm-card adm-card-pad">
      <div className="mb-4 flex items-center gap-2">
        <span className="adm-gold-rule" />
        <h3 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>Görseller & Videolar</h3>
      </div>
      <p className="adm-help mb-4 mt-0">Bu sayfada kullanılan görseller/videolar. “Değiştir” ile yenisini yükle veya kütüphaneden seç; “Sıfırla” ile eskisine dön. Değiştirmezsen varsayılan kalır.</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((s) => {
          const cur = overrides[s.id]?.trim() || s.def;
          const changed = !!overrides[s.id]?.trim();
          return (
            <div key={s.id} className="overflow-hidden rounded-xl border" style={{ borderColor: "rgb(var(--border))" }}>
              <div className="relative aspect-video" style={{ background: "rgb(var(--muted))" }}>
                {s.type === "video" ? (
                  <video src={cur} muted loop playsInline className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cur} alt={s.label} className="h-full w-full object-cover" />
                )}
                <span className="absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: "rgb(7 26 33 / 0.7)", color: "#fff" }}>
                  {s.type === "video" ? "video" : "görsel"}
                </span>
                {changed ? <span className="adm-badge adm-badge-warn absolute right-2 top-2">değişti</span> : null}
              </div>
              <div className="p-3">
                <p className="text-[13px] font-semibold leading-snug" style={{ color: "rgb(var(--foreground))" }}>{s.label}</p>
                <p className="adm-muted mt-0.5 truncate text-[11.5px]" title={cur}>{cur}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <button type="button" onClick={() => setOpen(s)} className="adm-btn adm-btn-primary adm-btn-sm">Değiştir</button>
                  {changed ? (
                    <button type="button" disabled={pending} onClick={() => apply(s.id, "")} className="adm-btn adm-btn-ghost adm-btn-sm">Sıfırla</button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {open ? <PickerModal slot={open} media={media} pending={pending} onClose={() => setOpen(null)} onPick={(url) => apply(open.id, url)} /> : null}
    </div>
  );
}

function PickerModal({ slot, media, pending, onClose, onPick }: { slot: AssetSlot; media: MediaItem[]; pending: boolean; onClose: () => void; onPick: (url: string) => void }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", slot.label);
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data?.media?.url) throw new Error(data?.error || "Yükleme başarısız");
      onPick(data.media.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = async (id: string) => {
    setErr("");
    try {
      const res = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Silinemedi");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Silinemedi");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Kapat" onClick={onClose} className="absolute inset-0" style={{ background: "rgb(7 26 33 / 0.55)" }} />
      <div className="adm-card relative z-10 max-h-[86vh] w-full overflow-y-auto p-5 sm:max-w-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h4 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>Değiştir: {slot.label}</h4>
            <p className="adm-muted text-[12.5px]">Yeni {slot.type === "video" ? "video" : "görsel"} yükle, kütüphaneden seç ya da URL yapıştır.</p>
          </div>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-sm">✕</button>
        </div>

        {/* Yükle */}
        <label className="adm-empty mb-4 block cursor-pointer" style={{ padding: "20px" }}>
          <input ref={fileRef} type="file" accept={slot.type === "video" ? "video/*" : "image/*"} className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}><Icon name="upload" size={20} /></span>
          <span className="block font-semibold text-[13.5px]" style={{ color: "rgb(var(--foreground))" }}>{uploading ? "Yükleniyor…" : "Dosya seç / buraya yükle"}</span>
          <span className="adm-muted block text-[12px]">{slot.type === "video" ? "MP4/WEBM" : "PNG, JPG, WEBP"}</span>
        </label>
        {err ? <p className="adm-badge adm-badge-danger mb-3">{err}</p> : null}

        {/* URL yapıştır */}
        <div className="mb-4 flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="veya URL yapıştır (/media/… /images/…)" className="adm-input" />
          <button type="button" disabled={!url.trim() || pending} onClick={() => onPick(url.trim())} className="adm-btn adm-btn-primary">Kaydet</button>
        </div>

        {/* Kütüphane */}
        {media.length > 0 ? (
          <>
            <p className="adm-label">Yüklenen görseller — seç ya da sil</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {media.map((m) => (
                <div key={m.url} className="group relative overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--border))" }}>
                  <button type="button" onClick={() => onPick(m.url)} className="block w-full transition hover:opacity-80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt || ""} className="aspect-square w-full object-cover" />
                  </button>
                  {m.id ? (
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id!)}
                      title="Görseli sil"
                      className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full text-white opacity-0 transition group-hover:opacity-100"
                      style={{ background: "rgb(var(--accent))" }}
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
