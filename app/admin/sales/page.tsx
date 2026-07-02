import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAmount, minorToDecimal } from "@/lib/money";
import { PageHeader, Card, StatCard, Section, Badge, EmptyState } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";
import { SaleForm } from "./sale-form";
import { createSale, deleteSale } from "./actions";

export const dynamic = "force-dynamic";

const HOTELS = ["Cullinan Belek", "Maxx Royal Belek", "Regnum Carya", "Maxx Royal Kemer", "NG Phaselis Bay", "Lara Barut Collection", "Bayou Villas", "Land of Legends Kingdom"];
const STATUS_LABEL: Record<string, string> = { PAID: "Ödendi", PENDING: "Bekliyor", PARTIAL: "Kısmi" };
const STATUS_TONE: Record<string, "success" | "warn" | "neutral"> = { PAID: "success", PENDING: "warn", PARTIAL: "warn" };
const statusBadge = (st: string) => <Badge tone={STATUS_TONE[st] ?? "neutral"}>{STATUS_LABEL[st] ?? st}</Badge>;

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
  const revenueRows = [...revenue.entries()];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Satışlar"
        description="Elle satış/sipariş defteri: kime, ne sattın, ne kadar, indirim ve nasıl ödendi. Her kayıt düzenlenebilir."
      />

      {sp.ok && <Card className="!py-3 !text-[14px]" ><span style={{ color: "rgb(var(--primary))" }}>✓ Kaydedildi.</span></Card>}
      {sp.error && <Card className="!py-3 !text-[14px]"><span style={{ color: "rgb(var(--accent))" }}>⚠️ {sp.error}</span></Card>}

      {/* Ciro özeti */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Kayıt" value={sales.length} hint="toplam satış" icon="wallet" />
        {revenueRows.map(([cur, minor]) => (
          <StatCard key={cur} label={`Tahsilat · ${cur}`} value={`${minorToDecimal(minor)} ${cur}`} hint="ödenen tutar" icon="card" tone="success" />
        ))}
      </div>

      {/* Yeni satış */}
      <Section title="Yeni satış ekle" description="Yeni bir satışı deftere işle." icon="plus" defaultOpen={sales.length === 0}>
        <SaleForm action={createSale} promos={promos.map((p) => p.code)} payRefs={payRefs} itemSuggestions={itemSuggestions} submitLabel="Satışı kaydet" />
      </Section>

      {/* Liste */}
      {sales.length === 0 ? (
        <EmptyState icon="wallet" title="Henüz satış yok" description="İlk satışını yukarıdaki “Yeni satış ekle” bölümünden deftere işleyebilirsin." />
      ) : (
        <>
          {/* Mobil kartlar */}
          <div className="space-y-3 sm:hidden">
            {sales.map((s) => (
              <Card key={s.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold" style={{ color: "rgb(var(--foreground))" }}>{s.customerName}</p>
                    <p className="adm-muted text-xs">{[s.customerPhone, s.customerCountry].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                  {statusBadge(s.status)}
                </div>
                <dl className="mt-3 space-y-2 text-[13.5px]">
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Ürün</dt>
                    <dd className="text-right" style={{ color: "rgb(var(--foreground))" }}>{s.itemName}{s.service ? <span className="adm-muted"> · {s.service}</span> : null}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Tutar</dt>
                    <dd>{formatAmount(s.amount, s.currency)}</dd>
                  </div>
                  {s.discountAmount ? (
                    <div className="flex justify-between gap-3">
                      <dt className="adm-muted text-xs">İndirim</dt>
                      <dd className="adm-muted">−{minorToDecimal(s.discountAmount)}{s.promoCode ? ` (${s.promoCode})` : ""}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Net</dt>
                    <dd className="font-semibold">{formatAmount(s.finalAmount, s.currency)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Ödeme</dt>
                    <dd className="text-right">{s.paymentType ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Tarih</dt>
                    <dd className="adm-muted">{new Date(s.soldAt).toLocaleDateString("tr-TR")}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{ borderColor: "rgb(var(--border))" }}>
                  <Link href={`/admin/sales/${s.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">Düzenle</Link>
                  <form action={deleteSale}><input type="hidden" name="id" value={s.id} /><button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button></form>
                </div>
              </Card>
            ))}
          </div>

          {/* Masaüstü tablo */}
          <Card pad={false} className="hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="adm-muted text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid rgb(var(--border))" }}>
                  <th className="px-4 py-3 font-semibold">Tarih</th>
                  <th className="px-4 py-3 font-semibold">Müşteri</th>
                  <th className="px-4 py-3 font-semibold">Ürün</th>
                  <th className="px-4 py-3 font-semibold">Tutar</th>
                  <th className="px-4 py-3 font-semibold">İndirim</th>
                  <th className="px-4 py-3 font-semibold">Net</th>
                  <th className="px-4 py-3 font-semibold">Ödeme</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="align-top" style={{ borderTop: "1px solid rgb(var(--border))" }}>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{new Date(s.soldAt).toLocaleDateString("tr-TR")}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium" style={{ color: "rgb(var(--foreground))" }}>{s.customerName}</div>
                      <div className="adm-muted text-xs">{[s.customerPhone, s.customerCountry].filter(Boolean).join(" · ")}</div>
                    </td>
                    <td className="px-4 py-3">{s.itemName}<div className="adm-muted text-xs">{s.service ?? ""}</div></td>
                    <td className="whitespace-nowrap px-4 py-3">{formatAmount(s.amount, s.currency)}</td>
                    <td className="adm-muted whitespace-nowrap px-4 py-3">{s.discountAmount ? `−${minorToDecimal(s.discountAmount)}${s.promoCode ? ` (${s.promoCode})` : ""}` : "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatAmount(s.finalAmount, s.currency)}</td>
                    <td className="px-4 py-3 text-xs">{s.paymentType ?? "—"}{s.paymentRef ? <div className="adm-muted max-w-[10rem] truncate font-mono" title={s.paymentRef}>{s.paymentRef}</div> : null}</td>
                    <td className="px-4 py-3">{statusBadge(s.status)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/sales/${s.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">Düzenle</Link>
                        <form action={deleteSale}><input type="hidden" name="id" value={s.id} /><button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button></form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
