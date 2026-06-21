import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { PromoType } from "@prisma/client";

export const dynamic = "force-dynamic";

async function createPromo(formData: FormData) {
  "use server";
  const code = String(formData.get("code")).trim().toUpperCase();
  const type = String(formData.get("type")) as PromoType;
  const value = Number(formData.get("value"));
  const usageLimit = formData.get("usageLimit") ? Number(formData.get("usageLimit")) : null;
  const targetSlug = String(formData.get("targetSlug") || "") || null;
  if (!code || !value) return;
  await prisma.promoCode.create({ data: { code, type, value, usageLimit, targetSlug } });
  revalidatePath("/admin/promos");
}

async function togglePromo(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.promoCode.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/promos");
}

async function deletePromo(formData: FormData) {
  "use server";
  await prisma.promoCode.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/promos");
}

export default async function PromosPage() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);

  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">İndirim Kodları</h1>
        <p className="text-sm text-slate-500">
          İndirim kodları içerikten bağımsızdır — kod eklemek için sayfa metni veya
          görselle uğraşmanız gerekmez.
        </p>
      </div>

      <form action={createPromo} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Kod</label>
          <input name="code" required placeholder="WELCOME10" className={`${field} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Tür</label>
          <select name="type" className={`${field} w-full`}>
            <option value="PERCENT">Yüzde (%)</option>
            <option value="AMOUNT">Tutar</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Değer</label>
          <input name="value" type="number" required min={1} className={`${field} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Kullanım limiti (boş = sınırsız)</label>
          <input name="usageLimit" type="number" min={1} className={`${field} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Hedef hizmet (boş = tümü)</label>
          <select name="targetSlug" className={`${field} w-full`}>
            <option value="">Tümü</option>
            <option value="antalya">Antalya</option>
            <option value="lessons">Türkçe Ders</option>
            <option value="education">Eğitim</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Ekle</button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Kod</th>
              <th className="p-3">İndirim</th>
              <th className="p-3">Hedef</th>
              <th className="p-3">Kullanım</th>
              <th className="p-3">Durum</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {promos.map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="p-3 font-mono font-semibold">{p.code}</td>
                <td className="p-3">{p.type === "PERCENT" ? `%${p.value}` : p.value}</td>
                <td className="p-3">{p.targetSlug || "Tümü"}</td>
                <td className="p-3">{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                <td className="p-3">
                  <form action={togglePromo}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(p.active)} />
                    <button className={`rounded-full px-3 py-1 text-xs font-semibold ${p.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                      {p.active ? "Aktif" : "Pasif"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deletePromo}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-xs text-red-600 hover:underline">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {promos.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-slate-500">Henüz indirim kodu yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
