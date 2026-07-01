import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { PageHeader, Card, Field, Badge, EmptyState } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Yönetim Paneli"
        title="Kullanıcılar"
        description="Yönetim paneline erişebilen kişileri ekleyin, rollerini düzenleyin veya silin. Parolalar güvenli biçimde saklanır ve hiçbir yerde gösterilmez."
      />

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Icon name="plus" size={18} style={{ color: "rgb(var(--primary))" }} />
          <h2 className="font-semibold text-[15px]" style={{ color: "rgb(var(--foreground))" }}>Yeni kullanıcı ekle</h2>
        </div>
        <form action={createUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="E-posta" htmlFor="new-email">
            <input id="new-email" name="email" type="email" required placeholder="ad@ornek.com" className="adm-input" />
          </Field>
          <Field label="Parola" help="En az 8 karakter." htmlFor="new-password">
            <input id="new-password" name="password" type="password" required minLength={8} className="adm-input" />
          </Field>
          <Field label="Rol" htmlFor="new-role">
            <select id="new-role" name="role" className="adm-select">
              <option value="EDITOR">Editör</option>
              <option value="ADMIN">Yönetici</option>
            </select>
          </Field>
          <div className="flex items-start sm:items-end">
            <button className="adm-btn adm-btn-primary w-full sm:w-auto">
              <Icon name="plus" size={18} /> Ekle
            </button>
          </div>
        </form>
        <p className="adm-help mt-3">
          <b>Yönetici</b>: tam yetki (kullanıcılar, ayarlar, her şey). <b>Editör</b>: yalnız içerik düzenleme.
          Son yönetici silinemez veya yetkisi düşürülemez; kendi hesabınızı silemezsiniz.
        </p>
      </Card>

      {users.length === 0 ? (
        <EmptyState icon="users" title="Henüz kullanıcı yok" description="Yukarıdaki formdan panele erişecek ilk kullanıcıyı ekleyin." />
      ) : (
        <>
          {/* Mobil — kart yığını */}
          <div className="space-y-3 sm:hidden">
            {users.map((u) => {
              const isSelf = u.id === session.uid;
              const isLastAdmin = u.role === "ADMIN" && adminCount <= 1;
              return (
                <Card key={u.id}>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[14.5px]" style={{ color: "rgb(var(--foreground))" }}>{u.email}</p>
                      {isSelf && <span className="adm-muted text-xs">(siz)</span>}
                    </div>
                    <Badge tone={u.role === "ADMIN" ? "success" : "neutral"}>{roleLabel(u.role)}</Badge>
                  </div>
                  <p className="adm-muted mb-3 text-[12.5px]">
                    Oluşturulma: {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                  <div className="flex flex-wrap items-end gap-3">
                    <form action={updateRole} className="flex flex-1 items-end gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <div className="flex-1">
                        <label className="adm-label" htmlFor={`role-m-${u.id}`}>Rol</label>
                        <select id={`role-m-${u.id}`} name="role" defaultValue={u.role} disabled={isLastAdmin} className="adm-select">
                          <option value="EDITOR">Editör</option>
                          <option value="ADMIN">Yönetici</option>
                        </select>
                      </div>
                      <button disabled={isLastAdmin} className="adm-btn adm-btn-ghost adm-btn-sm">Kaydet</button>
                    </form>
                    {isSelf || isLastAdmin ? (
                      <span className="adm-muted text-xs" title={isSelf ? "Kendi hesabınızı silemezsiniz" : "Son yöneticiyi silemezsiniz"}>Sil</span>
                    ) : (
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                      </form>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Masaüstü — tablo */}
          <Card pad={false} className="hidden sm:block">
            <table className="hidden w-full text-left text-[14px] sm:table">
              <thead>
                <tr className="adm-muted border-b text-[12px] font-semibold uppercase tracking-wide" style={{ borderColor: "rgb(var(--border))" }}>
                  <th className="px-5 py-3">E-posta</th>
                  <th className="px-5 py-3">Rol</th>
                  <th className="px-5 py-3">Oluşturulma</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === session.uid;
                  const isLastAdmin = u.role === "ADMIN" && adminCount <= 1;
                  return (
                    <tr key={u.id} className="border-b last:border-0" style={{ borderColor: "rgb(var(--border))" }}>
                      <td className="px-5 py-3 font-medium" style={{ color: "rgb(var(--foreground))" }}>
                        {u.email}
                        {isSelf && <span className="adm-muted ml-2 text-xs">(siz)</span>}
                      </td>
                      <td className="px-5 py-3">
                        <form action={updateRole} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={u.id} />
                          <select name="role" defaultValue={u.role} disabled={isLastAdmin} className="adm-select max-w-[9rem]">
                            <option value="EDITOR">Editör</option>
                            <option value="ADMIN">Yönetici</option>
                          </select>
                          <button disabled={isLastAdmin} className="adm-btn adm-btn-ghost adm-btn-sm">Kaydet</button>
                        </form>
                      </td>
                      <td className="adm-muted px-5 py-3">
                        {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isSelf || isLastAdmin ? (
                          <span className="adm-muted text-xs" title={isSelf ? "Kendi hesabınızı silemezsiniz" : "Son yöneticiyi silemezsiniz"}>Sil</span>
                        ) : (
                          <form action={deleteUser}>
                            <input type="hidden" name="id" value={u.id} />
                            <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
