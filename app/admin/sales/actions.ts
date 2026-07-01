"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { parseAmountToMinor } from "@/lib/money";

type SaleData = {
  soldAt: Date;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerIdNo: string | null;
  customerCountry: string | null;
  service: string | null;
  itemName: string;
  amount: number;
  currency: string;
  promoCode: string | null;
  discountAmount: number;
  finalAmount: number;
  paymentType: string | null;
  paymentRef: string | null;
  status: string;
  paidAmount: number | null;
  note: string | null;
};

async function parseSale(formData: FormData): Promise<{ error?: string; data?: SaleData }> {
  const s = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v === "" ? null : v;
  };
  const amount = parseAmountToMinor(String(formData.get("amount") ?? ""));
  if (amount === null) return { error: "Geçerli bir tutar girin." };
  const currency = (s("currency") || "USD").toUpperCase();
  const promoCode = s("promoCode");

  // İndirim: manuel girildiyse o; yoksa seçilen koddan hesapla.
  let discountAmount = 0;
  const manualDisc = String(formData.get("discountAmount") ?? "").trim();
  if (manualDisc !== "") {
    const d = parseAmountToMinor(manualDisc);
    if (d === null) return { error: "İndirim tutarı geçersiz." };
    discountAmount = d;
  } else if (promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } }).catch(() => null);
    if (promo) discountAmount = promo.type === "PERCENT" ? Math.round((amount * promo.value) / 100) : promo.value * 100;
  }
  if (discountAmount > amount) discountAmount = amount;
  const finalAmount = amount - discountAmount;

  const paidRaw = String(formData.get("paidAmount") ?? "").trim();
  const paidAmount = paidRaw === "" ? null : parseAmountToMinor(paidRaw);
  const soldAtRaw = s("soldAt");

  return {
    data: {
      soldAt: soldAtRaw ? new Date(soldAtRaw) : new Date(),
      customerName: String(formData.get("customerName") ?? "").trim() || "—",
      customerPhone: s("customerPhone"),
      customerEmail: s("customerEmail"),
      customerIdNo: s("customerIdNo"),
      customerCountry: s("customerCountry"),
      service: s("service"),
      itemName: String(formData.get("itemName") ?? "").trim() || "—",
      amount,
      currency,
      promoCode,
      discountAmount,
      finalAmount,
      paymentType: s("paymentType"),
      paymentRef: s("paymentRef"),
      status: s("status") || "PAID",
      paidAmount,
      note: s("note"),
    },
  };
}

export async function createSale(formData: FormData) {
  const session = await requireAdmin();
  const p = await parseSale(formData);
  if (!p.data) redirect("/admin/sales?error=" + encodeURIComponent(p.error ?? "Hata"));
  const created = await prisma.sale.create({ data: p.data });
  await audit(session.email, "create", "Sale", created.id, `${p.data.customerName} · ${p.data.itemName} · ${p.data.finalAmount / 100} ${p.data.currency}`);
  revalidatePath("/admin/sales");
  redirect("/admin/sales?ok=1");
}

export async function updateSale(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const p = await parseSale(formData);
  if (!p.data) redirect(`/admin/sales/${id}?error=` + encodeURIComponent(p.error ?? "Hata"));
  await prisma.sale.update({ where: { id }, data: p.data });
  await audit(session.email, "update", "Sale", id, `${p.data.customerName} · ${p.data.itemName}`);
  revalidatePath("/admin/sales");
  redirect("/admin/sales?ok=1");
}

export async function deleteSale(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.sale.delete({ where: { id } });
  await audit(session.email, "delete", "Sale", id, "Satış silindi");
  revalidatePath("/admin/sales");
  redirect("/admin/sales?ok=1");
}
