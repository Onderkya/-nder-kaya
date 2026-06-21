import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [leads, newLeads, promos, payments] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.promoCode.count({ where: { active: true } }),
    prisma.paymentMethod.count({ where: { active: true } }),
  ]).catch(() => [0, 0, 0, 0]);

  const cards = [
    { label: "Toplam talep", value: leads },
    { label: "Yeni talep", value: newLeads },
    { label: "Aktif indirim kodu", value: promos },
    { label: "Aktif ödeme yöntemi", value: payments },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Panel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-cyan-700">{c.value}</div>
            <div className="mt-1 text-sm text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-500">
        Hoş geldiniz. Soldaki menüden talepleri, indirim kodlarını ve ödeme
        yöntemlerini yönetebilirsiniz. İçerik (CMS) yönetimi bir sonraki fazda eklenecek.
      </p>
    </div>
  );
}
