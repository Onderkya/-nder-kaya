"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { EditorSectionCard, type EditorCard } from "./editor-section-card";
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
  const hiddenSet = new Set(hiddenSections);

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

            <div className="space-y-3">
              {p.cards.map((card, i) => {
                // ↑↓ komşuluk yalnız registryId'li (sıralanabilir) kartlar arasında.
                const reorderable = p.cards.filter((c) => c.registryId && !c.locked);
                const ri = card.registryId && !card.locked ? reorderable.findIndex((c) => c.key === card.key) : -1;
                return (
                  <EditorSectionCard
                    key={card.key}
                    card={card}
                    locale={locale}
                    isTr={isTr}
                    hidden={!!card.registryId && hiddenSet.has(card.registryId)}
                    first={ri <= 0}
                    last={ri === reorderable.length - 1}
                    page={p.id}
                    overrides={assetOverrides}
                    media={media}
                    publicHref={p.publicHref}
                  />
                );
              })}
            </div>

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
