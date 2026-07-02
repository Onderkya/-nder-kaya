"use client";

import { useCallback, useRef, useState } from "react";

/**
 * AI sohbetinin ORTAK çekirdeği — hem tam sayfa asistan (/admin/ai) hem de
 * sağ yan panel bunu kullanır. API sözleşmesi: POST /api/admin/ai (soru) ve
 * POST /api/admin/ai/apply (onaylı yazma). Backend'e dokunulmaz.
 */

export type ExecutedQuery = {
  sql: string;
  ok: boolean;
  rowCount?: number;
  rows?: Record<string, unknown>[];
  error?: string;
};

export type ProposedWrite = {
  sql: string;
  table?: string;
  reason?: string;
  valid: boolean;
  error?: string;
};

export type WriteState = { status: "idle" | "applying" | "done" | "error"; message?: string };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  queries?: ExecutedQuery[];
  proposedWrites?: ProposedWrite[];
};

export function ResultTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return <p className="adm-muted text-xs">Sonuç yok.</p>;
  const cols = Object.keys(rows[0]);
  return (
    <div className="mt-2 max-h-72 overflow-auto rounded-lg border" style={{ borderColor: "rgb(var(--border))" }}>
      <table className="w-full text-left text-xs">
        <thead className="adm-muted sticky top-0" style={{ background: "rgb(var(--muted))" }}>
          <tr>
            {cols.map((c) => (
              <th key={c} className="whitespace-nowrap p-2 font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t" style={{ borderColor: "rgb(var(--border))" }}>
              {cols.map((c) => (
                <td key={c} className="whitespace-nowrap p-2" style={{ color: "rgb(var(--foreground))" }}>
                  {r[c] === null || r[c] === undefined ? "—" : String(r[c])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Sohbet durumu + gönderme/onaylama mantığı (görsel katmandan bağımsız). */
export function useAiConversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Önerilen yazmaların durumu — anahtar: "msgIndex:writeIndex"
  const [writeStates, setWriteStates] = useState<Record<string, WriteState>>({});
  const endRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || loadingRef.current) return;

    setError(null);
    loadingRef.current = true;
    setLoading(true);
    let history: { role: "user" | "assistant"; content: string }[] = [];
    setMessages((prev) => {
      history = prev.map((m) => ({ role: m.role, content: m.content }));
      return [...prev, { role: "user", content: text }];
    });
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      if (res.status === 429) {
        setError("Çok fazla istek. Biraz bekleyip tekrar dene.");
        return;
      }
      if (!res.ok) {
        setError("Bir hata oluştu. Tekrar dene.");
        return;
      }
      const data = await res.json();
      if (data.disabled) {
        setError("AI asistanı yapılandırılmamış.");
        return;
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.answer,
          queries: data.queries,
          proposedWrites: data.proposedWrites,
        },
      ]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setError("Ağ hatası. Tekrar dene.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  const applyWrite = useCallback(async (key: string, sql: string) => {
    setWriteStates((s) => ({ ...s, [key]: { status: "applying" } }));
    try {
      const res = await fetch("/api/admin/ai/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setWriteStates((s) => ({
          ...s,
          [key]: { status: "done", message: `Uygulandı (${data.affected} satır).` },
        }));
      } else {
        setWriteStates((s) => ({
          ...s,
          [key]: { status: "error", message: data.error || "Uygulanamadı." },
        }));
      }
    } catch {
      setWriteStates((s) => ({ ...s, [key]: { status: "error", message: "Ağ hatası." } }));
    }
  }, []);

  return { messages, loading, error, send, applyWrite, writeStates, endRef };
}

/** Tek mesaj balonu: içerik + SQL detayları + onay gerektiren yazma kartları. */
export function AiMessageBubble({
  message: m,
  index: i,
  writeStates,
  applyWrite,
}: {
  message: ChatMessage;
  index: number;
  writeStates: Record<string, WriteState>;
  applyWrite: (key: string, sql: string) => void;
}) {
  return (
    <div className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
      <div
        className="max-w-[90%] rounded-2xl px-4 py-2.5 text-sm"
        style={
          m.role === "user"
            ? { background: "rgb(var(--primary))", color: "#fff" }
            : { background: "rgb(var(--muted))", color: "rgb(var(--foreground))" }
        }
      >
        <div className="whitespace-pre-wrap">{m.content}</div>

        {/* Çalıştırılan okuma sorguları */}
        {m.queries?.map((q, qi) => (
          <div key={qi} className="mt-2 text-left">
            <details className="rounded-lg p-2" style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}>
              <summary className="adm-muted cursor-pointer text-xs">
                {q.ok ? `SQL · ${q.rowCount ?? 0} satır` : "SQL · hata"}
              </summary>
              <pre className="mt-1 overflow-x-auto rounded p-2 text-[11px]" style={{ background: "#071d25", color: "#e6f2f4" }}>
                {q.sql}
              </pre>
              {q.ok && q.rows ? (
                <ResultTable rows={q.rows} />
              ) : (
                <p className="mt-1 text-xs" style={{ color: "rgb(var(--accent))" }}>{q.error}</p>
              )}
            </details>
          </div>
        ))}

        {/* Önerilen yazmalar — onay gerektirir */}
        {m.proposedWrites?.map((w, wi) => {
          const key = `${i}:${wi}`;
          const st = writeStates[key] ?? { status: "idle" as const };
          return (
            <div
              key={wi}
              className="mt-2 rounded-lg p-2.5 text-left"
              style={{ background: "rgb(var(--gold) / 0.12)", border: "1px solid rgb(var(--gold) / 0.4)" }}
            >
              <div className="text-xs font-semibold" style={{ color: "rgb(var(--gold))" }}>
                ✍️ Önerilen değişiklik {w.table ? `· "${w.table}"` : ""} — onayınız gerekiyor
              </div>
              {w.reason && <p className="adm-muted mt-1 text-xs">{w.reason}</p>}
              <pre className="mt-1 overflow-x-auto rounded p-2 text-[11px]" style={{ background: "#071d25", color: "#e6f2f4" }}>
                {w.sql}
              </pre>
              {!w.valid ? (
                <p className="mt-1 text-xs" style={{ color: "rgb(var(--accent))" }}>Geçersiz öneri: {w.error}</p>
              ) : st.status === "done" ? (
                <p className="mt-1 text-xs font-medium" style={{ color: "rgb(var(--primary))" }}>✓ {st.message}</p>
              ) : st.status === "error" ? (
                <p className="mt-1 text-xs" style={{ color: "rgb(var(--accent))" }}>✗ {st.message}</p>
              ) : (
                <button
                  onClick={() => applyWrite(key, w.sql)}
                  disabled={st.status === "applying"}
                  className="adm-btn adm-btn-primary adm-btn-sm mt-2"
                >
                  {st.status === "applying" ? "Uygulanıyor…" : "Onayla ve uygula"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** "Düşünüyor…" göstergesi. */
export function AiThinkingBubble() {
  return (
    <div className="flex justify-start">
      <div className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5" style={{ background: "rgb(var(--muted))" }}>
        <span className="adm-muted text-sm">Düşünüyor</span>
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.3s]" style={{ background: "rgb(var(--muted-foreground))" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.15s]" style={{ background: "rgb(var(--muted-foreground))" }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: "rgb(var(--muted-foreground))" }} />
        </span>
      </div>
    </div>
  );
}

/** Anahtar yapılandırılmamışsa gösterilen rehber (eski ai-fab metni). */
export function AiUnavailableNotice() {
  return (
    <div className="p-2 text-[13.5px] leading-relaxed" style={{ color: "rgb(var(--foreground))" }}>
      <p className="font-semibold">AI asistanı henüz açık değil.</p>
      <p className="adm-muted mt-1">
        Sunucuda <code className="rounded px-1" style={{ background: "rgb(var(--muted))" }}>OPENROUTER_API_KEY</code> ve salt-okunur{" "}
        <code className="rounded px-1" style={{ background: "rgb(var(--muted))" }}>AI_READONLY_DATABASE_URL</code> ayarlanınca burada sana
        yardım eder. Ayarları <b>Ayarlar</b> ekranından da girebilirsin.
      </p>
    </div>
  );
}
