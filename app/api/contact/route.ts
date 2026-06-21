import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { routing } from "@/i18n/routing";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  service: z.string().max(50).optional().or(z.literal("")),
  message: z.string().min(1).max(5000),
  locale: z.string().max(5).default("en"),
  // honeypot: botlar bu gizli alanı doldurur
  website: z.string().optional(),
});

export async function POST(req: Request) {
  // Spam/DoS koruması: IP başına dakikada 5 talep.
  const ip = clientIp(req);
  const limit = rateLimit(`contact:${ip}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation" }, { status: 400 });
  }
  const d = parsed.data;

  // Honeypot dolduysa bot'tur: sahte başarı dön (bilgi sızdırma).
  if (d.website && d.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Locale yalnızca desteklenen dillerden olabilir.
  const locale = (routing.locales as readonly string[]).includes(d.locale) ? d.locale : routing.defaultLocale;

  const lead = await prisma.lead.create({
    data: {
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      service: d.service || null,
      message: d.message,
      locale,
      channel: "WEB",
    },
  });

  // Sahibe bildirim (e-posta + Telegram); hata olsa da talep kaydedildi.
  await notifyOwner({
    title: "🌊 Yeni iletişim talebi",
    lines: [
      `Ad: ${d.name}`,
      `E-posta: ${d.email || "-"}`,
      `Telefon: ${d.phone || "-"}`,
      `Hizmet: ${d.service || "-"}`,
      `Dil: ${locale}`,
      `Mesaj: ${d.message}`,
    ],
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: lead.id });
}
