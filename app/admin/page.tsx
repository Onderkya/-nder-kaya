import Link from "next/link";
import { prisma } from "@/lib/db";
import { getPublicSettings } from "@/lib/settings";
import { formatAmount } from "@/lib/money";
import { PageHeader, Card, StatCard, EmptyState } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/admin/icons";
import { DashboardAiCard } from "@/components/admin/dashboard-ai-card";
import { assistantAvailable } from "@/lib/ai/assistant";

export const dynamic = "force-dynamic";

const timeAgo = (d: Date) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "az önce";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.floor(h / 24)} gün önce`;
};

const ACTION_TR: Record<string, string> = { create: "ekledi", update: "güncelledi", toggle: "değiştirdi", delete: "sildi" };
const ENTITY_ICON: Record<string, IconName> = { Sale: "wallet", Invoice: "invoice", PromoCode: "tag", PaymentMethod: "card", SiteText: "content", Page: "pages", Media: "image", User: "users", LessonType: "calendar", AvailabilitySlot: "calendar", Lead: "inbox", Setting: "settings" };

export default async function AdminDashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const aiAvailable = await assistantAvailable().catch(() => false);

  let newLeads = 0, pendingInvoices = 0, upcomingBookings = 0;
  let salesAgg: { currency: string; _sum: { finalAmount: number | null }; _count: number }[] = [];
  let recent: { id: string; actorEmail: string; action: string; entity: string; createdAt: Date }[] = [];
  let siteUrl = "/";

  try {
    [newLeads, pendingInvoices, upcomingBookings, salesAgg, recent, siteUrl] = await Promise.all([
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.invoice.count({ where: { status: "PENDING" } }),
      prisma.availabilitySlot.count({ where: { booked: true, startsAt: { gt: now } } }),
      prisma.sale.groupBy({ by: ["currency"], where: { soldAt: { gte: monthStart } }, _sum: { finalAmount: true }, _count: true }) as never,
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, actorEmail: true, action: true, entity: true, createdAt: true } }),
      getPublicSettings().then((s) => s.url || "/"),
    ]);
  } catch {
    /* DB yoksa (build) sessizce boş panel */
  }

  // Bu ay ciro: en yüksek toplamlı para birimini öne çıkar.
  const topCur = [...salesAgg].sort((a, b) => (b._sum.finalAmount ?? 0) - (a._sum.finalAmount ?? 0))[0];
  const salesCount = salesAgg.reduce((n, r) => n + r._count, 0);
  const revenue = topCur ? formatAmount(topCur._sum.finalAmount ?? 0, topCur.currency) : "—";

  const attention: { icon: IconName; text: string; href: string }[] = [];
  if (newLeads > 0) attention.push({ icon: "inbox", text: `${newLeads} yeni talep yanıt bekliyor`, href: "/admin/leads" });
  if (pendingInvoices > 0) attention.push({ icon: "invoice", text: `${pendingInvoices} fatura ödeme bekliyor`, href: "/admin/invoices" });
  if (upcomingBookings > 0) attention.push({ icon: "calendar", text: `${upcomingBookings} yaklaşan ders/rezervasyon`, href: "/admin/booking" });

  const quick: { icon: IconName; label: string; href: string; external?: boolean }[] = [
    { icon: "upload", label: "Görsel yükle", href: "/admin/media" },
    { icon: "content", label: "İçeriği düzenle", href: "/admin/content" },
    { icon: "plus", label: "Satış ekle", href: "/admin/sales" },
    { icon: "external", label: "Siteyi gör", href: siteUrl, external: true },
  ];

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Yönetim Paneli" title="Merhaba 👋" description="İşletmenin bugünkü özeti. Soldaki menüden her şeyi yönetebilirsin." />

      {/* 1 — Dikkat gerektirenler */}
      <Card featured>
        <div className="mb-3 flex items-center gap-2">
          <Icon name="bolt" size={18} style={{ color: "rgb(var(--gold))" }} />
          <h2 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>Bugün ne yapmalıyım?</h2>
        </div>
        {attention.length === 0 ? (
          <div className="flex items-center gap-3 py-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgb(var(--primary) / 0.12)", color: "rgb(var(--primary))" }}><Icon name="check" size={20} /></span>
            <p className="adm-muted text-[14.5px]">Her şey yolunda ☀️ — bekleyen bir iş yok.</p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
            {attention.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="flex items-center gap-3 py-3 transition hover:opacity-80">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: "rgb(var(--gold) / 0.14)", color: "rgb(var(--gold))" }}><Icon name={a.icon} size={19} /></span>
                  <span className="flex-1 text-[14.5px] font-medium" style={{ color: "rgb(var(--foreground))" }}>{a.text}</span>
                  <Icon name="chevron" size={18} className="adm-muted -rotate-90" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 2 — Metrikler */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Bu ay ciro" value={revenue} hint={`${salesCount} satış`} icon="wallet" tone="success" />
        <StatCard label="Yeni talep" value={newLeads} hint="yanıt bekliyor" icon="inbox" tone={newLeads > 0 ? "warn" : "neutral"} />
        <StatCard label="Yaklaşan rezervasyon" value={upcomingBookings} hint="onaylı" icon="calendar" />
        <StatCard label="Bekleyen fatura" value={pendingInvoices} hint="ödeme bekliyor" icon="invoice" tone={pendingInvoices > 0 ? "warn" : "neutral"} />
      </div>

      {/* 2.5 — AI asistan kartı */}
      <DashboardAiCard available={aiAvailable} />

      {/* 3 — Hızlı işlemler */}
      <div>
        <h2 className="adm-eyebrow mb-3">Hızlı işlemler</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quick.map((q) =>
            q.external ? (
              <a key={q.label} href={q.href} target="_blank" rel="noopener" className="adm-card adm-card-pad flex flex-col items-center gap-2.5 text-center transition hover:-translate-y-0.5">
                <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}><Icon name={q.icon} size={20} /></span>
                <span className="text-[13.5px] font-semibold" style={{ color: "rgb(var(--foreground))" }}>{q.label}</span>
              </a>
            ) : (
              <Link key={q.label} href={q.href} className="adm-card adm-card-pad flex flex-col items-center gap-2.5 text-center transition hover:-translate-y-0.5">
                <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--primary))" }}><Icon name={q.icon} size={20} /></span>
                <span className="text-[13.5px] font-semibold" style={{ color: "rgb(var(--foreground))" }}>{q.label}</span>
              </Link>
            ),
          )}
        </div>
      </div>

      {/* 4 — Son hareketler */}
      <div>
        <h2 className="adm-eyebrow mb-3">Son hareketler</h2>
        <Card pad={false}>
          {recent.length === 0 ? (
            <div className="p-4"><EmptyState icon="log" title="Henüz hareket yok" description="Panelde yaptığın her işlem burada görünecek." /></div>
          ) : (
            <ul className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
              {recent.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))" }}><Icon name={ENTITY_ICON[r.entity] ?? "log"} size={16} /></span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px]" style={{ color: "rgb(var(--foreground))" }}>
                    <span className="font-medium">{r.actorEmail}</span> <span className="adm-muted">{r.entity} kaydını {ACTION_TR[r.action] ?? r.action}</span>
                  </span>
                  <span className="adm-muted shrink-0 text-[12px]">{timeAgo(r.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
