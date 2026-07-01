"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTour } from "@/lib/tour-actions";
import { Icon } from "./icons";
import type { TourCfg, TourStepCfg } from "@/lib/tours";

type LangOpt = { code: string; flag: string; name: string };
type MediaItem = { url: string; alt: string | null };

/** Kodlu turun dil bazlı varsayılanları (placeholder olarak gösterilir). */
export type TourDefaults = {
  name: Record<string, string>;
  aud: Record<string, string>;
  days: number;
  stars: number;
  hotel: string;
  loc: string;
  img: string;
};

/**
 * TUR EDİTÖRÜ — bir turun HER ŞEYİ tek ekranda: foto, isim/rozet (dil sekmeli),
 * gün/yıldız, otel/konum, aktif-pasif; özel turlarda gün-gün plan + otel tanıtımı.
 * Kodlu turlarda boş bırakılan alan = varsayılan (placeholder'da görünür).
 */
export function TourEditor({
  initial,
  defaults,
  langs,
  media,
  isNew = false,
}: {
  initial: TourCfg;
  defaults: TourDefaults | null;
  langs: LangOpt[];
  media: MediaItem[];
  isNew?: boolean;
}) {
  const router = useRouter();
  const [cfg, setCfg] = useState<TourCfg>(initial);
  const [lang, setLang] = useState(langs[0]?.code ?? "tr");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const isCustom = !!cfg.custom;

  const setL10n = (field: "name" | "aud" | "hotelWhy" | "hotelNote", val: string) =>
    setCfg((p) => ({ ...p, [field]: { ...(p[field] ?? {}), [lang]: val } }));

  const setStep = (i: number, part: "day" | "t" | "d", val: string) =>
    setCfg((p) => {
      const steps = [...(p.steps ?? [])];
      const s = { ...steps[i] };
      if (part === "day") s.day = Math.max(1, Number(val) || 1);
      else s[part] = { ...(s[part] ?? {}), [lang]: val };
      steps[i] = s;
      return { ...p, steps };
    });

  const addStep = () =>
    setCfg((p) => ({ ...p, steps: [...(p.steps ?? []), { day: (p.steps?.length ?? 0) + 2, t: {}, d: {} } as TourStepCfg] }));
  const removeStep = (i: number) => setCfg((p) => ({ ...p, steps: (p.steps ?? []).filter((_, x) => x !== i) }));

  const save = () =>
    start(async () => {
      await saveTour(JSON.stringify(cfg));
      setSaved(true);
      router.refresh();
      if (isNew) router.push("/admin/tours");
    });

  const curImg = cfg.img?.trim() || defaults?.img || "/images/kaputas.jpg";

  return (
    <div className="space-y-4">
      {/* Üst: kaydet + dil */}
      <div className="sticky top-14 z-20 -mx-4 border-b px-4 py-2.5 sm:-mx-6 sm:px-6 lg:top-0" style={{ background: "rgb(var(--background) / 0.94)", backdropFilter: "blur(8px)", borderColor: "rgb(var(--border))" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {langs.map((l) => (
              <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`adm-btn adm-btn-sm ${l.code === lang ? "adm-btn-primary" : "adm-btn-ghost"}`}>
                {l.flag}<span className="hidden sm:inline"> {l.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {saved && !pending ? <span className="adm-badge adm-badge-success"><Icon name="check" size={13} /> Kaydedildi</span> : null}
            <button type="button" onClick={save} disabled={pending} className="adm-btn adm-btn-primary adm-btn-sm">{pending ? "Kaydediliyor…" : "Kaydet"}</button>
          </div>
        </div>
      </div>

      {/* Foto + temel bilgiler */}
      <div className="grid gap-4 lg:grid-cols-[380px,1fr]">
        <div className="adm-card overflow-hidden" style={{ padding: 0 }}>
          <div className="relative aspect-[4/3]" style={{ background: "rgb(var(--muted))" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={curImg} alt="" className="h-full w-full object-cover" />
            {cfg.img?.trim() && defaults ? <span className="adm-badge adm-badge-warn absolute right-2 top-2">değişti</span> : null}
          </div>
          <div className="flex items-center gap-2 p-3">
            <button type="button" onClick={() => setPickerOpen(true)} className="adm-btn adm-btn-primary adm-btn-sm flex-1">Fotoğrafı değiştir</button>
            {cfg.img?.trim() && defaults ? (
              <button type="button" onClick={() => setCfg((p) => ({ ...p, img: "" }))} className="adm-btn adm-btn-ghost adm-btn-sm">Sıfırla</button>
            ) : null}
          </div>
        </div>

        <div className="adm-card adm-card-pad space-y-4">
          <div>
            <label className="adm-label">Tur adı ({lang.toUpperCase()})</label>
            <input value={cfg.name?.[lang] ?? ""} onChange={(e) => setL10n("name", e.target.value)} placeholder={defaults?.name[lang] || "Örn. Kaş & Kekova Kaçamağı"} className="adm-input" />
            {defaults ? <p className="adm-help">Boş bırakırsan varsayılan kullanılır: “{defaults.name[lang]}”</p> : null}
          </div>
          <div>
            <label className="adm-label">Kitle rozeti ({lang.toUpperCase()})</label>
            <input value={cfg.aud?.[lang] ?? ""} onChange={(e) => setL10n("aud", e.target.value)} placeholder={defaults?.aud[lang] || "Örn. Balayı"} className="adm-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="adm-label">Gün</label>
              <input type="number" min={1} value={cfg.days ?? ""} onChange={(e) => setCfg((p) => ({ ...p, days: e.target.value ? Number(e.target.value) : undefined }))} placeholder={String(defaults?.days ?? 5)} className="adm-input" />
            </div>
            <div>
              <label className="adm-label">Yıldız</label>
              <input type="number" min={1} max={5} value={cfg.stars ?? ""} onChange={(e) => setCfg((p) => ({ ...p, stars: e.target.value ? Number(e.target.value) : undefined }))} placeholder={String(defaults?.stars ?? 5)} className="adm-input" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="adm-label">Otel adı</label>
              <input value={cfg.hotel ?? ""} onChange={(e) => setCfg((p) => ({ ...p, hotel: e.target.value }))} placeholder={defaults?.hotel || "Örn. Hotel X"} className="adm-input" />
            </div>
            <div>
              <label className="adm-label">Konum</label>
              <input value={cfg.loc ?? ""} onChange={(e) => setCfg((p) => ({ ...p, loc: e.target.value }))} placeholder={defaults?.loc || "Örn. Kaş, Antalya"} className="adm-input" />
              <p className="adm-help">Haritada otel bu ad + konumla aranır.</p>
            </div>
          </div>
          <label className="adm-switch">
            <input type="checkbox" checked={cfg.active !== false} onChange={(e) => setCfg((p) => ({ ...p, active: e.target.checked }))} />
            <span className="adm-switch-track" />
            <span className="adm-switch-label">{cfg.active !== false ? "Aktif — sitede görünür" : "Pasif — sitede gizli"}</span>
          </label>
        </div>
      </div>

      {/* Özel turlarda plan + otel tanıtımı */}
      {isCustom ? (
        <>
          <div className="adm-card adm-card-pad">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
              <h3 className="adm-section-title">Gün gün plan</h3>
            </div>
            <p className="adm-help mb-4 mt-0">Uçuş + transfer + otele giriş otomatik eklenir; buraya 2. günden itibaren durakları yaz. ({lang.toUpperCase()} dilini düzenliyorsun.)</p>
            <div className="space-y-3">
              {(cfg.steps ?? []).map((s, i) => (
                <div key={i} className="grid gap-2 rounded-xl border p-3 sm:grid-cols-[90px,1fr,auto]" style={{ borderColor: "rgb(var(--border))" }}>
                  <div>
                    <label className="adm-label">Gün</label>
                    <input type="number" min={1} value={s.day} onChange={(e) => setStep(i, "day", e.target.value)} className="adm-input" />
                  </div>
                  <div className="space-y-2">
                    <input value={s.t?.[lang] ?? ""} onChange={(e) => setStep(i, "t", e.target.value)} placeholder="Durak başlığı (örn. Kekova tekne turu)" className="adm-input" />
                    <input value={s.d?.[lang] ?? ""} onChange={(e) => setStep(i, "d", e.target.value)} placeholder="Kısa açıklama" className="adm-input" />
                  </div>
                  <div className="flex items-end">
                    <button type="button" onClick={() => removeStep(i)} className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addStep} className="adm-btn adm-btn-ghost mt-3"><Icon name="plus" size={16} /> Durak ekle</button>
          </div>

          <div className="adm-card adm-card-pad space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
              <h3 className="adm-section-title">Otel tanıtımı (detay penceresi)</h3>
            </div>
            <div>
              <label className="adm-label">Neden bu otel ({lang.toUpperCase()})</label>
              <textarea value={cfg.hotelWhy?.[lang] ?? ""} onChange={(e) => setL10n("hotelWhy", e.target.value)} className="adm-textarea" placeholder="Bu oteli neden öneriyoruz…" />
            </div>
            <div>
              <label className="adm-label">Dürüst not ({lang.toUpperCase()})</label>
              <textarea value={cfg.hotelNote?.[lang] ?? ""} onChange={(e) => setL10n("hotelNote", e.target.value)} className="adm-textarea" placeholder="Bilinmesi gereken küçük not (opsiyonel)…" />
            </div>
          </div>
        </>
      ) : (
        <p className="adm-help">Bu kodlu bir tur: gün-gün plan metinleri <b>Ana Sayfa &amp; Bölümler → Antalya Danışmanlık</b> sekmesindeki rota bölümlerinden düzenlenir.</p>
      )}

      {pickerOpen ? <ImagePicker media={media} onClose={() => setPickerOpen(false)} onPick={(url) => { setCfg((p) => ({ ...p, img: url })); setPickerOpen(false); }} /> : null}
    </div>
  );
}

function ImagePicker({ media, onClose, onPick }: { media: MediaItem[]; onClose: () => void; onPick: (url: string) => void }) {
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
      fd.append("alt", "Tur fotoğrafı");
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button type="button" aria-label="Kapat" onClick={onClose} className="absolute inset-0" style={{ background: "rgb(7 26 33 / 0.55)" }} />
      <div className="adm-card relative z-10 max-h-[86vh] w-full overflow-y-auto p-5 sm:max-w-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>Tur fotoğrafı seç</h4>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-sm">✕</button>
        </div>
        <label className="adm-empty mb-4 block cursor-pointer" style={{ padding: "20px" }}>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}><Icon name="upload" size={20} /></span>
          <span className="block font-semibold text-[13.5px]" style={{ color: "rgb(var(--foreground))" }}>{uploading ? "Yükleniyor…" : "Dosya seç / yükle"}</span>
        </label>
        {err ? <p className="adm-badge adm-badge-danger mb-3">{err}</p> : null}
        <div className="mb-4 flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="veya URL yapıştır" className="adm-input" />
          <button type="button" disabled={!url.trim()} onClick={() => onPick(url.trim())} className="adm-btn adm-btn-primary">Kullan</button>
        </div>
        {media.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {media.map((m) => (
              <button key={m.url} type="button" onClick={() => onPick(m.url)} className="adm-thumb block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.alt || ""} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
