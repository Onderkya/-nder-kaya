/**
 * OpenRouter (OpenAI-uyumlu) sohbet istemcisi.
 *
 * Admin AI asistanı bunun üzerinden çalışır; böylece model `.env`'den serbestçe
 * seçilebilir (OpenAI, Anthropic, Google, DeepSeek vb. — OpenRouter ne sunuyorsa).
 * Yalnızca `fetch` kullanır, ek bağımlılık yoktur.
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ToolDef = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

export type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ChatMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type ChatResult = {
  content: string | null;
  toolCalls: ToolCall[];
  finishReason: string | null;
};

export function openrouterAvailable(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

/** Varsayılan (ucuz/hızlı) ve "akıllı" model — ikisi de .env'den ayarlanabilir. */
export function defaultModel(): string {
  return process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
}
export function smartModel(): string {
  return process.env.OPENROUTER_MODEL_SMART || defaultModel();
}

export async function chat(opts: {
  model: string;
  messages: ChatMessage[];
  tools?: ToolDef[];
  maxTokens?: number;
}): Promise<ChatResult> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      // OpenRouter'ın istediği opsiyonel atıf başlıkları:
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://antalyabridge.com",
      "X-Title": "Antalya Bridge Admin",
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      tools: opts.tools,
      max_tokens: opts.maxTokens ?? 1500,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] }; finish_reason?: string }[];
  };
  const choice = data.choices?.[0];
  return {
    content: choice?.message?.content ?? null,
    toolCalls: choice?.message?.tool_calls ?? [],
    finishReason: choice?.finish_reason ?? null,
  };
}
