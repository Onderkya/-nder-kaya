"use client";

import { useState } from "react";

/**
 * Görsel alanı — metin girişi (URL) + "Seç" → yüklenen medyadan modal grid.
 * Input controlled ve `name`'li olduğu için blok formuyla birlikte gönderilir.
 */
export function ImageField({ name, defaultValue, media }: { name: string; defaultValue: string; media: string[] }) {
  const [val, setVal] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-1">
        <input
          name={name}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="/images/... veya URL"
          className="w-52 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <button type="button" onClick={() => setOpen(true)} className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
          Seç
        </button>
        {val ? <button type="button" onClick={() => setVal("")} className="rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-400">✕</button> : null}
      </div>
      {val ? <img src={val} alt="" className="mt-1.5 h-14 w-24 rounded object-cover ring-1 ring-slate-200" /> : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6" onClick={() => setOpen(false)}>
          <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Medya seç</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-400">Kapat ✕</button>
            </div>
            {media.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Henüz medya yok. “Medya” sekmesinden yükleyin.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => { setVal(u); setOpen(false); }}
                    className={`group overflow-hidden rounded-lg ring-1 transition ${val === u ? "ring-2 ring-cyan-500" : "ring-slate-200 hover:ring-cyan-400"}`}
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
