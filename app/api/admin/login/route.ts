import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyCredentials, createSession } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  // Brute-force koruması: IP başına 15 dakikada 8 deneme.
  const ip = clientIp(req);
  const limit = rateLimit(`login:${ip}`, 8, 15 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited", retryAfter: limit.retryAfter }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await createSession(user);
  return NextResponse.json({ ok: true });
}
