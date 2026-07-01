import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAmount, minorToDecimal } from "@/lib/money";
import { SaleForm } from "./sale-form";
import { createSale, deleteSale } from "./actions";

export const dynamic = "force-dynamic";

const HOTELS = ["Cullinan Belek", "Maxx Royal Belek", "Regnum Carya", "Maxx Royal Kemer", "NG Phaselis Bay", "Lara Barut Collection", "Bayou Villas", "Land of Legends Kingdom"];
const STATUS_LABEL: Record<string, string> = { PAID: "Ödendi", PENDING: "Bekliyor", PARTIAL: "Kısmi" };
const STATUS_CLS: Record<string, string> = { PAID: "bg-emerald-100 text-emerald-700", PENDING: "bg-amber-100 text-amber-700", PARTIAL: "bg-blue-100 text-blue-700" };

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const r = await getTranslations("routes");

  const [sales, promos, payMethods] = await Promise.all([
    prisma.sale.findMany({ orderBy: { soldAt: "desc" }, take: 500 }),
    prisma.promoCode.findMany({ where: { active: true }, orderBy: { code: "asc" } }).catch(() => []),
    prisma.paymentMethod.findMany({ where: { active: true } }).catch(() => []),
  ]);

  const routeNames = ["r1_name", "r2_name", "r3_name", "r4_name", "r5_name"].map((k) => r(k));
  const itemSuggestions = [...routeNames, ...HOTELS];
  const payRefs = payMethods.map((m) => m.address).filter((a): a is string => !!a);

  // Ciro özeti — para birimi bazında net toplam (yalnız PAID + PARTIAL ödenen).
  const revenue = new Map<string, number>();
  for (const s of sales) {
    const val = s.status === "PARTIAL" ? (s.paidAmount ?? 0) : s.status === "PAID" ? s.finalAmount : 0;
    revenue.set(s.currency, (revenue.get(s.currency) ?? 0) + val);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Satışlar</h1>
          <p className="mt-1 text-sm text-slate-500">Elle satış/sipariş kaydı: kime, ne, ücret, indirim, nasıl ödendi. Hepsi düzenlenebilir.</p>
        </div>
      </div>

      {sp.ok && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">Kaydedildi.</p>}
      {sp.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{sp.error}</p>}

      {/* Ciro özeti */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <div className="text-xs text-slate-500">Kayıt</div>
          <div className="text-2xl font-bold">{sales.length}</div>
        </div>
        {[...revenue.entries()].map(([cur, minor]) => (
          <div key={cur} className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <div className="text-xs text-slate-500">Tahsilat ({cur})</div>
            <div className="text-2xl font-bold text-emerald-700">{minorToDecimal(minor)} {cur}</div>
          </div>
        ))}
      </div>

      {/* Yeni satış */}
      <details className="mb-8" open={sales.length === 0}>
        <summary className="mb-3 cursor-pointer text-sm font-semibold text-cyan-700">+ Yeni satış ekle</summary>
        <SaleForm action={createSale} promos={promos.map((p) => p.code)} payRefs={payRefs} itemSuggestions={itemSuggestions} submitLabel="Satışı kaydet" />
      </details>

      {/* Liste */}
      <section className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Tarih</th>
              <th className="px-4 py-3">Müşteri</th>
              <th className="px-4 py-3">Ürün</th>
              <th className="px-4 py-3">Tutar</th>
              <th className="px-4 py-3">İndirim</th>
              <th className="px-4 py-3">Net</th>
              <th className="px-4 py-3">Ödeme</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} className="border-t border-slate-100 align-top">
                <td className="whitespace-nowrap px-4 py-3 text-xs">{new Date(s.soldAt).toLocaleDateString("tr-TR")}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{s.customerName}</div>
                  <div className="text-xs text-slate-400">{[s.customerPhone, s.customerCountry].filter(Boolean).join(" · ")}</div>
                </td>
                <td className="px-4 py-3">{s.itemName}<div className="text-xs text-slate-400">{s.service ?? ""}</div></td>
                <td className="whitespace-nowrap px-4 py-3">{formatAmount(s.amount, s.currency)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{s.discountAmount ? `−${minorToDecimal(s.discountAmount)}${s.promoCode ? ` (${s.promoCode})` : ""}` : "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatAmount(s.finalAmount, s.currency)}</td>
                <td className="px-4 py-3 text-xs">{s.paymentType ?? "—"}{s.paymentRef ? <div className="max-w-[10rem] truncate font-mono text-slate-400" title={s.paymentRef}>{s.paymentRef}</div> : null}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLS[s.status] ?? "bg-slate-100 text-slate-600"}`}>{STATUS_LABEL[s.status] ?? s.status}</span></td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link href={`/admin/sales/${s.id}`} className="font-semibold text-cyan-700">Düzenle</Link>
                  <form action={deleteSale} className="mt-1"><input type="hidden" name="id" value={s.id} /><button className="text-xs text-red-500 hover:underline">Sil</button></form>
                </td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">Henüz satış yok. Yukarıdan ekleyin.</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
