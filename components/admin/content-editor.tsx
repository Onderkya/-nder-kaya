"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "./ui";
import { Icon } from "./icons";
import { AssetManager } from "./asset-manager";
import type { AssetSlot } from "@/lib/asset-slots";

export type EditField = { key: string; value: string; ref: string; overridden: boolean };
export type EditSection = { title: string; help?: string; fields: EditField[] };
export type EditPage = { id: string; label: string; description?: string; sections: EditSection[] };
export type LangOpt = { code: string; flag: string; name: string };

/**
 * Sayfa-sekmeli, TEK DİLLİ içerik editörü. Üstte gerçek sayfa sekmeleri
 * (Anasayfa/Antalya…), üstte dil seçici. Yazılar yukarıdan aşağıya bölümler
 * hâlinde. Tek `Kaydet` tüm sekmeleri (o dil için) kaydeder — sekme değişince
 * düzenlemeler kaybolmaz (gizli sekmeler de formda kalır).
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
}: {
  pages: EditPage[];
  locale: string;
  langs: LangOpt[];
  initialPageId: string;
  saveAction: (fd: FormData) => void | Promise<void>;
  assetsByPage?: Record<string, AssetSlot[]>;
  assetOverrides?: Record<string, string>;
  media?: { url: string; alt: string | null }[];
}) {
  const [active, setActive] = useState(initialPageId);
  const SEP = "|||";
  const isTr = locale === "tr";

  return (
    <div>
      {/* Dil seçici */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="adm-muted text-[12.5px] font-semibold">Düzenlenen dil:</span>
          {langs.map((l) => (
            <Link
              key={l.code}
              href={`?lang=${l.code}&sayfa=${active}`}
              className={`adm-btn adm-btn-sm ${l.code === locale ? "adm-btn-primary" : "adm-btn-ghost"}`}
            >
              {l.flag} {l.name}
            </Link>
          ))}
        </div>
        <p className="adm-muted text-[12px]">Dili değiştirmeden önce Kaydet’e bas.</p>
      </div>

      {/* Sayfa sekmeleri */}
      <div className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1">
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

      {/* Aktif sayfanın görselleri/videoları (metin formunun dışında; kendi kaydeder) */}
      {assetsByPage[active]?.length ? (
        <div className="mb-4">
          <AssetManager slots={assetsByPage[active]} overrides={assetOverrides} media={media} />
        </div>
      ) : null}

      <form action={saveAction}>
        {pages.map((p) => (
          <div key={p.id} hidden={p.id !== active}>
            {p.description ? <p className="adm-muted mb-4 text-[14px]">{p.description}</p> : null}
            <div className="space-y-4">
              {p.sections.map((s, si) => (
                <div key={si} className="adm-card adm-card-pad">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="adm-gold-rule" />
                    <h3 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>{s.title}</h3>
                  </div>
                  {s.help ? <p className="adm-help mb-4 mt-0">{s.help}</p> : null}
                  <div className="space-y-5">
                    {s.fields.length === 0 ? (
                      <p className="adm-muted text-[13px]">Bu bölümde düzenlenecek yazı yok.</p>
                    ) : (
                      s.fields.map((f) => (
                        <div key={f.key}>
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            {isTr ? (
                              <span className="adm-muted text-[11.5px]">{f.overridden ? "Düzenlendi" : ""}</span>
                            ) : (
                              <span className="adm-muted line-clamp-2 flex-1 text-[12.5px]" title={f.ref}>
                                🇹🇷 {f.ref || "—"}
                              </span>
                            )}
                            {f.overridden ? <Badge tone="warn">düzenlendi</Badge> : null}
                          </div>
                          <textarea
                            name={`${f.key}${SEP}${locale}`}
                            defaultValue={f.value}
                            rows={(f.value || f.ref).length > 70 ? 3 : 1}
                            className="adm-textarea"
                            style={{ minHeight: "44px" }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Yapışkan kaydet */}
        <div className="adm-sticky-save mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="adm-muted hidden text-[13px] sm:flex sm:items-center sm:gap-1.5">
              <Icon name="check" size={15} /> Kaydedince sitede anında yayınlanır.
            </p>
            <button className="adm-btn adm-btn-primary w-full sm:w-auto" type="submit">Kaydet</button>
          </div>
        </div>
      </form>
    </div>
  );
}
