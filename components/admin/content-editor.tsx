"use client";

import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorSectionCard, type EditorCard } from "./editor-section-card";
import { saveSectionOrder } from "@/lib/section-actions";
import type { AssetSlot } from "@/lib/asset-slots";

export type EditorPageData = {
  id: string;
  label: string;
  description?: string;
  cards: EditorCard[];
  publicHref: string | null;
};
export type LangOpt = { code: string; flag: string; name: string };
type MediaItem = { id?: string; url: string; alt: string | null };

/**
 * SİTE EDİTÖRÜ — sayfa-sekmeli, tek dilli. Üstte SABİT araç çubuğu: sayfa
 * sekmeleri + dil + Kaydet. Her sayfa, gerçek site sırasında BÖLÜM KARTLARI
 * hâlinde: her kart o bölümün metinlerini + görsellerini + sıra/gizle kontrolünü
 * birlikte taşır.
 *
 * TEK FORM / DÜZENLEME KAYBI YOK: tüm sayfaların TÜM metin alanları tek
 * <form id="ce-form"> içinde DOM'da tutulur; aktif olmayan sayfalar `hidden`.
 * Kartlar native <details> — kapalıyken de alanlar DOM'da kalır. `key={locale}`
 * → dil değişince alanlar yeni dilin değeriyle yeniden bağlanır. Tek "Kaydet"
 * tüm sayfaları (o dil için) tek submit'te kaydeder.
 */
export function ContentEditor({
  pages,
  locale,
  langs,
  initialPageId,
  saveAction,
  assetOverrides = {},
  media = [],
  hiddenSections = [],
  faqPanel,
}: {
  pages: EditorPageData[];
  locale: string;
  langs: LangOpt[];
  initialPageId: string;
  saveAction: (fd: FormData) => void | Promise<void>;
  assetOverrides?: Record<string, string>;
  media?: MediaItem[];
  hiddenSections?: string[];
  faqPanel?: ReactNode;
}) {
  const [active, setActive] = useState(initialPageId);
  const isTr = locale === "tr";

  return (
    <div>
      {/* SABİT araç çubuğu — sekmeler + dil + Kaydet hep görünür */}
      <div
        className="sticky top-14 z-20 -mx-4 mb-5 border-b px-4 py-2.5 sm:-mx-6 sm:px-6 lg:top-0"
        style={{ background: "rgb(var(--background) / 0.94)", backdropFilter: "blur(8px)", borderColor: "rgb(var(--border))" }}
      >
        <div className="no-scrollbar mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
          {pages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className={`adm-btn adm-btn-sm whitespace-nowrap ${p.id === active ? "adm-btn-primary" : "adm-btn-ghost"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="adm-muted hidden text-[12px] font-semibold sm:inline">Dil:</span>
            {langs.map((l) => (
              <Link
                key={l.code}
                href={`?lang=${l.code}&sayfa=${active}`}
                title={l.name}
                className={`adm-btn adm-btn-sm ${l.code === locale ? "adm-btn-primary" : "adm-btn-ghost"}`}
              >
                {l.flag}<span className="hidden sm:inline"> {l.name}</span>
              </Link>
            ))}
          </div>
          <button form="ce-form" type="submit" className="adm-btn adm-btn-primary adm-btn-sm">
            Kaydet
          </button>
        </div>
      </div>

      {/* key={locale} → dil değişince alanlar yeniden bağlanır (yeni dilin değeri gelir) */}
      <form id="ce-form" action={saveAction} key={locale}>
        {pages.map((p) => (
          <div key={p.id} hidden={p.id !== active}>
            {p.description ? <p className="adm-muted mb-4 text-[14px]">{p.description}</p> : null}

            <PageCards
              page={p}
              locale={locale}
              isTr={isTr}
              hiddenSections={hiddenSections}
              assetOverrides={assetOverrides}
              media={media}
              langs={langs}
            />

            {/* SSS: madde yöneticisi + Turlar yönlendirme kartı */}
            {p.id === "faq" ? (
              <div className="mt-5 space-y-4">
                {faqPanel}
                <div className="adm-card adm-card-pad">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
                    <h3 className="adm-section-title">Turlar</h3>
                  </div>
                  <p className="adm-help mb-3 mt-0">Tur paketleri ayrı bir ekranda yönetilir (fotoğraf, isim, sıra, aç/kapat).</p>
                  <Link href="/admin/tours" className="adm-btn adm-btn-primary adm-btn-sm">
                    Turları yönet →
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </form>
    </div>
  );
}

/**
 * Bir sayfanın bölüm kartları — sürükle-bırak sıralama + ↑↓ oklar.
 *
 * SÜRÜKLE-BIRAK yalnız registryId'li (kilitsiz) kartları KENDİ ARALARINDA
 * yeniden dizer; locked/registryId'siz kartlar sunucu sırasındaki sabit
 * yuvalarında kalır. Görünüm sırası "pointer-walk" ile kurulur: orijinal
 * kart listesi gezilir, her sıralanabilir yuvaya iyimser `order` dizisinden
 * sıradaki kart yerleştirilir.
 *
 * DÜZENLEME KAYBI YOK: kartlar tek `<div>` altında `key={card.key}` ile
 * render edilir. Diziyi yeniden sıralamak React uzlaşımında aynı `key`'e
 * sahip DOM/bileşen örneklerini TAŞIR (yeniden oluşturmaz); dolayısıyla
 * kaydedilmemiş <textarea> değerleri korunur. Kartlar konum-bazlı bir
 * sarmalayıcıya alınmaz ve index-key kullanılmaz.
 */
function PageCards({
  page,
  locale,
  isTr,
  hiddenSections,
  assetOverrides,
  media,
  langs,
}: {
  page: EditorPageData;
  locale: string;
  isTr: boolean;
  hiddenSections: string[];
  assetOverrides: Record<string, string>;
  media: MediaItem[];
  langs: LangOpt[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const hiddenSet = new Set(hiddenSections);

  // Sıralanabilir kartların sunucu (varsayılan) sırası — key dizisi.
  const serverOrder = page.cards.filter((c) => c.registryId && !c.locked).map((c) => c.key);
  const serverSig = serverOrder.join(",");

  // İyimser yerel sıra. Sunucu sırası değişince (router.refresh sonrası) senkronla.
  const [order, setOrder] = useState<string[]>(serverOrder);
  const [syncedSig, setSyncedSig] = useState(serverSig);
  if (serverSig !== syncedSig) {
    setOrder(serverOrder);
    setSyncedSig(serverSig);
  }

  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  const cardByKey = new Map(page.cards.map((c) => [c.key, c]));
  const registryIdByKey = (key: string) => cardByKey.get(key)?.registryId;

  // Pointer-walk: orijinal listeyi gez; sıralanabilir yuvaları iyimser `order`
  // dizisinden doldur, diğer kartları yerinde bırak.
  const orderQueue = [...order];
  const displayCards = page.cards.map((c) =>
    c.registryId && !c.locked ? cardByKey.get(orderQueue.shift()!)! : c,
  );

  function reorder(targetKey: string) {
    if (!dragKey || dragKey === targetKey) return;
    if (registryIdByKey(targetKey) === undefined) return; // sadece sıralanabilir hedef
    setOrder((o) => {
      const a = [...o];
      const from = a.indexOf(dragKey);
      const to = a.indexOf(targetKey);
      if (from < 0 || to < 0) return o;
      a.splice(to, 0, ...a.splice(from, 1));
      return a;
    });
  }

  function persist(nextOrder: string[]) {
    const ids = nextOrder.map((k) => registryIdByKey(k)).filter((x): x is string => !!x);
    start(async () => {
      await saveSectionOrder(page.id, ids);
      router.refresh();
    });
  }

  function onDropCard(targetKey: string) {
    // dragover sırasında `order` zaten canlı olarak güncellendi; yalnız hedef
    // gerçekten değiştiyse mevcut sırayı kalıcı yap.
    if (dragKey && dragKey !== targetKey && registryIdByKey(targetKey) !== undefined) {
      persist(order);
    }
    setDragKey(null);
    setOverKey(null);
  }

  const reorderableCount = order.length;

  return (
    <div className="space-y-3">
      {displayCards.map((card) => {
        const draggable = !!card.registryId && !card.locked;
        const ri = draggable ? order.indexOf(card.key) : -1;
        return (
          <EditorSectionCard
            key={card.key}
            card={card}
            locale={locale}
            isTr={isTr}
            hidden={!!card.registryId && hiddenSet.has(card.registryId)}
            first={ri <= 0}
            last={ri === reorderableCount - 1}
            page={page.id}
            overrides={assetOverrides}
            media={media}
            langs={langs}
            publicHref={page.publicHref}
            dragging={dragKey === card.key}
            dragOver={draggable && overKey === card.key && dragKey !== card.key}
            onDragHandleStart={draggable ? () => setDragKey(card.key) : undefined}
            onCardDragOver={
              draggable
                ? () => {
                    setOverKey(card.key);
                    reorder(card.key);
                  }
                : undefined
            }
            onCardDrop={draggable ? () => onDropCard(card.key) : undefined}
            onDragHandleEnd={() => {
              setDragKey(null);
              setOverKey(null);
            }}
          />
        );
      })}
    </div>
  );
}
