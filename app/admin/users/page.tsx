import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function roleLabel(role: string) {
  return role === "ADMIN" ? "Yönetici" : "Editör";
}

async function createUser(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "EDITOR") as Role;
  if (!EMAIL_RE.test(email)) return;
  if (password.length < 8) return;
  if (role !== "ADMIN" && role !== "EDITOR") return;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return;
  const hashed = await hashPassword(password);
  const created = await prisma.user.create({ data: { email, password: hashed, role } });
  await audit(session.email, "create", "User", created.id, `${email} ${role}`);
  revalidatePath("/admin/users");
}

async function updateRole(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as Role;
  if (role !== "ADMIN" && role !== "EDITOR") return;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;
  // Son ADMIN'i yetkisiz bırakma
  if (target.role === "ADMIN" && role !== "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return;
  }
  await prisma.user.update({ where: { id }, data: { role } });
  await audit(session.email, "update", "User", id, `role=${role}`);
  revalidatePath("/admin/users");
}

async function deleteUser(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  // Kendi hesabını silemezsin
  if (id === session.uid) return;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return;
  // Son ADMIN'i silemezsin
  if (target.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return;
  }
  await prisma.user.delete({ where: { id } });
  await audit(session.email, "delete", "User", id, target.email);
  revalidatePath("/admin/users");
}

export default async function UsersPage() {
  const session = await requireAdmin();
  const users = await prisma.user
    .findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    .catch(() => []);
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Kullanıcılar</h1>
        <p className="text-sm text-slate-500">
          Yönetim paneline erişebilen kullanıcıları ekleyin, rollerini düzenleyin veya
          silin. Parolalar güvenli biçimde saklanır ve hiçbir yerde gösterilmez.
        </p>
      </div>

      <form action={createUser} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">E-posta</label>
          <input name="email" type="email" required placeholder="ad@ornek.com" className={`${field} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Parola (en az 8 karakter)</label>
          <input name="password" type="password" required minLength={8} className={`${field} w-full`} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Rol</label>
          <select name="role" className={`${field} w-full`}>
            <option value="EDITOR">Editör</option>
            <option value="ADMIN">Yönetici</option>
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
              <th className="p-3">E-posta</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Oluşturulma</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u.id === session.uid;
              const isLastAdmin = u.role === "ADMIN" && adminCount <= 1;
              return (
                <tr key={u.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium">
                    {u.email}
                    {isSelf && <span className="ml-2 text-xs text-slate-400">(siz)</span>}
                  </td>
                  <td className="p-3">
                    <form action={updateRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} disabled={isLastAdmin} className={field}>
                        <option value="EDITOR">Editör</option>
                        <option value="ADMIN">Yönetici</option>
                      </select>
                      <button disabled={isLastAdmin} className="text-xs text-cyan-700 hover:underline disabled:text-slate-300 disabled:no-underline">
                        Kaydet
                      </button>
                    </form>
                  </td>
                  <td className="p-3 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="p-3">
                    {isSelf || isLastAdmin ? (
                      <span className="text-xs text-slate-300" title={isSelf ? "Kendi hesabınızı silemezsiniz" : "Son yöneticiyi silemezsiniz"}>
                        Sil
                      </span>
                    ) : (
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-xs text-red-600 hover:underline">Sil</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Henüz kullanıcı yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        {roleLabel("ADMIN")}: tam yetki. {roleLabel("EDITOR")}: içerik düzenleme.
        Son yönetici silinemez veya yetkisi düşürülemez; kendi hesabınızı silemezsiniz.
      </p>
    </div>
  );
}
