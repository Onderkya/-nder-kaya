import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { runWrite, readwriteDbAvailable } from "@/lib/ai/db-write";

export const dynamic = "force-dynamic";

const schema = z.object({ sql: z.string().min(1).max(4000) });

/**
 * AI'ın önerdiği bir INSERT/UPDATE'i yönetici ONAYLADIKTAN sonra uygular.
 * Yazma yalnızca burada gerçekleşir; doğrulama + salt-yazma rolü silmeyi engeller.
 */
export async function POST(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = clientIp(req);
  const limit = rateLimit(`ai-apply:${session.uid}:${ip}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "rate_limited", retryAfter: limit.retryAfter }, { status: 429 });
  }

  if (!readwriteDbAvailable()) {
    return NextResponse.json({ error: "write_disabled" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const result = await runWrite(parsed.data.sql);

  // Onaylanan her yazma denetim kaydına geçer (başarılı/başarısız).
  await audit(
    session.email,
    "ai_write_apply",
    "Assistant",
    null,
    `${result.ok ? `OK affected=${result.affected}` : `FAIL ${result.error}`} sql="${parsed.data.sql.slice(0, 300)}"`
  );

  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, affected: result.affected });
}
