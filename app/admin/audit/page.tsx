import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

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

function actionClass(action: string) {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-700";
    case "delete":
      return "bg-red-100 text-red-700";
    case "update":
    case "toggle":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-200 text-slate-600";
  }
}

export default async function AuditPage() {
  await requireAdmin();
  const entries = await prisma.auditLog
    .findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    .catch(() => []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Denetim Kaydı</h1>
        <p className="text-sm text-slate-500">
          Son 100 hassas yönetim işlemi (en yeni üstte). Yalnızca görüntüleme amaçlıdır.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Zaman</th>
              <th className="p-3">İşlemi yapan</th>
              <th className="p-3">İşlem</th>
              <th className="p-3">Nesne</th>
              <th className="p-3">Ayrıntı</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 align-top">
                <td className="p-3 whitespace-nowrap text-slate-500">
                  {new Date(e.createdAt).toLocaleString("tr-TR")}
                </td>
                <td className="p-3">{e.actorEmail}</td>
                <td className="p-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${actionClass(e.action)}`}>
                    {actionLabel(e.action)}
                  </span>
                </td>
                <td className="p-3">
                  <span className="font-medium">{e.entity}</span>
                  {e.entityId && <span className="ml-1 font-mono text-xs text-slate-400">{e.entityId}</span>}
                </td>
                <td className="p-3 text-slate-600">{e.details || "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">Henüz denetim kaydı yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
