import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  service: z.string().max(50).optional().or(z.literal("")),
  message: z.string().min(1).max(5000),
  locale: z.string().max(5).default("en"),
  // honeypot
  website: z.string().max(0).optional(),
});

export async function POST(req: Request) {
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

  const lead = await prisma.lead.create({
    data: {
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      service: d.service || null,
      message: d.message,
      locale: d.locale,
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
      `Dil: ${d.locale}`,
      `Mesaj: ${d.message}`,
    ],
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: lead.id });
}
