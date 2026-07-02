"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { moveSection, setSectionVisible } from "@/lib/section-actions";
import { AssetSlotGrid } from "./asset-manager";
import { GalleryManager } from "./gallery-manager";
import { Icon } from "./icons";
import type { AssetSlot } from "@/lib/asset-slots";
import type { GalleryItemCfg } from "@/lib/gallery";

export type CardField = { key: string; value: string; ref: string; overridden: boolean };

/** Galeri bölümü için editör verisi (prefill + override sahipliği). */
export type GalleryData = {
  sectionId: string;
  items: GalleryItemCfg[];
  hasOverride: boolean;
};

export type EditorCard = {
  key: string;
  registryId?: string;
  title: string;
  locked?: boolean;
  fields: CardField[];
  slots: AssetSlot[];
  /** Varsa bu kart bir galeri bölümü — AssetSlotGrid yerine GalleryManager render edilir. */
  gallery?: GalleryData;
};

type MediaItem = { id?: string; url: string; alt: string | null };
type LangOpt = { code: string; flag: string; name: string };

/**
 * Site Editörü'nün tek bölüm kartı. Başlık: (kilitliyse kilit, değilse ↑↓) +
 * başlık + (registryId varsa) göster/gizle anahtarı + Yayında/Gizli rozeti +
 * aç/kapa şovronu. Gövde (native <details> — alanlar KAPALIYKEN DE DOM'da kalır,
 * yani metin düzenlemeleri kaybolmaz): metin alanları (key|||locale) + slotlar +
 * "Sitede gör →".
 *
 * ↑↓ = moveSection, anahtar = setSectionVisible (Faz 2, iyimser). Metin alanları
 * dış formun (#ce-form) parçasıdır; buradaki tüm butonlar type="button".
 */
export function EditorSectionCard({
  card,
  locale,
  isTr,
  hidden,
  hiddenAssets = [],
  first,
  last,
  page,
  overrides,
  media,
  langs,
  publicHref,
  dragging = false,
  dragOver = false,
  onDragHandleStart,
  onDragHandleEnd,
  onCardDragOver,
  onCardDrop,
}: {
  card: EditorCard;
  locale: string;
  isTr: boolean;
  hidden: boolean;
  hiddenAssets?: string[];
  first: boolean;
  last: boolean;
  page: string;
  overrides: Record<string, string>;
  media: MediaItem[];
  langs: LangOpt[];
  publicHref: string | null;
  dragging?: boolean;
  dragOver?: boolean;
  onDragHandleStart?: () => void;
  onDragHandleEnd?: () => void;
  onCardDragOver?: () => void;
  onCardDrop?: () => void;
}) {
  const SEP = "|||";
  const router = useRouter();
  const [pending, start] = useTransition();
  const reorderable = !!card.registryId && !card.locked;

  const move = (dir: "up" | "down") => {
    if (!card.registryId) return;
    start(async () => {
      await moveSection(page, card.registryId!, dir);
      router.refresh();
    });
  };

  const toggle = (visible: boolean) => {
    if (!card.registryId) return;
    start(async () => {
      await setSectionVisible(card.registryId!, visible);
      router.refresh();
    });
  };

  const visible = !hidden;

  return (
    <details
      className="adm-card"
      {...(!card.locked && hidden ? {} : { open: true })}
      onDragOver={onCardDragOver ? (e) => { e.preventDefault(); onCardDragOver(); } : undefined}
      onDrop={onCardDrop ? (e) => { e.preventDefault(); onCardDrop(); } : undefined}
      style={{
        opacity: dragging ? 0.5 : undefined,
        boxShadow: dragOver ? "0 0 0 2px rgb(var(--primary))" : undefined,
      }}
    >
      <summary className="flex items-center gap-2.5 px-4 py-3 sm:px-5" style={{ listStyle: "none", cursor: "pointer" }}>
        {/* Sürükleme tutamacı (grip) — yalnız sıralanabilir kartlar; dokunmatik
            için ↑↓ oklar da aşağıda kalır. */}
        {reorderable && onDragHandleStart ? (
          <span
            draggable
            onDragStart={(e) => { e.stopPropagation(); onDragHandleStart(); }}
            onDragEnd={() => onDragHandleEnd?.()}
            onClick={(e) => e.preventDefault()}
            className="hidden shrink-0 cursor-grab touch-none select-none text-[color:rgb(var(--muted-foreground))] active:cursor-grabbing sm:flex sm:items-center"
            title="Sürükleyerek sırala"
            aria-label="Sürükleyerek sırala"
          >
            <Icon name="grip" size={18} />
          </span>
        ) : null}

        {/* Kilit ya da ↑↓ */}
        {reorderable ? (
          <span className="flex flex-col gap-0.5" onClick={(e) => e.preventDefault()}>
            <button
              type="button"
              aria-label="Yukarı taşı"
              disabled={first || pending}
              onClick={() => move("up")}
              className="flex h-5 w-6 items-center justify-center rounded-md border text-[11px] leading-none transition-colors disabled:opacity-30"
              style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="Aşağı taşı"
              disabled={last || pending}
              onClick={() => move("down")}
              className="flex h-5 w-6 items-center justify-center rounded-md border text-[11px] leading-none transition-colors disabled:opacity-30"
              style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--foreground))" }}
            >
              ▼
            </button>
          </span>
        ) : (
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ background: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))" }}
            title="Sabit bölüm — sıra/gizle yok"
            aria-label="Sabit bölüm"
          >
            <LockIcon />
          </span>
        )}

        {/* Başlık + rozet */}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate font-semibold text-[14.5px]" style={{ color: "rgb(var(--foreground))" }}>
              {card.title}
            </span>
            {card.registryId ? (
              <span className={`adm-badge ${visible ? "adm-badge-success" : "adm-badge-neutral"}`}>
                {visible ? "Yayında" : "Gizli"}
              </span>
            ) : null}
          </span>
        </span>

        {/* Göster/gizle anahtarı (yalnız registryId'li kartlar) */}
        {card.registryId ? (
          <label className="adm-switch" style={{ cursor: "pointer" }} onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={visible}
              disabled={pending}
              onChange={(e) => toggle(e.target.checked)}
            />
            <span className="adm-switch-track" />
          </label>
        ) : null}

        <Icon name="chevron" size={18} className="adm-chev adm-muted shrink-0" />
      </summary>

      <div className="border-t px-4 py-4 sm:px-5" style={{ borderColor: "rgb(var(--border))" }}>
        {/* Metin alanları */}
        {card.fields.length > 0 ? (
          <div className="space-y-4">
            {card.fields.map((f) => (
              <div key={f.key}>
                {!isTr && f.ref ? (
                  <p className="adm-muted mb-1.5 line-clamp-2 text-[12.5px]" title={f.ref}>
                    🇹🇷 {f.ref}
                  </p>
                ) : null}
                <div className="relative">
                  <textarea
                    name={`${f.key}${SEP}${locale}`}
                    defaultValue={f.value}
                    rows={(f.value || f.ref).length > 70 ? 3 : 1}
                    className="adm-textarea"
                    style={{ minHeight: "44px" }}
                  />
                  {f.overridden ? <span className="adm-badge adm-badge-warn absolute right-2 top-2">düzenlendi</span> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Galeri yöneticisi (medya + başlık listesi) — galeri bölümlerinde
            AssetSlotGrid YERİNE. #ce-form içinde ama form ÖĞESİ İÇERMEZ ve tüm
            butonları type="button" → metin formunu submit etmez / iç içe form
            oluşturmaz; saveGallery'yi kendi useTransition'ıyla çağırır. */}
        {card.gallery ? (
          <div className={card.fields.length > 0 ? "mt-5" : ""}>
            <p className="adm-label mb-2">Galeri — medya & başlıklar</p>
            <GalleryManager
              sectionId={card.gallery.sectionId}
              initialItems={card.gallery.items}
              hasOverride={card.gallery.hasOverride}
              langs={langs}
              media={media}
            />
          </div>
        ) : null}

        {/* Görsel / video slotları (galeri bölümünde bunlar galeriye taşındı;
            galeri OLMAYAN bölümlerde tekil slotlar aynen kalır). */}
        {!card.gallery && card.slots.length > 0 ? (
          <div className={card.fields.length > 0 ? "mt-5" : ""}>
            <p className="adm-label mb-2">Görseller & videolar</p>
            <AssetSlotGrid slots={card.slots} overrides={overrides} media={media} hidden={hiddenAssets} cols="sm:grid-cols-2" />
          </div>
        ) : null}

        {card.fields.length === 0 && card.slots.length === 0 && !card.gallery ? (
          <p className="adm-muted text-[13px]">Bu bölümde düzenlenecek yazı veya görsel yok — yalnızca sıra/gizle kontrolü.</p>
        ) : null}

        {publicHref ? (
          <div className="mt-4">
            <a href={publicHref} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost adm-btn-sm">
              Sitede gör →
            </a>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function LockIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
