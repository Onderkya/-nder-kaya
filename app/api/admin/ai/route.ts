import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { askAssistant, assistantAvailable } from "@/lib/ai/assistant";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      })
    )
    .max(20)
    .optional(),
});

export async function POST(req: Request) {
  // Yalnızca admin oturumu. Sayfa render'ını middleware korur; mutasyon/işlem
  // uçlarını ayrıca burada koruyoruz.
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Maliyet/suistimal koruması: admin başına dakikada 20 soru.
  const ip = clientIp(req);
  const limit = await rateLimit(`ai:${session.uid}:${ip}`, 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: limit.retryAfter },
      { status: 429 }
    );
  }

  if (!assistantAvailable()) {
    return NextResponse.json({ disabled: true });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const reply = await askAssistant(parsed.data.message, parsed.data.history ?? []);

  // Denetim kaydı: kim, hangi soruyu sordu, kaç sorgu çalıştırıldı.
  await audit(
    session.email,
    "ai_query",
    "Assistant",
    null,
    `model=${reply.model} q="${parsed.data.message.slice(0, 200)}" sql=${reply.queries.length}`
  );

  return NextResponse.json(reply);
}
