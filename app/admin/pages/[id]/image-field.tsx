"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/icons";

/**
 * Görsel alanı — metin girişi (URL) + "Seç" → yüklenen medyadan modal grid.
 * Input controlled ve `name`'li olduğu için blok formuyla birlikte gönderilir.
 */
export function ImageField({ name, defaultValue, media }: { name: string; defaultValue: string; media: string[] }) {
  const [val, setVal] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <input
          name={name}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="/images/... veya URL"
          className="adm-input"
        />
        <button type="button" onClick={() => setOpen(true)} className="adm-btn adm-btn-ghost adm-btn-sm shrink-0">
          <Icon name="image" size={14} /> Seç
        </button>
        {val ? (
          <button type="button" onClick={() => setVal("")} className="adm-btn adm-btn-ghost adm-btn-sm shrink-0" title="Temizle">
            ✕
          </button>
        ) : null}
      </div>
      {val ? (
        <img src={val} alt="" className="mt-2 h-14 w-24 rounded-lg object-cover" style={{ boxShadow: "0 0 0 1px rgb(var(--border))" }} />
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setOpen(false)}>
          <div
            className="adm-card adm-card-pad max-h-[80vh] w-full max-w-3xl overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>Medya seç</h3>
              <button type="button" onClick={() => setOpen(false)} className="adm-btn adm-btn-ghost adm-btn-sm">Kapat ✕</button>
            </div>
            {media.length === 0 ? (
              <p className="adm-muted py-8 text-center text-sm">Henüz medya yok. “Medya” sekmesinden yükleyin.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => { setVal(u); setOpen(false); }}
                    className="group overflow-hidden rounded-lg transition"
                    style={{ boxShadow: val === u ? "0 0 0 2px rgb(var(--primary))" : "0 0 0 1px rgb(var(--border))" }}
                  >
                    <img src={u} alt="" className="aspect-[4/3] w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
