import { prisma } from "./db";

/**
 * İndirim kodu doğrulama + hesaplama. Şu ana dek yalnızca yönetimi vardı;
 * burada faturaya gerçekten uygulanır. Tutarlar en küçük birim (cent) cinsinden.
 *
 * AMOUNT türü: admin'in girdiği `value` ANA birim kabul edilir (ör. 5 = 5.00),
 * uygulanırken cent'e çevrilir. PERCENT türü: 0-100 arası yüzde.
 */

export type PromoResult =
  | { ok: true; discount: number; code: string }
  | { ok: false; reason: string };

export async function validatePromo(
  rawCode: string,
  service: string | null,
  amountMinor: number
): Promise<PromoResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "empty" };

  const promo = await prisma.promoCode.findUnique({ where: { code } }).catch(() => null);
  if (!promo || !promo.active) return { ok: false, reason: "invalid" };

  const now = new Date();
  if (promo.validFrom && promo.validFrom > now) return { ok: false, reason: "not_started" };
  if (promo.validUntil && promo.validUntil < now) return { ok: false, reason: "expired" };
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) {
    return { ok: false, reason: "used_up" };
  }
  if (promo.targetSlug && service && promo.targetSlug !== service) {
    return { ok: false, reason: "wrong_service" };
  }

  let discount =
    promo.type === "PERCENT"
      ? Math.floor((amountMinor * promo.value) / 100)
      : promo.value * 100; // AMOUNT: ana birim -> cent

  discount = Math.max(0, Math.min(discount, amountMinor)); // 0..tutar arası kıs
  return { ok: true, discount, code };
}

/**
 * Ödeme onaylandığında kullanım sayacını artırır. Limit, fatura oluşturulurken
 * zaten kontrol edilir; burada yalnızca sayacı ilerletiriz. Sessizce geçer.
 */
export async function consumePromo(code: string): Promise<void> {
  try {
    await prisma.promoCode.updateMany({
      where: { code: code.trim().toUpperCase() },
      data: { usedCount: { increment: 1 } },
    });
  } catch {
    /* sayaç güncellenemezse ödeme akışını bozma */
  }
}
