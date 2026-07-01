"use client";

import { useState } from "react";
import { AiChat } from "@/app/admin/ai/ai-chat";
import { Icon } from "./icons";

/**
 * Her admin sayfasında sağ altta yüzen AI yardımcı balonu. Tıklayınca panel
 * açılır; içinde tam AI asistanı (DB sorusu + öneri) çalışır. Mobilde alt sekme
 * çubuğunun üstünde durur.
 */
export function AdminAiFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6" role="dialog" aria-modal="true">
          <div className="adm-card flex h-[78vh] w-full flex-col overflow-hidden rounded-b-none sm:h-[560px] sm:w-[400px] sm:rounded-b-2xl" style={{ boxShadow: "0 20px 60px -20px rgb(7 26 33 / 0.5)" }}>
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "rgb(var(--border))" }}>
              <span className="flex items-center gap-2 font-semibold" style={{ color: "rgb(var(--foreground))" }}>
                <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: "rgb(var(--primary) / 0.14)", color: "rgb(var(--primary))" }}><Icon name="robot" size={16} /></span>
                AI Yardımcı
              </span>
              <button type="button" onClick={() => setOpen(false)} className="adm-btn adm-btn-ghost adm-btn-sm" aria-label="Kapat">✕</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <AiChat />
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105 lg:bottom-6 lg:right-6"
          style={{ background: "rgb(var(--primary))", boxShadow: "0 12px 30px -8px rgb(13 148 168 / 0.6)" }}
          aria-label="AI Yardımcı"
        >
          <Icon name="robot" size={24} />
        </button>
      )}
    </>
  );
}
