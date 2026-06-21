import { NextResponse } from "next/server";
import { syncInvoiceStatus } from "@/lib/invoice";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Ödeme sayfasının yoklama (polling) ucu. Webhook gelmese bile, müşteri sayfada
 * beklerken durumu sağlayıcıdan otoriter biçimde tazeler. Webhook + bu uç birlikte
 * "arka plan worker'ı yok" sorununu çözer.
 */
export async function GET(req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const ip = clientIp(req);
  const limit = await rateLimit(`paystatus:${ip}`, 60, 60_000);
  if (!limit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const invoice = await syncInvoiceStatus(ref).catch(() => null);
  if (!invoice) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    status: invoice.status,
    payNetwork: invoice.payNetwork,
    payCurrency: invoice.payCurrency,
    txid: invoice.txid,
  });
}
