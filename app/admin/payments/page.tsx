import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PaymentType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { validateCryptoAddress } from "@/lib/crypto-address";

export const dynamic = "force-dynamic";

function mask(addr: string | null) {
  if (!addr) return "-";
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

async function createMethod(formData: FormData) {
  "use server";
  const session = await requireAdmin();

  const type = String(formData.get("type")) as PaymentType;
  const coin = String(formData.get("coin") || "").trim() || null;
  const network = String(formData.get("network") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;

  if (!address) redirect("/admin/payments?error=" + encodeURIComponent("Adres/bilgi boş olamaz."));

  // Kripto adresleri checksum ile doğrulanır; Kaspi serbest metindir.
  if (type === "CRYPTO") {
    if (!coin || !network) {
      redirect("/admin/payments?error=" + encodeURIComponent("Kripto için coin ve ağ zorunludur."));
    }
    const check = validateCryptoAddress(coin, network, address!);
    if (!check.ok) {
      redirect("/admin/payments?error=" + encodeURIComponent(check.reason));
    }
  }

  const created = await prisma.paymentMethod.create({
    data: { type, coin, network, address },
  });
  await audit(session.email, "create", "PaymentMethod", created.id, `${type} ${coin ?? ""} ${network ?? ""} ${mask(address)}`);
  revalidatePath("/admin/payments");
  revalidatePath("/", "layout");
  redirect("/admin/payments?ok=1");
}

async function toggleMethod(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.paymentMethod.update({ where: { id }, data: { active: !active } });
  await audit(session.email, "toggle", "PaymentMethod", id, `active=${!active}`);
  revalidatePath("/admin/payments");
  revalidatePath("/", "layout");
}

async function deleteMethod(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const existing = await prisma.paymentMethod.findUnique({ where: { id } });
  await prisma.paymentMethod.delete({ where: { id } });
  await audit(session.email, "delete", "PaymentMethod", id, existing ? `${existing.type} ${existing.coin ?? ""} ${mask(existing.address)}` : undefined);
  revalidatePath("/admin/payments");
  revalidatePath("/", "layout");
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requireAdmin();
  const { error, ok } = await searchParams;
  const methods = await prisma.paymentMethod.findMany({ orderBy: { order: "asc" } }).catch(() => []);
  const logs = await prisma.auditLog
    .findMany({ where: { entity: "PaymentMethod" }, orderBy: { createdAt: "desc" }, take: 8 })
    .catch(() => []);
  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Ödeme Yöntemleri</h1>
        <p className="text-sm text-slate-500">
          Kazakistan için Kaspi, diğer ülkeler için kripto (USDT, BTC ve diğerleri).
          Kripto adresleri kaydedilmeden önce <strong>checksum ile doğrulanır</strong>;
          yanlış/eksik adres kabul edilmez. Tüm değişiklikler denetim kaydına yazılır.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}
      {ok && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ Ödeme yöntemi doğrulandı ve eklendi.
        </div>
      )}

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
          <input name="address" className={`${field} w-full font-mono`} autoComplete="off" spellCheck={false} />
        </div>
        <div className="flex items-end">
          <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Doğrula & Ekle</button>
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
                <td className="max-w-xs p-3 font-mono text-xs" title={m.address || ""}>{mask(m.address)}</td>
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

      {logs.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-600">Son değişiklikler (denetim kaydı)</h2>
          <ul className="space-y-2 text-xs text-slate-500">
            {logs.map((l) => (
              <li key={l.id} className="flex flex-wrap gap-x-2">
                <span className="text-slate-400">{l.createdAt.toLocaleString("tr-TR")}</span>
                <span className="font-semibold text-slate-700">{l.actorEmail}</span>
                <span className="rounded bg-slate-100 px-1.5">{l.action}</span>
                <span>{l.details}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
