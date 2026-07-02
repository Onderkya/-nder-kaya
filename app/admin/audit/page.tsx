import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { Icon, type IconName } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

function actionLabel(action: string) {
  switch (action) {
    case "create":
      return "Oluşturma";
    case "update":
      return "Güncelleme";
    case "toggle":
      return "Durum değişimi";
    case "delete":
      return "Silme";
    default:
      return action;
  }
}

type Tone = "success" | "warn" | "danger" | "neutral";
function actionTone(action: string): Tone {
  switch (action) {
    case "create":
      return "success";
    case "delete":
      return "danger";
    case "update":
    case "toggle":
      return "warn";
    default:
      return "neutral";
  }
}

const ENTITY_ICON: Record<string, IconName> = {
  Sale: "wallet", Invoice: "invoice", PromoCode: "tag", PaymentMethod: "card",
  SiteText: "content", Page: "pages", Media: "image", User: "users",
  LessonType: "calendar", AvailabilitySlot: "calendar", Lead: "inbox", Setting: "settings",
};

export default async function AuditPage() {
  await requireAdmin();
  const entries = await prisma.auditLog
    .findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    .catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Denetim Kaydı"
        description="Son 100 hassas yönetim işlemi (en yeni üstte). Kim, ne zaman, neyi değiştirdi. Yalnızca görüntüleme amaçlıdır."
      />

      {entries.length === 0 ? (
        <EmptyState icon="log" title="Henüz denetim kaydı yok" description="Panelde yapılan hassas işlemler (ekleme, güncelleme, silme) burada listelenecek." />
      ) : (
        <Card pad={false}>
          <ul className="divide-y" style={{ borderColor: "rgb(var(--border))" }}>
            {entries.map((e) => (
              <li key={e.id} className="flex gap-3 px-4 py-4 sm:px-5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: "rgb(var(--muted))", color: "rgb(var(--muted-foreground))" }}>
                  <Icon name={ENTITY_ICON[e.entity] ?? "log"} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={actionTone(e.action)}>{actionLabel(e.action)}</Badge>
                    <span className="font-semibold text-[14px]" style={{ color: "rgb(var(--foreground))" }}>{e.entity}</span>
                    {e.entityId && <span className="adm-muted font-mono text-[11px]">{e.entityId}</span>}
                  </div>
                  <p className="adm-muted mt-1 text-[13.5px] leading-relaxed break-words">{e.details || "—"}</p>
                  <p className="adm-muted mt-1 text-[12px]">
                    <span className="font-medium" style={{ color: "rgb(var(--foreground))" }}>{e.actorEmail}</span>
                    {" · "}
                    {new Date(e.createdAt).toLocaleString("tr-TR")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
