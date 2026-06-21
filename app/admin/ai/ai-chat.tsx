"use client";

import { useRef, useState } from "react";

type ExecutedQuery = {
  sql: string;
  ok: boolean;
  rowCount?: number;
  rows?: Record<string, unknown>[];
  error?: string;
};

type ProposedWrite = {
  sql: string;
  table?: string;
  reason?: string;
  valid: boolean;
  error?: string;
};

type WriteState = { status: "idle" | "applying" | "done" | "error"; message?: string };

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  queries?: ExecutedQuery[];
  proposedWrites?: ProposedWrite[];
};

function ResultTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return <p className="text-xs text-slate-500">Sonuç yok.</p>;
  const cols = Object.keys(rows[0]);
  return (
    <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-slate-50 text-slate-500">
          <tr>
            {cols.map((c) => (
              <th key={c} className="whitespace-nowrap p-2 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              {cols.map((c) => (
                <td key={c} className="whitespace-nowrap p-2 text-slate-700">
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

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Önerilen yazmaların durumu — anahtar: "msgIndex:writeIndex"
  const [writeStates, setWriteStates] = useState<Record<string, WriteState>>({});
  const endRef = useRef<HTMLDivElement>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setLoading(true);

    const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
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
      setLoading(false);
    }
  }

  async function applyWrite(key: string, sql: string) {
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
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 max-h-[55vh] space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <p className="px-1 py-6 text-center text-sm text-slate-400">
            Örnek: “Bu ay kaç talep geldi, dile göre dağılımı nedir?” · “WELCOME10 indirim
            kodunu pasifleştirmeyi öner.”
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={
                "inline-block max-w-[90%] rounded-2xl px-4 py-2 text-sm " +
                (m.role === "user" ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-800")
              }
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Çalıştırılan okuma sorguları */}
              {m.queries?.map((q, qi) => (
                <div key={qi} className="mt-2 text-left">
                  <details className="rounded-lg bg-white/70 p-2">
                    <summary className="cursor-pointer text-xs text-slate-500">
                      {q.ok ? `SQL · ${q.rowCount ?? 0} satır` : "SQL · hata"}
                    </summary>
                    <pre className="mt-1 overflow-x-auto rounded bg-slate-900 p-2 text-[11px] text-slate-100">
                      {q.sql}
                    </pre>
                    {q.ok && q.rows ? (
                      <ResultTable rows={q.rows} />
                    ) : (
                      <p className="mt-1 text-xs text-red-600">{q.error}</p>
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
                    className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-left"
                  >
                    <div className="text-xs font-semibold text-amber-800">
                      ✍️ Önerilen değişiklik {w.table ? `· "${w.table}"` : ""} — onayın gerekiyor
                    </div>
                    {w.reason && <p className="mt-1 text-xs text-amber-700">{w.reason}</p>}
                    <pre className="mt-1 overflow-x-auto rounded bg-slate-900 p-2 text-[11px] text-slate-100">
                      {w.sql}
                    </pre>
                    {!w.valid ? (
                      <p className="mt-1 text-xs text-red-600">Geçersiz öneri: {w.error}</p>
                    ) : st.status === "done" ? (
                      <p className="mt-1 text-xs font-medium text-green-700">✓ {st.message}</p>
                    ) : st.status === "error" ? (
                      <p className="mt-1 text-xs text-red-600">✗ {st.message}</p>
                    ) : (
                      <button
                        onClick={() => applyWrite(key, w.sql)}
                        disabled={st.status === "applying"}
                        className="mt-2 rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {st.status === "applying" ? "Uygulanıyor…" : "Onayla ve uygula"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {loading && <p className="text-left text-sm text-slate-400">Düşünüyor…</p>}
        <div ref={endRef} />
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <form onSubmit={send} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Veritabanına bir soru sor ya da bir değişiklik iste…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}
