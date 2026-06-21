"use client";

import { useRef, useState } from "react";

type ExecutedQuery = {
  sql: string;
  ok: boolean;
  rowCount?: number;
  rows?: Record<string, unknown>[];
  error?: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  queries?: ExecutedQuery[];
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

    // Sunucuya yalnızca düz metin geçmişi gönderiyoruz (tool sonuçları değil).
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
        { role: "assistant", content: data.answer, queries: data.queries },
      ]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setError("Ağ hatası. Tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 max-h-[55vh] space-y-4 overflow-y-auto">
        {messages.length === 0 && (
          <p className="px-1 py-6 text-center text-sm text-slate-400">
            Örnek: “Bu ay kaç talep geldi, dile göre dağılımı nedir?” veya “En çok kullanılan
            5 indirim kodu hangileri?”
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <div
              className={
                "inline-block max-w-[90%] rounded-2xl px-4 py-2 text-sm " +
                (m.role === "user"
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-100 text-slate-800")
              }
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
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
          placeholder="Veritabanına bir soru sor…"
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
