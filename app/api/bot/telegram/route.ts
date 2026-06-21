import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { botAnswer } from "@/lib/claude";
import { notifyOwner } from "@/lib/notify";

/**
 * Telegram webhook. Bot bilgi verir + sahibe haber eder.
 * Kurulum: setWebhook ile bu URL'yi Telegram'a tanıt; güvenlik için
 * TELEGRAM_WEBHOOK_SECRET kullanılır (X-Telegram-Bot-Api-Secret-Token).
 */
const MAX_TEXT = 2000; // aşırı uzun mesajlarla DB/Claude maliyet/şişme önlenir

export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  // Fail-closed: secret tanımlı değilse endpoint kapalıdır (sahte mesaj enjeksiyonu önlenir).
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const update = await req.json().catch(() => null);
  const msg = update?.message;
  const chatId = msg?.chat?.id;
  let text: string | undefined = typeof msg?.text === "string" ? msg.text : undefined;
  if (!chatId || !text) return NextResponse.json({ ok: true });
  if (text.length > MAX_TEXT) text = text.slice(0, MAX_TEXT);

  // Konuşma geçmişini sakla/oku.
  const externalId = String(chatId);
  let convo = await prisma.conversation
    .findUnique({ where: { channel_externalId: { channel: "TELEGRAM", externalId } }, include: { messages: { orderBy: { createdAt: "asc" }, take: 10 } } })
    .catch(() => null);

  if (!convo) {
    convo = await prisma.conversation.create({
      data: { channel: "TELEGRAM", externalId },
      include: { messages: true },
    });
  }

  const history = convo.messages.map((m) => ({
    role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: m.content,
  }));

  const reply = await botAnswer(text, history);

  await prisma.message.createMany({
    data: [
      { conversationId: convo.id, role: "user", content: text },
      { conversationId: convo.id, role: "assistant", content: reply },
    ],
  });

  await sendTelegram(chatId, reply);

  // İlk mesajda sahibe haber ver.
  if (history.length === 0) {
    await notifyOwner({
      title: "🤖 Telegram'dan yeni konuşma",
      lines: [`Kullanıcı: ${msg?.chat?.first_name ?? externalId}`, `Mesaj: ${text}`],
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

async function sendTelegram(chatId: number | string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
