"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "./ui";
import { AssetManager } from "./asset-manager";
import type { AssetSlot } from "@/lib/asset-slots";

export type EditField = { key: string; value: string; ref: string; overridden: boolean };
export type EditSection = { title: string; help?: string; fields: EditField[] };
export type EditPage = { id: string; label: string; description?: string; sections: EditSection[] };
export type LangOpt = { code: string; flag: string; name: string };

/**
 * Sayfa-sekmeli, TEK DİLLİ içerik editörü. Üstte SABİT araç çubuğu: sayfa
 * sekmeleri + dil + Kaydet (hep görünür, aşağı inmeye gerek yok). Yazılar
 * yukarıdan aşağıya bölümler hâlinde. Tek Kaydet tüm sayfaları (o dil için)
 * kaydeder. `key={locale}` → dil değişince alanlar yeni dilin değeriyle gelir.
 */
export function ContentEditor({
  pages,
  locale,
  langs,
  initialPageId,
  saveAction,
  assetsByPage = {},
  assetOverrides = {},
  media = [],
  faqPanel,
}: {
  pages: EditPage[];
  locale: string;
  langs: LangOpt[];
  initialPageId: string;
  saveAction: (fd: FormData) => void | Promise<void>;
  assetsByPage?: Record<string, AssetSlot[]>;
  assetOverrides?: Record<string, string>;
  media?: { id?: string; url: string; alt: string | null }[];
  faqPanel?: ReactNode;
}) {
  const [active, setActive] = useState(initialPageId);
  const SEP = "|||";
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

      {/* Aktif sayfanın görselleri/videoları (kendi kaydeder) */}
      {assetsByPage[active]?.length ? (
        <div className="mb-4">
          <AssetManager slots={assetsByPage[active]} overrides={assetOverrides} media={media} />
        </div>
      ) : null}

      {/* SSS sayfasında ekstra madde yöneticisi (kendi kaydeder) */}
      {active === "faq" && faqPanel ? <div className="mb-4">{faqPanel}</div> : null}

      {/* key={locale} → dil değişince alanlar yeniden bağlanır (yeni dilin değeri gelir) */}
      <form id="ce-form" action={saveAction} key={locale}>
        {pages.map((p) => (
          <div key={p.id} hidden={p.id !== active}>
            {p.description ? <p className="adm-muted mb-4 text-[14px]">{p.description}</p> : null}
            <div className="space-y-4">
              {p.sections.map((s, si) => (
                <div key={si} className="adm-card adm-card-pad">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-7 w-1.5 rounded-full" style={{ background: "rgb(var(--gold))" }} />
                    <h3 className="adm-section-title">{s.title}</h3>
                  </div>
                  {s.help ? <p className="adm-help mb-4 mt-0">{s.help}</p> : null}
                  <div className="space-y-5">
                    {s.fields.length === 0 ? (
                      <p className="adm-muted text-[13px]">Bu bölümde düzenlenecek yazı yok.</p>
                    ) : (
                      s.fields.map((f) => (
                        <div key={f.key}>
                          {!isTr && f.ref ? (
                            <p className="adm-muted mb-1.5 line-clamp-2 text-[12.5px]" title={f.ref}>🇹🇷 {f.ref}</p>
                          ) : null}
                          <div className="relative">
                            <textarea
                              name={`${f.key}${SEP}${locale}`}
                              defaultValue={f.value}
                              rows={(f.value || f.ref).length > 70 ? 3 : 1}
                              className="adm-textarea"
                              style={{ minHeight: "44px" }}
                            />
                            {f.overridden ? <Badge tone="warn">düzenlendi</Badge> : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </form>
    </div>
  );
}
