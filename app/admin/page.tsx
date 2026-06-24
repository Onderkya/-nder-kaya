import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [leads, newLeads, promos, payments, paidInvoices, pendingInvoices] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.promoCode.count({ where: { active: true } }),
    prisma.paymentMethod.count({ where: { active: true } }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "PENDING" } }),
  ]).catch(() => [0, 0, 0, 0, 0, 0]);

  const cards = [
    { label: "Toplam talep", value: leads },
    { label: "Yeni talep", value: newLeads },
    { label: "Aktif indirim kodu", value: promos },
    { label: "Aktif ödeme yöntemi", value: payments },
    { label: "Ödenen fatura", value: paidInvoices },
    { label: "Bekleyen fatura", value: pendingInvoices },
  ];

  const quickLinks = [
    { href: "/admin/content", label: "Site İçeriği" },
    { href: "/admin/leads", label: "Talepler" },
    { href: "/admin/booking", label: "Rezervasyon" },
    { href: "/admin/users", label: "Kullanıcılar" },
    { href: "/admin/audit", label: "Denetim" },
    { href: "/admin/ai", label: "AI Asistan" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Panel</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="text-3xl font-bold text-cyan-700">{c.value}</div>
            <div className="mt-1 text-sm text-slate-500">{c.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-500">Hızlı erişim</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium shadow-sm hover:border-cyan-300 hover:bg-cyan-50"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        Hoş geldiniz. Soldaki menüden site içeriğini, medyayı, talepleri,
        rezervasyonları, indirim kodlarını, ödeme yöntemlerini, bot sohbetlerini, AI
        asistanı, kullanıcıları ve denetim kaydını yönetebilirsiniz.
      </p>
    </div>
  );
}
