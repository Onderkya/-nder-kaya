import { NextResponse } from "next/server";
import { getProvider } from "@/lib/payments";
import { syncInvoiceStatus } from "@/lib/invoice";

export const dynamic = "force-dynamic";

/**
 * Ödeme sağlayıcısı webhook'u. Gövdeye körü körüne GÜVENMEYİZ: yalnızca
 * "şu sipariş değişti" sinyali olarak alır, durumu doğrudan sağlayıcı API'sinden
 * (syncInvoiceStatus → getStatus) otoriter biçimde teyit ederiz. İmza doğrulaması
 * ek bir güvence olarak loglanır ama tek dayanak değildir.
 */
export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!payload) return NextResponse.json({ ok: false }, { status: 400 });

  const provider = getProvider();
  const ref = provider.refFromWebhook(payload);
  if (!ref) return NextResponse.json({ ok: false }, { status: 400 });

  // İmza ipucu (eşleşmese bile aşağıdaki otoriter sorgu güvenliği sağlar).
  const signOk = provider.verifyWebhook(payload);
  if (!signOk) {
    console.warn(`[payments] webhook imza eşleşmedi (ref=${ref}); otoriter sorgu ile teyit edilecek.`);
  }

  await syncInvoiceStatus(ref).catch((e) => {
    console.error("[payments] webhook sync hatası:", e);
  });

  // Her durumda 200: sağlayıcı sonsuz yeniden denemesin (durum zaten DB'de güncel).
  return NextResponse.json({ ok: true });
}
