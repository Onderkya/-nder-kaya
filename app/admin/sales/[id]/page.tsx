import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SaleForm } from "../sale-form";
import { updateSale } from "../actions";

export const dynamic = "force-dynamic";

const HOTELS = ["Cullinan Belek", "Maxx Royal Belek", "Regnum Carya", "Maxx Royal Kemer", "NG Phaselis Bay", "Lara Barut Collection", "Bayou Villas", "Land of Legends Kingdom"];

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await getTranslations("routes");

  const [sale, promos, payMethods] = await Promise.all([
    prisma.sale.findUnique({ where: { id } }),
    prisma.promoCode.findMany({ where: { active: true }, orderBy: { code: "asc" } }).catch(() => []),
    prisma.paymentMethod.findMany({ where: { active: true } }).catch(() => []),
  ]);
  if (!sale) notFound();

  const itemSuggestions = [...["r1_name", "r2_name", "r3_name", "r4_name", "r5_name"].map((k) => r(k)), ...HOTELS];
  const payRefs = payMethods.map((m) => m.address).filter((a): a is string => !!a);

  return (
    <div>
      <Link href="/admin/sales" className="text-sm text-cyan-700">← Satışlar</Link>
      <h1 className="mb-4 mt-1 text-2xl font-bold">Satışı düzenle</h1>
      <SaleForm action={updateSale} sale={sale} promos={promos.map((p) => p.code)} payRefs={payRefs} itemSuggestions={itemSuggestions} submitLabel="Değişiklikleri kaydet" />
    </div>
  );
}
