import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { decryptPII } from "@/lib/pii";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const statuses: LeadStatus[] = ["NEW", "CONTACTED", "CONFIRMED", "DONE", "ARCHIVED"];

const STATUS_TONE: Record<LeadStatus, "neutral" | "success" | "warn" | "danger"> = {
  NEW: "warn",
  CONTACTED: "neutral",
  CONFIRMED: "success",
  DONE: "success",
  ARCHIVED: "neutral",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: "Yeni",
  CONTACTED: "İletişime geçildi",
  CONFIRMED: "Onaylandı",
  DONE: "Tamamlandı",
  ARCHIVED: "Arşiv",
};

async function updateStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as LeadStatus;
  if (!statuses.includes(status)) return;
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
}

export default async function LeadsPage() {
  await requireAdmin();
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 200 }).catch(() => []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talepler"
        description="İletişim formundan ve bottan gelen mesajlar. Her talebin durumunu buradan güncelleyebilirsin."
      />

      {leads.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Henüz talep yok"
          description="Müşteriler formdan yazınca burada görünür."
        />
      ) : (
        <>
          {/* Mobil — kartlar */}
          <div className="space-y-3 sm:hidden">
            {leads.map((l) => (
              <Card key={l.id}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{l.name}</p>
                  <Badge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge>
                </div>
                <dl className="space-y-1.5 text-[13.5px]">
                  <div className="flex gap-2">
                    <dt className="adm-muted w-24 shrink-0 text-xs">İletişim</dt>
                    <dd style={{ color: "rgb(var(--foreground))" }}>
                      <div>{decryptPII(l.email) || "-"}</div>
                      {decryptPII(l.phone) ? <div>{decryptPII(l.phone)}</div> : null}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="adm-muted w-24 shrink-0 text-xs">Hizmet</dt>
                    <dd style={{ color: "rgb(var(--foreground))" }}>{l.service || "-"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="adm-muted w-24 shrink-0 text-xs">Tarih</dt>
                    <dd style={{ color: "rgb(var(--foreground))" }}>{l.createdAt.toLocaleDateString("tr-TR")}</dd>
                  </div>
                  {l.message ? (
                    <div className="flex gap-2">
                      <dt className="adm-muted w-24 shrink-0 text-xs">Mesaj</dt>
                      <dd className="whitespace-pre-wrap" style={{ color: "rgb(var(--foreground))" }}>{l.message}</dd>
                    </div>
                  ) : null}
                </dl>
                <form action={updateStatus} className="mt-3 flex items-center gap-2">
                  <input type="hidden" name="id" value={l.id} />
                  <select name="status" defaultValue={l.status} className="adm-select flex-1">
                    {statuses.map((s) => (
                      <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  <button className="adm-btn adm-btn-primary adm-btn-sm">Kaydet</button>
                </form>
              </Card>
            ))}
          </div>

          {/* Masaüstü — tablo */}
          <Card pad={false} className="hidden sm:block">
            <table className="hidden w-full text-left text-sm sm:table">
              <thead>
                <tr className="adm-muted border-b text-xs uppercase tracking-wide" style={{ borderColor: "rgb(var(--border))" }}>
                  <th className="px-5 py-3 font-semibold">Tarih</th>
                  <th className="px-5 py-3 font-semibold">Ad</th>
                  <th className="px-5 py-3 font-semibold">İletişim</th>
                  <th className="px-5 py-3 font-semibold">Hizmet</th>
                  <th className="px-5 py-3 font-semibold">Mesaj</th>
                  <th className="px-5 py-3 font-semibold">Durum</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-b align-top last:border-0" style={{ borderColor: "rgb(var(--border))" }}>
                    <td className="adm-muted whitespace-nowrap px-5 py-3">{l.createdAt.toLocaleDateString("tr-TR")}</td>
                    <td className="px-5 py-3 font-medium" style={{ color: "rgb(var(--foreground))" }}>{l.name}</td>
                    <td className="adm-muted px-5 py-3">
                      <div>{decryptPII(l.email) || "-"}</div>
                      <div>{decryptPII(l.phone) || ""}</div>
                    </td>
                    <td className="px-5 py-3" style={{ color: "rgb(var(--foreground))" }}>{l.service || "-"}</td>
                    <td className="adm-muted max-w-xs whitespace-pre-wrap px-5 py-3">{l.message}</td>
                    <td className="px-5 py-3">
                      <div className="mb-2"><Badge tone={STATUS_TONE[l.status]}>{STATUS_LABEL[l.status]}</Badge></div>
                      <form action={updateStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={l.id} />
                        <select name="status" defaultValue={l.status} className="adm-select">
                          {statuses.map((s) => (
                            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                        <button className="adm-btn adm-btn-primary adm-btn-sm">Kaydet</button>
                      </form>
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
