import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyOwner, notifyCustomer } from "@/lib/notify";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

const schema = z.object({
  slotId: z.string().min(1),
  name: z.string().min(1).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(50).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  locale: z.string().max(5).default("en"),
  website: z.string().optional(), // honeypot
  turnstileToken: z.string().optional(), // Cloudflare Turnstile
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = await rateLimit(`booking:${ip}`, 5, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation" }, { status: 400 });
  const d = parsed.data;

  // Honeypot dolduysa bot: sahte başarı.
  if (d.website && d.website.length > 0) return NextResponse.json({ ok: true });
  // Captcha doğrulaması (Turnstile anahtarı tanımlı değilse otomatik geçer).
  if (!(await verifyTurnstile(d.turnstileToken, ip))) {
    return NextResponse.json({ error: "captcha" }, { status: 400 });
  }
  // En az bir iletişim yolu olmalı.
  if (!d.email && !d.phone) return NextResponse.json({ error: "validation" }, { status: 400 });

  const locale = (routing.locales as readonly string[]).includes(d.locale) ? d.locale : routing.defaultLocale;

  // Slotu atomik biçimde "dolu" işaretle: yalnızca hâlâ boşsa güncelle.
  const claimed = await prisma.availabilitySlot.updateMany({
    where: { id: d.slotId, booked: false },
    data: { booked: true },
  });
  if (claimed.count === 0) {
    return NextResponse.json({ error: "slot_taken" }, { status: 409 });
  }

  const slot = await prisma.availabilitySlot.findUnique({ where: { id: d.slotId } });
  const when = slot ? slot.startsAt.toISOString() : d.slotId;
  const mins = slot?.minutes ?? "";

  const lead = await prisma.lead.create({
    data: {
      name: d.name,
      email: d.email || null,
      phone: d.phone || null,
      service: "lessons",
      message: `Randevu talebi: ${when} (${mins} dk).${d.message ? `\nNot: ${d.message}` : ""}`,
      locale,
      channel: "WEB",
    },
  });

  await notifyOwner({
    title: "🗓️ Yeni randevu talebi",
    lines: [
      `Ad: ${d.name}`,
      `E-posta: ${d.email || "-"}`,
      `Telefon: ${d.phone || "-"}`,
      `Slot: ${when} (${mins} dk)`,
      `Not: ${d.message || "-"}`,
    ],
  }).catch(() => {});

  if (d.email) await notifyCustomer(d.email, locale, "booking", d.name).catch(() => {});

  return NextResponse.json({ ok: true, id: lead.id });
}
