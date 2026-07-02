"use client";

import { useState } from "react";
import {
  useAiConversation,
  AiMessageBubble,
  AiThinkingBubble,
} from "@/components/admin/ai-chat-core";

/** Tam sayfa AI asistanı (/admin/ai) — sohbet çekirdeği ai-chat-core'da. */
export function AiChat() {
  const { messages, loading, error, send, applyWrite, writeStates, endRef } = useAiConversation();
  const [input, setInput] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    void send(text);
  }

  return (
    <div className="adm-card adm-card-pad">
      <div className="mb-3 max-h-[55vh] space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="adm-empty">
            <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>Bir şey sorun ya da bir değişiklik isteyin</p>
            <p className="adm-muted mx-auto mt-1 max-w-md text-[13.5px]">
              Örnek: “Bu ay kaç talep geldi, dile göre dağılımı nedir?” · “WELCOME10 indirim kodunu pasifleştirmeyi öner.”
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <AiMessageBubble key={i} message={m} index={i} writeStates={writeStates} applyWrite={applyWrite} />
        ))}
        {loading && <AiThinkingBubble />}
        <div ref={endRef} />
      </div>

      {error && <p className="mb-2 text-sm" style={{ color: "rgb(var(--accent))" }}>{error}</p>}

      <form onSubmit={submit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Veritabanına bir soru sor ya da bir değişiklik iste…"
          className="adm-input flex-1"
        />
        <button disabled={loading} className="adm-btn adm-btn-primary">
          Gönder
        </button>
      </form>
    </div>
  );
}
