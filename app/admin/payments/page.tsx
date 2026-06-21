import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { PaymentType } from "@prisma/client";

export const dynamic = "force-dynamic";

async function createMethod(formData: FormData) {
  "use server";
  const type = String(formData.get("type")) as PaymentType;
  const coin = String(formData.get("coin") || "") || null;
  const network = String(formData.get("network") || "") || null;
  const address = String(formData.get("address") || "") || null;
  await prisma.paymentMethod.create({ data: { type, coin, network, address } });
  revalidatePath("/admin/payments");
}

async function toggleMethod(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.paymentMethod.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/payments");
}

async function deleteMethod(formData: FormData) {
  "use server";
  await prisma.paymentMethod.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/payments");
}

export default async function PaymentsPage() {
  const methods = await prisma.paymentMethod.findMany({ orderBy: { order: "asc" } }).catch(() => []);
  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Ödeme Yöntemleri</h1>
        <p className="text-sm text-slate-500">
          Kazakistan için Kaspi, diğer ülkeler için kripto (USDT, BTC ve diğerleri).
          Birden fazla coin/ağ ekleyebilirsiniz.
        </p>
      </div>

      <form action={createMethod} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Tür</label>
          <select name="type" className={`${field} w-full`}>
            <option value="KASPI">Kaspi</option>
            <option value="CRYPTO">Kripto</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Coin (kripto)</label>
          <input name="coin" placeholder="USDT / BTC" className={`${field} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Ağ</label>
          <input name="network" placeholder="TRC20 / ERC20 / BTC" className={`${field} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Adres / Kaspi bilgisi</label>
          <input name="address" className={`${field} w-full`} />
        </div>
        <div className="flex items-end">
          <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Ekle</button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Tür</th>
              <th className="p-3">Coin</th>
              <th className="p-3">Ağ</th>
              <th className="p-3">Adres</th>
              <th className="p-3">Durum</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id} className="border-b border-slate-100">
                <td className="p-3 font-semibold">{m.type}</td>
                <td className="p-3">{m.coin || "-"}</td>
                <td className="p-3">{m.network || "-"}</td>
                <td className="max-w-xs truncate p-3 font-mono text-xs">{m.address || "-"}</td>
                <td className="p-3">
                  <form action={toggleMethod}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="active" value={String(m.active)} />
                    <button className={`rounded-full px-3 py-1 text-xs font-semibold ${m.active ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                      {m.active ? "Aktif" : "Pasif"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deleteMethod}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-xs text-red-600 hover:underline">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
            {methods.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-slate-500">Henüz ödeme yöntemi yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
