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
        <div
          className="adm-card adm-card-featured sticky top-0 z-20 mb-3 flex flex-wrap items-center gap-3 px-4 py-3"
        >
          <span className="text-[13.5px] font-medium" style={{ color: "rgb(var(--foreground))" }}>
            Sıralama değişti — kaydetmeyi unutmayın.
          </span>
          <button onClick={save} disabled={pending} className="adm-btn adm-btn-primary adm-btn-sm">
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
            className="rounded-[1.25rem]"
            style={overId === id && dragId !== id ? { boxShadow: "0 0 0 2px rgb(var(--primary))" } : undefined}
          >
            <div
              draggable
              onDragStart={() => setDragId(id)}
              onDragEnd={() => { setDragId(null); setOverId(null); }}
              className="adm-muted mb-1.5 flex cursor-move items-center gap-2 text-xs font-medium"
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
