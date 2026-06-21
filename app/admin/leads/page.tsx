import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { LeadStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const statuses: LeadStatus[] = ["NEW", "CONTACTED", "CONFIRMED", "DONE", "ARCHIVED"];

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
    <div>
      <h1 className="mb-6 text-2xl font-bold">Talepler</h1>
      {leads.length === 0 ? (
        <p className="text-slate-500">Henüz talep yok.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-3">Tarih</th>
                <th className="p-3">Ad</th>
                <th className="p-3">İletişim</th>
                <th className="p-3">Hizmet</th>
                <th className="p-3">Mesaj</th>
                <th className="p-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 align-top">
                  <td className="whitespace-nowrap p-3 text-slate-500">{l.createdAt.toLocaleDateString("tr-TR")}</td>
                  <td className="p-3 font-medium">{l.name}</td>
                  <td className="p-3 text-slate-600">
                    <div>{l.email || "-"}</div>
                    <div>{l.phone || ""}</div>
                  </td>
                  <td className="p-3">{l.service || "-"}</td>
                  <td className="max-w-xs p-3 text-slate-600">{l.message}</td>
                  <td className="p-3">
                    <form action={updateStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={l.id} />
                      <select name="status" defaultValue={l.status} className="rounded border border-slate-300 px-2 py-1 text-xs">
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button className="rounded bg-cyan-600 px-2 py-1 text-xs font-semibold text-white">Kaydet</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
