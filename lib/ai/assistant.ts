import Anthropic from "@anthropic-ai/sdk";
import { SCHEMA_CONTEXT } from "./schema-context";
import { runSelect, readonlyDbAvailable } from "./db-readonly";

/**
 * Admin paneli için doğal dille veritabanı sorgulama asistanı.
 *
 * Yetki: SALT-OKUMA. Asistana serbest yazma verilmez; yalnızca `run_select_query`
 * aracını çağırabilir, o da salt-okunur DB rolüyle çalışır (bkz. db-readonly.ts).
 *
 * Model (düşük maliyet + yeterli kalite) — HİBRİT:
 *  - Haiku 4.5:  basit/tek-tablo sorular (hızlı/ucuz)
 *  - Sonnet 4.6: karmaşık çok-tablolu analiz / SQL üretimi
 */

const MODEL_FAST = "claude-haiku-4-5";
const MODEL_SMART = "claude-sonnet-4-6";
const MAX_TURNS = 6;

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export function assistantAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY && readonlyDbAvailable();
}

const SYSTEM_PROMPT = `Sen "Antalya Bridge" danışmanlık platformunun admin paneline gömülü,
veriye dayalı bir analiz asistanısın. Görevin: yöneticinin doğal dildeki sorularını
veritabanını SALT-OKUYARAK yanıtlamak (talepler, indirim kodları, ödeme yöntemleri,
içerik, bot konuşmaları vb.).

Kurallar:
- Veriye ihtiyaç duyan her soruda \`run_select_query\` aracını kullan. Aklından
  rakam uydurma; cevabı sorgu sonucuna dayandır.
- YALNIZCA okuma yapabilirsin. Veri ekleme/güncelleme/silme YETKİN YOK ve teknik
  olarak imkânsız. Kullanıcı silme/değiştirme isterse kibarca bunu yapamayacağını,
  yalnızca raporlama/sorgulama yapabildiğini söyle.
- PostgreSQL kullanılıyor. Tablo/kolon adları büyük/küçük harf duyarlı; SQL'de
  daima çift tırnak kullan (FROM "Lead", "createdAt"). Sadece tek bir SELECT
  (veya WITH ... SELECT) yaz; noktalı virgülle birden fazla ifade yazma.
- Tarihlerde \`now()\`, \`date_trunc\`, \`interval\` gibi Postgres fonksiyonlarını
  kullanabilirsin. Sonuçları kısa ve net özetle; gerektiğinde tabloya işaret et.
- Yöneticiyle Türkçe konuş (soru başka dildeyse o dilde yanıtla).

Veritabanı şeması:
${SCHEMA_CONTEXT}`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: "run_select_query",
    description:
      "Veritabanında salt-okunur tek bir PostgreSQL SELECT (veya WITH ... SELECT) " +
      "sorgusu çalıştırır ve satırları döndürür. Yazma/değiştirme yapamaz.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Çalıştırılacak tek SELECT sorgusu." },
      },
      required: ["query"],
    },
  },
];

/** Basit sezgi: karmaşık/analitik sorular akıllı modele gider. */
function pickModel(text: string) {
  const complex =
    text.length > 120 ||
    /\b(kaç|toplam|ortalama|dağılım|analiz|trend|karşılaştır|rapor|grup|group|son\s+\d|geçen|aylık|haftalık|günlük|between|join|en çok|en az)\b/i.test(
      text
    );
  return complex ? MODEL_SMART : MODEL_FAST;
}

export type ExecutedQuery = {
  sql: string;
  ok: boolean;
  rowCount?: number;
  rows?: Record<string, unknown>[];
  error?: string;
};

export type AssistantReply = {
  answer: string;
  model: string;
  queries: ExecutedQuery[];
};

export async function askAssistant(
  userText: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<AssistantReply> {
  const anthropic = getClient();
  const model = pickModel(userText);
  const queries: ExecutedQuery[] = [];

  if (!anthropic || !readonlyDbAvailable()) {
    return {
      answer:
        "AI asistanı şu anda yapılandırılmamış. `ANTHROPIC_API_KEY` ve " +
        "`AI_READONLY_DATABASE_URL` ayarlandığında etkinleşir.",
      model,
      queries,
    };
  }

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: userText },
  ];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await anthropic.messages.create({
      model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    if (res.stop_reason !== "tool_use") {
      const text = res.content.find((c) => c.type === "text");
      return {
        answer: text && text.type === "text" ? text.text : "(boş yanıt)",
        model,
        queries,
      };
    }

    // Asistanın tool çağrılarını çalıştır.
    messages.push({ role: "assistant", content: res.content });
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of res.content) {
      if (block.type !== "tool_use" || block.name !== "run_select_query") continue;
      const query = String((block.input as { query?: string })?.query ?? "");
      const result = await runSelect(query);

      if (result.ok) {
        queries.push({ sql: result.sql, ok: true, rowCount: result.rowCount, rows: result.rows });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify({ rowCount: result.rowCount, rows: result.rows }),
        });
      } else {
        queries.push({ sql: query, ok: false, error: result.error });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          is_error: true,
          content: result.error,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  return {
    answer:
      "Sorgu adımları sınırına ulaşıldı. Soruyu biraz daha belirgin hale getirir misin?",
    model,
    queries,
  };
}
