import { SCHEMA_CONTEXT } from "./schema-context";
import { runSelect, readonlyDbAvailable } from "./db-readonly";
import { validateWrite, readwriteDbAvailable, WRITABLE_TABLES } from "./db-write";
import {
  chat,
  openrouterAvailable,
  defaultModel,
  smartModel,
  type ChatMessage,
  type ToolDef,
} from "./llm";

/**
 * Admin paneli için doğal dille veritabanı asistanı (OpenRouter üzerinden).
 *
 * Yetki: OKUMA + GÜVENLİ YAZMA.
 *  - Okuma: `run_select_query` aracını serbestçe çağırır (salt-okunur rol).
 *  - Yazma: `propose_write` ile INSERT/UPDATE ÖNERİR; HEMEN UYGULANMAZ. Admin
 *    UI'da onaylayınca /api/admin/ai/apply çalıştırır. SİLME hiçbir koşulda yok.
 *
 * Model `.env`'den serbest seçilir (OPENROUTER_MODEL / OPENROUTER_MODEL_SMART).
 */

const MAX_TURNS = 6;

export function assistantAvailable(): boolean {
  return openrouterAvailable() && readonlyDbAvailable();
}
export function writeEnabled(): boolean {
  return readwriteDbAvailable();
}

function systemPrompt(): string {
  const writeNote = writeEnabled()
    ? `\n\nYAZMA (sadece öneri, onayla uygulanır):
- Veri ekleme/güncelleme gerekiyorsa \`propose_write\` aracını kullan; tek bir
  INSERT veya UPDATE öner. Bu HEMEN uygulanmaz — yönetici panelde onaylayınca
  uygulanır. Asla "ekledim/güncelledim" deme; "şu değişikliği öneriyorum, onayını
  bekliyorum" de.
- SİLME yapamazsın (ne araç var ne de yetki). Kullanıcı silme isterse yapamayacağını söyle.
- Yazılabilir tablolar: ${[...WRITABLE_TABLES].join(", ")}. Hassas tablolar
  ("User", "AuditLog", "PaymentMethod") yazıma KAPALI.`
    : `\n\nSadece OKUMA modundasın; veri ekleme/güncelleme/silme yapamazsın.`;

  return `Sen "Antalya Bridge" danışmanlık platformunun admin paneline gömülü, veriye
dayalı bir asistansın. Talepler, indirim kodları, ödeme yöntemleri, içerik ve bot
konuşmaları gibi verileri sorgular ve gerektiğinde değişiklik ÖNERİRSİN.

OKUMA:
- Veriye ihtiyaç duyan her soruda \`run_select_query\` aracını kullan; cevabı
  sorgu sonucuna dayandır, rakam uydurma.
- PostgreSQL. Tablo/kolon adları büyük/küçük harf duyarlı; SQL'de daima çift tırnak
  kullan (FROM "Lead", "createdAt"). Tek bir SELECT (veya WITH ... SELECT) yaz;
  noktalı virgülle birden fazla ifade yazma; yorum kullanma.${writeNote}

GENEL:
- Yöneticiyle Türkçe konuş (soru başka dildeyse o dilde yanıtla). Kısa ve net ol.

Veritabanı şeması:
${SCHEMA_CONTEXT}`;
}

function tools(): ToolDef[] {
  const t: ToolDef[] = [
    {
      type: "function",
      function: {
        name: "run_select_query",
        description:
          "Salt-okunur tek bir PostgreSQL SELECT (veya WITH ... SELECT) çalıştırır ve satırları döndürür.",
        parameters: {
          type: "object",
          properties: { query: { type: "string", description: "Tek SELECT sorgusu." } },
          required: ["query"],
        },
      },
    },
  ];
  if (writeEnabled()) {
    t.push({
      type: "function",
      function: {
        name: "propose_write",
        description:
          "Tek bir INSERT veya UPDATE ÖNERİR (hemen uygulanmaz; yönetici onayına sunulur). Silme yapılamaz.",
        parameters: {
          type: "object",
          properties: {
            sql: { type: "string", description: "Tek INSERT veya UPDATE ifadesi." },
            reason: { type: "string", description: "Bu değişikliğin kısa gerekçesi." },
          },
          required: ["sql"],
        },
      },
    });
  }
  return t;
}

function pickModel(text: string) {
  const complex =
    text.length > 120 ||
    /\b(kaç|toplam|ortalama|dağılım|analiz|trend|karşılaştır|rapor|grup|group|son\s+\d|geçen|aylık|haftalık|günlük|between|join|en çok|en az|ekle|güncelle|değiştir)\b/i.test(
      text
    );
  return complex ? smartModel() : defaultModel();
}

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

export type AssistantReply = {
  answer: string;
  model: string;
  queries: ExecutedQuery[];
  proposedWrites: ProposedWrite[];
};

export async function askAssistant(
  userText: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<AssistantReply> {
  const model = pickModel(userText);
  const queries: ExecutedQuery[] = [];
  const proposedWrites: ProposedWrite[] = [];

  if (!assistantAvailable()) {
    return {
      answer:
        "AI asistanı yapılandırılmamış. `OPENROUTER_API_KEY` ve `AI_READONLY_DATABASE_URL` ayarlandığında etkinleşir.",
      model,
      queries,
      proposedWrites,
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt() },
    ...history.map((h) => ({ role: h.role, content: h.content }) as ChatMessage),
    { role: "user", content: userText },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await chat({ model, messages, tools: tools() });

    if (!res.toolCalls.length) {
      return { answer: res.content || "(boş yanıt)", model, queries, proposedWrites };
    }

    // Asistanın araç çağrılarını işleme al.
    messages.push({ role: "assistant", content: res.content, tool_calls: res.toolCalls });

    for (const call of res.toolCalls) {
      let args: { query?: string; sql?: string; reason?: string } = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        /* boş bırak */
      }

      if (call.function.name === "run_select_query") {
        const result = await runSelect(String(args.query ?? ""));
        if (result.ok) {
          queries.push({ sql: result.sql, ok: true, rowCount: result.rowCount, rows: result.rows });
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({ rowCount: result.rowCount, rows: result.rows }),
          });
        } else {
          queries.push({ sql: String(args.query ?? ""), ok: false, error: result.error });
          messages.push({ role: "tool", tool_call_id: call.id, content: `HATA: ${result.error}` });
        }
      } else if (call.function.name === "propose_write" && writeEnabled()) {
        const sql = String(args.sql ?? "");
        const v = validateWrite(sql);
        proposedWrites.push({
          sql,
          reason: args.reason,
          valid: v.ok,
          table: v.ok ? v.table : undefined,
          error: v.ok ? undefined : v.error,
        });
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: v.ok
            ? "Öneri kaydedildi; UYGULANMADI. Yönetici onayı bekleniyor. Uygulandığını varsayma."
            : `Öneri geçersiz: ${v.error}`,
        });
      } else {
        messages.push({ role: "tool", tool_call_id: call.id, content: "Bilinmeyen araç." });
      }
    }
  }

  return {
    answer: "Adım sınırına ulaşıldı. Soruyu biraz daha belirginleştirir misin?",
    model,
    queries,
    proposedWrites,
  };
}
