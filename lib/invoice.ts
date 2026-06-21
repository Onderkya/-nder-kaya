import { randomBytes } from "node:crypto";
import type { Invoice } from "@prisma/client";
import { prisma } from "./db";
import { getProvider } from "./payments";
import { minorToDecimal, formatAmount } from "./money";
import { notifyOwner, notifyCustomer } from "./notify";
import { consumePromo } from "./promo";
import type { NormalizedStatus } from "./payments/types";

/** Karışması zor, insan-okur kısa referans: AB-XXXXXX (Crockford base32, 0/O/1/I yok). */
export function generateRef(): string {
  const alphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = randomBytes(6);
  let out = "";
  for (let i = 0; i < 6; i++) out += alphabet[bytes[i] % alphabet.length];
  return `AB-${out}`;
}

export type CreateInvoiceInput = {
  amount: number; // final, en küçük birim (cent)
  currency: string;
  description: string;
  promoCode?: string | null;
  discountAmount?: number;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  locale?: string;
  service?: string | null;
  lessonTypeId?: string | null;
  leadId?: string | null;
  lifetimeSeconds?: number;
};

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Fatura oluşturur ve sağlayıcıda barındırılan ödeme sayfasını hazırlar. */
export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const provider = getProvider();
  if (!provider.isConfigured()) {
    throw new Error("Ödeme sağlayıcısı yapılandırılmadı.");
  }

  const locale = input.locale || "en";
  const ref = await uniqueRef();

  // Önce PENDING kaydı oluştur (sağlayıcı çağrısı başarısız olsa bile iz kalır).
  const invoice = await prisma.invoice.create({
    data: {
      ref,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      promoCode: input.promoCode || null,
      discountAmount: input.discountAmount ?? 0,
      customerName: input.customerName || null,
      customerEmail: input.customerEmail || null,
      customerPhone: input.customerPhone || null,
      locale,
      service: input.service || null,
      lessonTypeId: input.lessonTypeId || null,
      leadId: input.leadId || null,
      provider: provider.name,
    },
  });

  const created = await provider.createPayment({
    ref,
    amount: minorToDecimal(input.amount),
    currency: input.currency,
    description: input.description,
    returnUrl: `${siteUrl()}/${locale}/pay/${ref}`,
    callbackUrl: `${siteUrl()}/api/payments/webhook`,
    lifetimeSeconds: input.lifetimeSeconds,
  });

  return prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      providerId: created.providerId,
      payUrl: created.payUrl,
      expiresAt: created.expiresAt ?? null,
    },
  });
}

async function uniqueRef(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const ref = generateRef();
    const exists = await prisma.invoice.findUnique({ where: { ref } });
    if (!exists) return ref;
  }
  // Aşırı düşük olasılık: zaman damgalı ek.
  return `${generateRef()}${Date.now().toString(36).slice(-3).toUpperCase()}`;
}

const TERMINAL: ReadonlyArray<Invoice["status"]> = ["PAID", "CANCELLED", "FAILED"];

/**
 * Faturanın durumunu sağlayıcıdan OTORİTER biçimde senkronlar. Webhook ve
 * sayfa-yoklaması (polling) bunu çağırır — ikisi de aynı sonucu verir.
 * PAID'e ilk geçişte idempotent biçimde bildirim atar ve promo sayacını işler.
 */
export async function syncInvoiceStatus(ref: string): Promise<Invoice | null> {
  const invoice = await prisma.invoice.findUnique({ where: { ref } });
  if (!invoice) return null;
  if (TERMINAL.includes(invoice.status)) return invoice;

  // Süre dolmuş ve hâlâ beklemede ise yerel olarak EXPIRED işaretle.
  if (invoice.expiresAt && invoice.expiresAt < new Date() && invoice.status === "PENDING") {
    // Yine de sağlayıcıya sor: belki son anda ödendi.
  }

  if (!invoice.providerId) return invoice; // sağlayıcı çağrısı tamamlanmamış

  let status: NormalizedStatus;
  try {
    status = await getProvider().getStatus(invoice.providerId, ref);
  } catch {
    return invoice; // geçici hata: durumu değiştirme
  }

  if (status.state === "paid") {
    return markPaid(invoice, status);
  }
  if (status.state === "underpaid") {
    return prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "UNDERPAID", paidAmount: status.paidAmount, payCurrency: status.payCurrency, payNetwork: status.payNetwork, txid: status.txid },
    });
  }
  if (status.state === "failed") {
    return prisma.invoice.update({ where: { id: invoice.id }, data: { status: "FAILED" } });
  }
  if (status.state === "expired") {
    return prisma.invoice.update({ where: { id: invoice.id }, data: { status: "EXPIRED" } });
  }
  return invoice; // pending
}

/** PAID'e idempotent geçiş: yalnızca ilk geçişte bildirim + promo işlenir. */
async function markPaid(invoice: Invoice, status: NormalizedStatus): Promise<Invoice> {
  // Atomik: yalnızca PAID değilse güncelle. count>0 ise bu çağrı "ilk" geçiştir.
  const claimed = await prisma.invoice.updateMany({
    where: { id: invoice.id, status: { not: "PAID" } },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paidAmount: status.paidAmount,
      payCurrency: status.payCurrency,
      payNetwork: status.payNetwork,
      txid: status.txid,
    },
  });

  const updated = await prisma.invoice.findUnique({ where: { id: invoice.id } });
  if (claimed.count > 0) {
    // İlk kez ödendi → bildirim + promo sayacı (akışı bozmadan).
    await notifyOwner({
      title: "💰 Ödeme alındı",
      lines: [
        `Referans: ${invoice.ref}`,
        `Tutar: ${formatAmount(invoice.amount, invoice.currency)}`,
        `Ödenen: ${status.paidAmount ?? "?"} ${status.payCurrency ?? ""} (${status.payNetwork ?? "?"})`,
        `Müşteri: ${invoice.customerName || "-"}`,
        `E-posta: ${invoice.customerEmail || "-"}`,
        `Açıklama: ${invoice.description}`,
        status.txid ? `TXID: ${status.txid}` : "",
      ].filter(Boolean),
    }).catch(() => {});

    if (invoice.customerEmail) {
      await notifyCustomer(invoice.customerEmail, invoice.locale, "payment", invoice.customerName || "").catch(() => {});
    }
    if (invoice.promoCode) await consumePromo(invoice.promoCode);
  }
  return updated ?? invoice;
}
