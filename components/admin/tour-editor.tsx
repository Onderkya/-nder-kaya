"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveTour } from "@/lib/tour-actions";
import { Icon } from "./icons";
import { IconPicker, IconButton } from "./icon-picker";
import type { TourCfg, TourStepCfg, L10n } from "@/lib/tours";

type LangOpt = { code: string; flag: string; name: string };
type MediaItem = { url: string; alt: string | null };
type IncludedCfg = { icon: string; label: L10n; active?: boolean };

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
 * gün/yıldız, otel/konum, aktif-pasif; gün-gün plan (adım satırları, kodlu+özel),
 * "Pakete dahil" listesi ve otel tanıtımı. Her adım/madde: ikon (FA seçici) +
 * dil bazlı başlık/açıklama + aktif/pasif + sürükle-sırala.
 */
export function TourEditor({
  initial,
  defaults,
  langs,
  media,
  isNew = false,
  prefillSteps = null,
  prefillIncluded = null,
}: {
  initial: TourCfg;
  defaults: TourDefaults | null;
  langs: LangOpt[];
  media: MediaItem[];
  isNew?: boolean;
  /** Kodlu tur için çevirilerden dolan öneri adımları (yalnız gösterim; kaydedilmez). */
  prefillSteps?: TourStepCfg[] | null;
  prefillIncluded?: IncludedCfg[] | null;
}) {
  const router = useRouter();
  // cfg ADIM/DAHİL için prefill'i İÇERMEZ — override sahipliğini olduğu gibi taşır.
  const [cfg, setCfg] = useState<TourCfg>(initial);
  const [lang, setLang] = useState(langs[0]?.code ?? "tr");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [imgPickerOpen, setImgPickerOpen] = useState(false);
  const isCustom = !!cfg.custom;

  // Yüklenen cfg zaten override taşıyor muydu? (case a — dokunulmasa bile kaydedilir)
  const hadStepsOverride = !!initial.steps?.length;
  const hadIncOverride = !!initial.included?.length;
  // Kullanıcı bu oturumda adım/dahil arayüzüne dokundu mu? (case b)
  const [stepsDirty, setStepsDirty] = useState(false);
  const [incDirty, setIncDirty] = useState(false);

  const setL10n = (field: "name" | "aud" | "hotelWhy" | "hotelNote", val: string) =>
    setCfg((p) => ({ ...p, [field]: { ...(p[field] ?? {}), [lang]: val } }));

  // ── Adım satırları (steps) ────────────────────────────────────────────────
  // Görünüm: sahip (override vardı) ya da dokunuldu → cfg.steps; aksi halde prefill.
  const ownsSteps = hadStepsOverride || stepsDirty;
  const steps = ownsSteps ? (cfg.steps ?? []) : (prefillSteps ?? []);
  // TÜM mutasyon yolları bu setter'dan geçer → dirty burada işaretlenir.
  // İlk mutasyonda henüz cfg.steps boşsa görünen prefill'i tabana alırız.
  const setSteps = (next: TourStepCfg[]) => {
    setStepsDirty(true);
    setCfg((p) => ({ ...p, steps: next }));
  };
  const updateStep = (i: number, patch: Partial<TourStepCfg>) =>
    setSteps(steps.map((s, x) => (x === i ? { ...s, ...patch } : s)));
  const addStep = () =>
    setSteps([...steps, { day: (steps[steps.length - 1]?.day ?? 1) + 1, icon: "landmark", active: true, t: {}, d: {} }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, x) => x !== i));
  const moveStep = (i: number, j: number) => {
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
  };

  // ── "Pakete dahil" satırları (included) ───────────────────────────────────
  const ownsInc = hadIncOverride || incDirty;
  const included = ownsInc ? (cfg.included ?? []) : (prefillIncluded ?? []);
  // TÜM mutasyon yolları bu setter'dan geçer → dirty burada işaretlenir.
  const setIncluded = (next: IncludedCfg[]) => {
    setIncDirty(true);
    setCfg((p) => ({ ...p, included: next }));
  };
  const updateInc = (i: number, patch: Partial<IncludedCfg>) =>
    setIncluded(included.map((s, x) => (x === i ? { ...s, ...patch } : s)));
  const addInc = () => setIncluded([...included, { icon: "check", active: true, label: {} }]);
  const removeInc = (i: number) => setIncluded(included.filter((_, x) => x !== i));
  const moveInc = (i: number, j: number) => {
    if (j < 0 || j >= included.length) return;
    const next = [...included];
    [next[i], next[j]] = [next[j], next[i]];
    setIncluded(next);
  };

  const save = () =>
    start(async () => {
      // Dokunulmayan VE önceden override'ı olmayan adım/dahil alanlarını payload'dan
      // çıkar — böylece prefill (çeviri anlık görüntüsü) override olarak yazılmaz.
      const payload: TourCfg = { ...cfg };
      if (!ownsSteps) delete payload.steps;
      if (!ownsInc) delete payload.included;
      await saveTour(JSON.stringify(payload));
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
            <button type="button" onClick={() => setImgPickerOpen(true)} className="adm-btn adm-btn-primary adm-btn-sm flex-1">Fotoğrafı değiştir</button>
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

      {/* Gün gün plan — adım satırları (kodlu + özel) */}
      <div className="adm-card adm-card-pad">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
          <h3 className="adm-section-title">Gün gün plan</h3>
        </div>
        {isCustom ? (
          <p className="adm-help mb-4 mt-0">Uçuş + transfer + otele giriş sitede otomatik başa eklenir; buraya duraklarını yaz. ({lang.toUpperCase()} düzenleniyor.)</p>
        ) : (
          <p className="adm-help mb-4 mt-0">
            Adımlar site çevirilerinden dolduruldu. <b>Bu adımları değiştirip kaydedersen metinler ŞU ANKİ halleriyle bu turda sabitlenir</b>; Site İçeriği çevirileri bu turda artık uygulanmaz. Değiştirmezsen çeviriler kaynak olmaya devam eder. ({lang.toUpperCase()} düzenleniyor.)
          </p>
        )}

        <div className="space-y-2">
          {steps.map((s, i) => (
            <EditableRow
              key={i}
              index={i}
              count={steps.length}
              icon={s.icon ?? "landmark"}
              title={s.t?.[lang] ?? ""}
              active={s.active !== false}
              summary={s.t?.[lang] || `Gün ${s.day} durağı`}
              onMove={(dir) => moveStep(i, i + dir)}
              onReorder={(from, to) => setSteps(reorder(steps, from, to))}
              onIcon={(name) => updateStep(i, { icon: name })}
              onActive={(v) => updateStep(i, { active: v })}
              onRemove={() => removeStep(i)}
            >
              <div className="grid gap-2 sm:grid-cols-[90px,1fr]">
                <div>
                  <label className="adm-label">Gün</label>
                  <input type="number" min={1} value={s.day} onChange={(e) => updateStep(i, { day: Math.max(1, Number(e.target.value) || 1) })} className="adm-input" />
                </div>
                <div className="space-y-2">
                  <input value={s.t?.[lang] ?? ""} onChange={(e) => updateStep(i, { t: { ...(s.t ?? {}), [lang]: e.target.value } })} placeholder="Durak başlığı (örn. Kekova tekne turu)" className="adm-input" />
                  <input value={s.d?.[lang] ?? ""} onChange={(e) => updateStep(i, { d: { ...(s.d ?? {}), [lang]: e.target.value } })} placeholder="Kısa açıklama" className="adm-input" />
                </div>
              </div>
            </EditableRow>
          ))}
        </div>
        <button type="button" onClick={addStep} className="adm-btn adm-btn-ghost mt-3"><Icon name="plus" size={16} /> Adım ekle</button>
      </div>

      {/* Pakete dahil */}
      <div className="adm-card adm-card-pad">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
          <h3 className="adm-section-title">Pakete dahil</h3>
        </div>
        <p className="adm-help mb-4 mt-0">Kartın “her şey dahil” satırları. ({lang.toUpperCase()} düzenleniyor.)</p>
        <div className="space-y-2">
          {included.map((inc, i) => (
            <EditableRow
              key={i}
              index={i}
              count={included.length}
              icon={inc.icon ?? "check"}
              title={inc.label?.[lang] ?? ""}
              active={inc.active !== false}
              summary={inc.label?.[lang] || "Dahil madde"}
              onMove={(dir) => moveInc(i, i + dir)}
              onReorder={(from, to) => setIncluded(reorder(included, from, to))}
              onIcon={(name) => updateInc(i, { icon: name })}
              onActive={(v) => updateInc(i, { active: v })}
              onRemove={() => removeInc(i)}
            >
              <div>
                <label className="adm-label">Metin ({lang.toUpperCase()})</label>
                <input value={inc.label?.[lang] ?? ""} onChange={(e) => updateInc(i, { label: { ...(inc.label ?? {}), [lang]: e.target.value } })} placeholder="Örn. Yurt içi uçuş" className="adm-input" />
              </div>
            </EditableRow>
          ))}
        </div>
        <button type="button" onClick={addInc} className="adm-btn adm-btn-ghost mt-3"><Icon name="plus" size={16} /> Madde ekle</button>
      </div>

      {/* Otel tanıtımı — yalnız özel turlarda düzenlenir (kodluda hotelsd'den gelir) */}
      {isCustom ? (
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
      ) : null}

      {imgPickerOpen ? <ImagePicker media={media} onClose={() => setImgPickerOpen(false)} onPick={(url) => { setCfg((p) => ({ ...p, img: url })); setImgPickerOpen(false); }} /> : null}
    </div>
  );
}

/** Bir diziyi drag-drop ile yeniden sıralar (from → to). */
function reorder<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * DÜZENLENEBİLİR SATIR — 3 yerde (adım/dahil) ortak kalıp. Kapalıyken: sürükle
 * tutamacı + ↑↓ + ikon butonu (seçici açar) + özet + aktif switch + sil. Aç/kapa
 * ile alanları (children) gösterir. Sürükle-bırak HTML5 (blok yeniden sıralama).
 */
function EditableRow({
  index,
  count,
  icon,
  title,
  active,
  summary,
  children,
  onMove,
  onReorder,
  onIcon,
  onActive,
  onRemove,
}: {
  index: number;
  count: number;
  icon: string;
  title: string;
  active: boolean;
  summary: string;
  children: React.ReactNode;
  onMove: (dir: -1 | 1) => void;
  onReorder: (from: number, to: number) => void;
  onIcon: (name: string) => void;
  onActive: (v: boolean) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className="rounded-xl border"
      style={{
        borderColor: dragOver ? "rgb(var(--primary))" : "rgb(var(--border))",
        opacity: active ? 1 : 0.55,
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const from = Number(e.dataTransfer.getData("text/plain"));
        if (!Number.isNaN(from)) onReorder(from, index);
      }}
    >
      <div className="flex items-center gap-2 p-2.5">
        {/* Sürükle tutamacı */}
        <span
          draggable
          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
          className="grid h-8 w-6 flex-shrink-0 cursor-grab place-items-center rounded"
          style={{ color: "rgb(var(--muted-foreground))" }}
          title="Sürükleyerek sırala"
          aria-label="Sürükle"
        >
          <Icon name="grip" size={16} />
        </span>
        {/* ↑↓ yedek */}
        <div className="flex flex-shrink-0 flex-col">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className="grid h-4 w-5 place-items-center disabled:opacity-30" style={{ color: "rgb(var(--muted-foreground))" }} aria-label="Yukarı">
            <Icon name="chevron" size={12} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} className="grid h-4 w-5 place-items-center disabled:opacity-30" style={{ color: "rgb(var(--muted-foreground))" }} aria-label="Aşağı">
            <Icon name="chevron" size={12} />
          </button>
        </div>
        {/* İkon */}
        <IconButton name={icon} onOpen={() => setPickerOpen(true)} />
        {/* Özet — tıklayınca aç/kapa */}
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[14px] font-medium" style={{ color: title ? "rgb(var(--foreground))" : "rgb(var(--muted-foreground))" }}>
            {summary}
          </span>
        </button>
        {/* Aktif switch */}
        <label className="adm-switch flex-shrink-0" title={active ? "Aktif" : "Pasif"}>
          <input type="checkbox" checked={active} onChange={(e) => onActive(e.target.checked)} />
          <span className="adm-switch-track" />
        </label>
        {/* Aç/kapa oku */}
        <button type="button" onClick={() => setOpen((o) => !o)} className="grid h-8 w-7 flex-shrink-0 place-items-center" style={{ color: "rgb(var(--muted-foreground))" }} aria-label={open ? "Kapat" : "Aç"}>
          <Icon name="chevron" size={16} style={{ transform: open ? "rotate(180deg)" : "none" }} />
        </button>
      </div>

      {open ? (
        <div className="space-y-3 border-t p-3" style={{ borderColor: "rgb(var(--border))" }}>
          {children}
          <button type="button" onClick={onRemove} className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
        </div>
      ) : null}

      {pickerOpen ? (
        <IconPicker
          value={icon}
          onPick={(name) => {
            onIcon(name);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
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
