import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";
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
    <div className="space-y-6">
      <Link href="/admin/sales" className="adm-muted inline-flex items-center gap-1.5 text-sm font-medium transition hover:opacity-80">
        <Icon name="chevron" size={16} className="rotate-90" /> Satışlar
      </Link>
      <PageHeader title="Satışı düzenle" description={`${sale.customerName} kaydını güncelle. Alanları düzenleyip aşağıdan kaydet.`} />
      <SaleForm action={updateSale} sale={sale} promos={promos.map((p) => p.code)} payRefs={payRefs} itemSuggestions={itemSuggestions} submitLabel="Değişiklikleri kaydet" />
    </div>
  );
}
