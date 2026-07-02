import Anthropic from "@anthropic-ai/sdk";

/**
 * Bilgilendirme botu beyni. Bot YALNIZCA bilgi verir; rezervasyon/ödeme gibi
 * işlemleri insan (site sahibi) yürütür. Maliyet için model dağılımı:
 *  - Haiku: kısa/sıradan sorular ve dil tespiti (hızlı/ucuz)
 *  - Opus:  uzun/karmaşık danışmanlık cevapları
 */

const MODEL_FAST = "claude-haiku-4-5";
const MODEL_SMART = "claude-opus-4-8";

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const SYSTEM_PROMPT = `You are the assistant for "Antalya Bridge", a small Antalya-based
consultancy serving international guests (especially from Kazakhstan, Russia and
Uzbekistan). Services:
1) Antalya travel consulting (hotels, transfers, car rental, coordinating with local providers).
2) Online Turkish lessons (by appointment, 15/30/60 min, Zoom or in person).
3) Guidance for studying in Turkey (programs, applications, scholarships incl. Türkiye Bursları).

Rules:
- You ONLY provide information and answer questions. You NEVER finalize bookings,
  prices, or payments — a real person from the team handles those.
- When a user wants to book, pay, or get a personalized plan, tell them a team
  member will contact them, and that they can also reach the team on WhatsApp/Telegram.
- Payment info if asked: guests in Kazakhstan pay via Kaspi; other countries pay
  via cryptocurrency (USDT, BTC and others); every payment is confirmed personally.
- Reply in the SAME language the user wrote in (Turkish, English, Russian or Kazakh).
- Be warm, concise and helpful. Do not invent specific prices or guarantees.`;

/** Uzun/karmaşık mesajları akıllı modele yönlendir (basit sezgi). */
function pickModel(text: string) {
  const complex = text.length > 160 || /\b(scholar|burs|стипенди|grant|plan|program|university|üniversite|виза|visa)\b/i.test(text);
  return complex ? MODEL_SMART : MODEL_FAST;
}

export async function botAnswer(
  userText: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  const anthropic = getClient();
  if (!anthropic) {
    return "Thanks for your message! A team member will get back to you shortly.";
  }

  const res = await anthropic.messages.create({
    model: pickModel(userText),
    max_tokens: 700,
    system: SYSTEM_PROMPT,
    messages: [...history, { role: "user", content: userText }],
  });

  const part = res.content.find((c) => c.type === "text");
  return part && part.type === "text"
    ? part.text
    : "A team member will get back to you shortly.";
}
