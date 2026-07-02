"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { useAiPanel } from "./ai-panel-context";
import {
  useAiConversation,
  AiMessageBubble,
  AiThinkingBubble,
  AiUnavailableNotice,
} from "./ai-chat-core";

/**
 * Sağ AI yan paneli — layout'ta hep mount, kapalıyken gizli. Sohbet durumu
 * burada yaşadığı için sayfa geçişlerinde kaybolmaz. Masaüstü: sağdan 400px
 * sütun; mobil: üst bardan alta tam boy sheet (alt sekme çubuğunun üstünde).
 */

// Sayfaya duyarlı öneri çipleri — en uzun eşleşen önek kazanır.
const SUGGESTIONS: { prefix: string; questions: string[] }[] = [
  { prefix: "/admin/sales", questions: ["Bu ay ciro ne kadar?", "Son 5 satışı listele"] },
  { prefix: "/admin/tours", questions: ["Hangi tur en çok satıyor?", "Kaç aktif tur var?"] },
  { prefix: "/admin/leads", questions: ["Bekleyen talepleri özetle", "Bu hafta kaç talep geldi?"] },
];
const DEFAULT_QUESTIONS = ["Bu ay kaç satış oldu?", "Bu ay kaç talep geldi?"];

function questionsFor(pathname: string): string[] {
  let best: string[] = DEFAULT_QUESTIONS;
  let bestLen = 0;
  for (const s of SUGGESTIONS) {
    if ((pathname === s.prefix || pathname.startsWith(s.prefix + "/")) && s.prefix.length > bestLen) {
      bestLen = s.prefix.length;
      best = s.questions;
    }
  }
  return best;
}

/** Mobil üst bar için AI butonu (masaüstü TopBar'ın karşılığı; FAB kalktı). */
export function AiPanelMobileButton() {
  const { open } = useAiPanel();
  return (
    <button type="button" onClick={open} className="adm-btn adm-btn-sm adm-btn-ai" title="AI Asistan">
      <Icon name="bolt" size={15} /> AI
    </button>
  );
}

export function AiPanel() {
  const { available, isOpen, close, pending, clearPending } = useAiPanel();
  const pathname = usePathname() || "";
  const { messages, loading, error, send, applyWrite, writeStates, endRef } = useAiConversation();
  const [input, setInput] = useState("");

  // openWith(soru) kuyruğu: panel açıkken bekleyen soruyu gönder.
  useEffect(() => {
    if (isOpen && pending) {
      clearPending();
      void send(pending);
    }
  }, [isOpen, pending, clearPending, send]);

  // Esc kapatır.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    void send(text);
  }

  function askChip(q: string) {
    if (loading) return;
    setInput("");
    void send(q);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="AI Asistan"
      className={`${isOpen ? "flex" : "hidden"} fixed inset-x-0 bottom-0 top-14 z-[45] flex-col lg:inset-y-0 lg:left-auto lg:right-0 lg:top-0 lg:w-[400px]`}
      style={{
        background: "rgb(var(--card))",
        borderLeft: "1px solid rgb(var(--border))",
        boxShadow: "0 0 40px -12px rgb(7 26 33 / 0.25)",
      }}
    >
      {/* Başlık */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3" style={{ borderColor: "rgb(var(--border))" }}>
        <span className="flex items-center gap-2 font-semibold" style={{ color: "rgb(var(--foreground))" }}>
          <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: "rgb(var(--primary) / 0.14)", color: "rgb(var(--primary))" }}>
            <Icon name="bolt" size={15} />
          </span>
          AI Asistan
        </span>
        <button type="button" onClick={close} className="adm-btn adm-btn-ghost adm-btn-sm" aria-label="Kapat">✕</button>
      </div>

      {/* Mesaj listesi */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {available ? (
          <>
            {messages.length === 0 && !loading && (
              <div className="adm-empty">
                <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>Bir şey sorun ya da bir değişiklik isteyin</p>
                <p className="adm-muted mx-auto mt-1 max-w-md text-[13.5px]">
                  Sohbet, sayfalar arasında gezinirken kaybolmaz. Aşağıdaki önerilerden birini deneyin.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <AiMessageBubble key={i} message={m} index={i} writeStates={writeStates} applyWrite={applyWrite} />
            ))}
            {loading && <AiThinkingBubble />}
            <div ref={endRef} />
          </>
        ) : (
          <AiUnavailableNotice />
        )}
      </div>

      {/* Alt: öneri çipleri + input */}
      {available && (
        <div className="shrink-0 border-t p-3" style={{ borderColor: "rgb(var(--border))" }}>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {questionsFor(pathname).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => askChip(q)}
                disabled={loading}
                className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:brightness-95 disabled:opacity-50"
                style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--muted))", color: "rgb(var(--foreground))" }}
              >
                {q}
              </button>
            ))}
          </div>
          {error && <p className="mb-2 text-sm" style={{ color: "rgb(var(--accent))" }}>{error}</p>}
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Veritabanına bir soru sor…"
              className="adm-input flex-1"
            />
            <button disabled={loading} className="adm-btn adm-btn-primary">Gönder</button>
          </form>
        </div>
      )}
    </div>
  );
}
