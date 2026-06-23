import { NextResponse } from "next/server";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { chat as orChat, openrouterAvailable, defaultModel } from "@/lib/ai/llm";

export const dynamic = "force-dynamic";

const CHAT_MODEL = process.env.CHAT_MODEL || "claude-3-5-haiku-latest";

const schema = z.object({
  message: z.string().min(1).max(1500),
  locale: z.string().max(5).optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .max(16)
    .optional(),
});

function systemPrompt(): string {
  return `Sen "Antalya Bridge"in sıcak, profesyonel ve satış odaklı AI danışmanısın.

HİZMETLERİMİZ (sınır yok — misafirin HER türlü istek ve talebini değerlendiririz):
1) Antalya seyahat & tatil danışmanlığı — oteller, transfer, rota, aktiviteler (dalış, tekne, Land of Legends'a götürme dahil).
2) Online Türkçe dersleri — anadili Türkçe öğretmen + kendi uygulamamız PetLingo.
3) Türkiye'de eğitim & burs rehberliği — üniversite seçimi, Türkiye Bursları, başvuru, vize, geliş.
4) Yazılım / IT danışmanlığı — kıdemli yazılım mühendisi tarafından (web, mobil, otomasyon, yapay zekâ).

EKİBİMİZ: kıdemli bir yazılım mühendisi (PetLingo'yu ve bu platformu yapan) + Kazakistanlı bir Türkçe öğretmeni. Bu yolların hepsini bizzat yürüdük; bu işte gerçekten iyiyiz.

NASIL KONUŞURSUN:
- Misafirin yazdığı DİLDE yanıt ver (Türkçe / İngilizce / Rusça / Kazakça / Özbekçe).
- Kısa, samimi, umut veren ol (2-5 cümle). Ölçülü emoji.
- Önce hedefini öğren: ne için (tatil, Türkçe, eğitim, IT), tarih, kişi sayısı, bütçe aralığı, tercihler.
- Sonra ona ÖZEL kısa bir taslak plan sun ve heyecanlandır — hayalindeki tatili/eğitimi yaşatacağımızı hissettir.
- Kesinleştirme için WhatsApp'tan yazmaya davet et.
- Net fiyat VERME (her plan kişiye özel). Uydurma bilgi verme; emin değilsen "danışmanımız netleştirir" de.`;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = await rateLimit(`chat:${ip}`, 14, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { answer: "Biraz hızlı gittik 🙂 Birkaç saniye sonra tekrar yazar mısın? Acelen varsa WhatsApp/Telegram her zaman açık." },
      { status: 429 },
    );
  }

  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenRouter = openrouterAvailable();
  if (!hasAnthropic && !hasOpenRouter) {
    return NextResponse.json({
      answer: "Şu an canlı yazışma için WhatsApp veya Telegram butonunu kullan — gerçek bir danışman hemen dönüyor!",
    });
  }

  const history = (body.history ?? []).map((h) => ({ role: h.role, content: h.content }));

  try {
    let answer = "";
    if (hasAnthropic) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const res = await anthropic.messages.create({
        model: CHAT_MODEL,
        max_tokens: 600,
        system: systemPrompt(),
        messages: [...history, { role: "user" as const, content: body.message }],
      });
      answer = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    } else {
      const res = await orChat({
        model: defaultModel(),
        messages: [
          { role: "system", content: systemPrompt() },
          ...history,
          { role: "user", content: body.message },
        ],
        maxTokens: 600,
      });
      answer = (res.content ?? "").trim();
    }
    return NextResponse.json({ answer: answer || "Seni dinliyorum — ne için Antalya'dayız? 🌊" });
  } catch {
    return NextResponse.json({
      answer: "Küçük bir aksilik oldu. WhatsApp'tan yazarsan danışmanımız hemen yardımcı olur!",
    });
  }
}
