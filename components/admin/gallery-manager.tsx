"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveGallery } from "@/lib/gallery-actions";
import { Icon } from "./icons";
import type { GalleryItemCfg } from "@/lib/gallery";

type LangOpt = { code: string; flag: string; name: string };
type MediaItem = { id?: string; url: string; alt: string | null };

/**
 * SİTE EDİTÖRÜ GALERİ YÖNETİCİSİ — bir galeri bölümünün (GALLERY_DEFAULTS
 * anahtarı) medya + başlık listesini yönetir: satır kalıbı (önizleme + tip
 * rozeti + sürükle/↑↓ + aktif switch + Değiştir + Sil), dil sekmeli başlık/
 * açıklama, "Medya ekle" ve "Galeriyi kaydet". Kayıt bölümün metin formundan
 * (#ce-form) BAĞIMSIZ'dır: burada her buton type="button", saveGallery doğrudan
 * useTransition ile çağrılır; bileşen #ce-form'un DIŞINDA (kartın alt kısmında)
 * render edilir ve içinde <form> yoktur.
 *
 * DIRTY-TRACKING (Faz 4 dersi): prefill satırları yalnız GÖSTERİM içindir;
 * saveGallery ancak (a) kayıtlı override zaten varsa ya da (b) kullanıcı bu
 * oturumda listeyi değiştirdiyse anlamlıdır. Tüm mutasyon yolları `setItems`
 * üzerinden geçer → dirty burada işaretlenir. "Varsayılana dön" (override
 * varken) saveGallery(sectionId, []) çağırır → kayıt silinir.
 */
export function GalleryManager({
  sectionId,
  initialItems,
  hasOverride,
  langs,
  media,
}: {
  sectionId: string;
  /** Prefill: kayıtlı override varsa birebir, yoksa varsayılanlar 4 dilde L10n'e çevrilmiş. */
  initialItems: GalleryItemCfg[];
  /** Kayıtlı override zaten var mıydı? (case a — dokunulmasa bile kaydedilebilir/dönülebilir) */
  hasOverride: boolean;
  langs: LangOpt[];
  media: MediaItem[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState(langs[0]?.code ?? "tr");
  const [picker, setPicker] = useState<{ index: number; field: "src" | "poster" } | null>(null);

  const [items, setItemsRaw] = useState<GalleryItemCfg[]>(initialItems);
  // Kullanıcı bu oturumda listeye dokundu mu? (case b)
  const [dirty, setDirty] = useState(false);
  // TÜM mutasyon yolları bu setter'dan geçer → dirty burada işaretlenir.
  const setItems = (next: GalleryItemCfg[]) => {
    setDirty(true);
    setSaved(false);
    setItemsRaw(next);
  };

  const canSave = hasOverride || dirty;

  const update = (i: number, patch: Partial<GalleryItemCfg>) =>
    setItems(items.map((it, x) => (x === i ? { ...it, ...patch } : it)));
  const setL10n = (i: number, field: "title" | "desc", val: string) =>
    update(i, { [field]: { ...(items[i][field] ?? {}), [lang]: val } });
  const addItem = () =>
    setItems([...items, { src: "", type: "image", active: true, title: {}, desc: {} }]);
  const removeItem = (i: number) => setItems(items.filter((_, x) => x !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };
  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
  };

  const save = () =>
    start(async () => {
      await saveGallery(sectionId, items);
      setSaved(true);
      setDirty(false);
      router.refresh();
    });

  const resetToDefault = () =>
    start(async () => {
      await saveGallery(sectionId, []);
      setSaved(true);
      setDirty(false);
      router.refresh();
    });

  return (
    <div className="rounded-xl border p-3 sm:p-4" style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--muted) / 0.35)" }}>
      {/* Dil sekmeleri (başlık/açıklama alanları için) */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="adm-muted mr-1 text-[12px] font-semibold">Başlık dili:</span>
        {langs.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`adm-btn adm-btn-sm ${l.code === lang ? "adm-btn-primary" : "adm-btn-ghost"}`}
          >
            {l.flag}<span className="hidden sm:inline"> {l.name}</span>
          </button>
        ))}
      </div>

      {/* Sabitleme uyarısı (tur editörü notunun aynısı) */}
      <p className="adm-help mb-3 mt-0">
        Bu listeyi kaydedersen başlıklar <b>şu anki halleriyle sabitlenir</b>; Site İçeriği çevirileri bu
        galeride devre dışı kalır. Kaydetmezsen çeviriler kaynak olmaya devam eder.
      </p>

      {/* Satırlar */}
      <div className="space-y-2">
        {items.map((it, i) => (
          <GalleryRow
            key={i}
            index={i}
            count={items.length}
            item={it}
            lang={lang}
            onMove={(dir) => move(i, dir)}
            onReorder={reorder}
            onActive={(v) => update(i, { active: v })}
            onType={(t) => update(i, { type: t })}
            onTitle={(v) => setL10n(i, "title", v)}
            onDesc={(v) => setL10n(i, "desc", v)}
            onOpenPicker={(field) => setPicker({ index: i, field })}
            onRemove={() => removeItem(i)}
          />
        ))}
        {items.length === 0 ? (
          <p className="adm-muted text-[13px]">Bu galeride öğe yok. “Medya ekle” ile başla.</p>
        ) : null}
      </div>

      <button type="button" onClick={addItem} className="adm-btn adm-btn-ghost mt-3">
        <Icon name="plus" size={16} /> Medya ekle
      </button>

      {/* Kaydet satırı */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "rgb(var(--border))" }}>
        <button
          type="button"
          onClick={save}
          disabled={pending || !canSave}
          className="adm-btn adm-btn-primary adm-btn-sm"
          title={!canSave ? "Değişiklik yok — kaydedilecek bir şey yok." : undefined}
        >
          {pending ? "Kaydediliyor…" : "Galeriyi kaydet"}
        </button>
        {hasOverride ? (
          <button type="button" onClick={resetToDefault} disabled={pending} className="adm-btn adm-btn-ghost adm-btn-sm">
            Varsayılana dön
          </button>
        ) : null}
        {saved && !pending ? (
          <span className="adm-badge adm-badge-success"><Icon name="check" size={13} /> Kaydedildi</span>
        ) : null}
        {!canSave ? (
          <span className="adm-muted text-[12px]">Bu galeri varsayılan listeyi kullanıyor.</span>
        ) : null}
      </div>
      {hasOverride ? (
        <p className="adm-help mt-2 mb-0">
          “Varsayılana dön” bu galeri kaydını siler; galeri koddaki varsayılan listeye döner. (Bu bölümün
          tekil görsel slotlarında bir değişiklik varsa o değişiklik yeniden görünür olur.)
        </p>
      ) : null}

      {picker ? (
        <GalleryPicker
          field={picker.field}
          type={items[picker.index]?.type ?? "image"}
          media={media}
          pending={pending}
          onClose={() => setPicker(null)}
          onPick={(url) => {
            update(picker.index, { [picker.field]: url });
            setPicker(null);
          }}
        />
      ) : null}
    </div>
  );
}

/**
 * TEK GALERİ SATIRI. Kapalıyken: sürükle tutamacı + ↑↓ + önizleme + tip rozeti +
 * özet + aktif switch + aç/kapa. Açıkken: tip seçimi + Değiştir (+ video ise
 * poster) + dil bazlı Başlık/Açıklama + Sil.
 */
function GalleryRow({
  index,
  count,
  item,
  lang,
  onMove,
  onReorder,
  onActive,
  onType,
  onTitle,
  onDesc,
  onOpenPicker,
  onRemove,
}: {
  index: number;
  count: number;
  item: GalleryItemCfg;
  lang: string;
  onMove: (dir: -1 | 1) => void;
  onReorder: (from: number, to: number) => void;
  onActive: (v: boolean) => void;
  onType: (t: "image" | "video") => void;
  onTitle: (v: string) => void;
  onDesc: (v: string) => void;
  onOpenPicker: (field: "src" | "poster") => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const active = item.active !== false;
  const isVideo = item.type === "video";
  const thumb = item.poster?.trim() || item.src?.trim() || "";
  const title = item.title?.[lang] ?? "";
  const summary = title || (item.src ? item.src.split("/").pop() || item.src : "Yeni öğe");

  return (
    <div
      className="rounded-xl border"
      style={{ borderColor: dragOver ? "rgb(var(--primary))" : "rgb(var(--border))", opacity: active ? 1 : 0.55 }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
        {/* Önizleme + tip rozeti */}
        <span className="relative block h-11 w-16 flex-shrink-0 overflow-hidden rounded-md" style={{ background: "rgb(var(--muted))" }}>
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          ) : null}
          <span className="absolute left-0.5 top-0.5 rounded px-1 py-px text-[8px] font-bold uppercase" style={{ background: "rgb(7 26 33 / 0.72)", color: "#fff" }}>
            {isVideo ? "video" : "görsel"}
          </span>
        </span>
        {/* Özet — tıklayınca aç/kapa */}
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[14px] font-medium" style={{ color: title ? "rgb(var(--foreground))" : "rgb(var(--muted-foreground))" }}>
            {summary}
          </span>
        </button>
        {/* Aktif switch */}
        <label className="adm-switch flex-shrink-0" title={active ? "Aktif — sitede görünür" : "Pasif — sitede gizli"}>
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
          {/* Tip + Değiştir + poster */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "rgb(var(--border))" }}>
              <button type="button" onClick={() => onType("image")} className={`adm-btn adm-btn-sm ${!isVideo ? "adm-btn-primary" : "adm-btn-ghost"}`}>Görsel</button>
              <button type="button" onClick={() => onType("video")} className={`adm-btn adm-btn-sm ${isVideo ? "adm-btn-primary" : "adm-btn-ghost"}`}>Video</button>
            </div>
            <button type="button" onClick={() => onOpenPicker("src")} className="adm-btn adm-btn-primary adm-btn-sm">
              {isVideo ? "Videoyu değiştir" : "Görseli değiştir"}
            </button>
            {isVideo ? (
              <button type="button" onClick={() => onOpenPicker("poster")} className="adm-btn adm-btn-ghost adm-btn-sm">Poster seç</button>
            ) : null}
          </div>
          <p className="adm-muted truncate text-[11.5px]" title={item.src}>{item.src || "— medya seçilmedi —"}</p>
          {isVideo && item.poster ? <p className="adm-muted truncate text-[11.5px]" title={item.poster}>Poster: {item.poster}</p> : null}

          {/* Başlık / açıklama (dil bazlı) */}
          <div className="space-y-2">
            <div>
              <label className="adm-label">Başlık ({lang.toUpperCase()})</label>
              <input value={item.title?.[lang] ?? ""} onChange={(e) => onTitle(e.target.value)} placeholder="Boş bırakılırsa başlıksız gösterilir" className="adm-input" />
            </div>
            <div>
              <label className="adm-label">Açıklama ({lang.toUpperCase()})</label>
              <input value={item.desc?.[lang] ?? ""} onChange={(e) => onDesc(e.target.value)} placeholder="Boş bırakılırsa açıklamasız gösterilir" className="adm-input" />
            </div>
          </div>

          <button type="button" onClick={onRemove} className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
        </div>
      ) : null}
    </div>
  );
}

/** Medya seçici (yükle / kütüphane / URL) — asset PickerModal'ın galeri sürümü. */
function GalleryPicker({
  field,
  type,
  media,
  pending,
  onClose,
  onPick,
}: {
  field: "src" | "poster";
  type: "image" | "video";
  media: MediaItem[];
  pending: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  // Poster her zaman görsel; ana medya öğenin tipine bağlı.
  const asVideo = field === "src" && type === "video";
  const title = field === "poster" ? "Poster (video kapağı)" : asVideo ? "Video" : "Görsel";

  const upload = async (file: File) => {
    setErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("alt", title);
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
            <h4 className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>Değiştir: {title}</h4>
            <p className="adm-muted text-[12.5px]">Yeni {asVideo ? "video" : "görsel"} yükle, kütüphaneden seç ya da URL yapıştır.</p>
          </div>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-ghost adm-btn-sm">✕</button>
        </div>

        {/* Yükle */}
        <label className="adm-empty mb-4 block cursor-pointer" style={{ padding: "20px" }}>
          <input ref={fileRef} type="file" accept={asVideo ? "video/*" : "image/*"} className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}><Icon name="upload" size={20} /></span>
          <span className="block font-semibold text-[13.5px]" style={{ color: "rgb(var(--foreground))" }}>{uploading ? "Yükleniyor…" : "Dosya seç / buraya yükle"}</span>
          <span className="adm-muted block text-[12px]">{asVideo ? "MP4/WEBM" : "PNG, JPG, WEBP"}</span>
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
                    <button type="button" onClick={() => removeMedia(m.id!)} title="Görseli sil" className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full text-white opacity-0 transition group-hover:opacity-100" style={{ background: "rgb(var(--accent))" }}>✕</button>
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
