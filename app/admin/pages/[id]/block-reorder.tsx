"use client";

import { useState, useTransition, type ReactNode } from "react";
import { reorderBlocks } from "../actions";

/**
 * Blok listesini sürükle-bırak ile yeniden sıralar. Sunucuda render edilmiş blok
 * kartları `items[].node` olarak gelir; yalnız üstteki tutamaç sürüklenir (içteki
 * form alanları normal çalışır). "Sıralamayı kaydet" → reorderBlocks server action.
 */
export function BlockReorder({ pageId, items }: { pageId: string; items: { id: string; node: ReactNode }[] }) {
  const [order, setOrder] = useState<string[]>(items.map((i) => i.id));
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const nodeById = new Map(items.map((i) => [i.id, i.node]));

  function drop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return; }
    setOrder((o) => {
      const a = [...o];
      a.splice(a.indexOf(targetId), 0, ...a.splice(a.indexOf(dragId), 1));
      return a;
    });
    setDirty(true);
    setDragId(null);
    setOverId(null);
  }

  function save() {
    const fd = new FormData();
    fd.set("pageId", pageId);
    fd.set("ids", order.join(","));
    start(async () => { await reorderBlocks(fd); setDirty(false); });
  }

  return (
    <div>
      {dirty ? (
        <div className="sticky top-0 z-20 mb-3 flex items-center gap-3 rounded-xl bg-amber-100 px-4 py-2 text-sm text-amber-900">
          Sıralama değişti.
          <button onClick={save} disabled={pending} className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">
            {pending ? "Kaydediliyor…" : "Sıralamayı kaydet"}
          </button>
        </div>
      ) : null}

      <div className="space-y-5">
        {order.map((id) => (
          <div
            key={id}
            onDragOver={(e) => { e.preventDefault(); setOverId(id); }}
            onDrop={() => drop(id)}
            className={overId === id && dragId !== id ? "rounded-2xl ring-2 ring-cyan-400" : ""}
          >
            <div
              draggable
              onDragStart={() => setDragId(id)}
              onDragEnd={() => { setDragId(null); setOverId(null); }}
              className="mb-1 flex cursor-move items-center gap-2 text-xs font-medium text-slate-400"
              title="Sürükleyerek sırala"
            >
              <span className="text-base leading-none">⠿</span> sürükle
            </div>
            {nodeById.get(id)}
          </div>
        ))}
      </div>
    </div>
  );
}
