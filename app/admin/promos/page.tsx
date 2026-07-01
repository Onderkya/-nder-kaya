import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { PromoType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { PageHeader, Card, Section, Badge, EmptyState, Field } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

async function createPromo(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const code = String(formData.get("code")).trim().toUpperCase();
  const type = String(formData.get("type")) as PromoType;
  const value = Number(formData.get("value"));
  const usageLimit = formData.get("usageLimit") ? Number(formData.get("usageLimit")) : null;
  const targetSlug = String(formData.get("targetSlug") || "") || null;
  if (!code || !Number.isFinite(value) || value <= 0) return;
  if (type === "PERCENT" && value > 100) return;
  const created = await prisma.promoCode.create({ data: { code, type, value, usageLimit, targetSlug } });
  await audit(session.email, "create", "PromoCode", created.id, `${code} ${type} ${value}`);
  revalidatePath("/admin/promos");
}

async function togglePromo(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  const active = formData.get("active") === "true";
  await prisma.promoCode.update({ where: { id }, data: { active: !active } });
  await audit(session.email, "toggle", "PromoCode", id, `active=${!active}`);
  revalidatePath("/admin/promos");
}

async function deletePromo(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.promoCode.delete({ where: { id } });
  await audit(session.email, "delete", "PromoCode", id);
  revalidatePath("/admin/promos");
}

export default async function PromosPage() {
  await requireAdmin();
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Satış & Para"
        title="İndirim Kodları"
        description="İndirim kodları içerikten bağımsızdır — kod eklemek için sayfa metni veya görselle uğraşman gerekmez. Kodlar ödeme/fatura sırasında geçerli olur."
      />

      <Section title="Yeni indirim kodu" description="Yüzde veya sabit tutar indirim tanımla." icon="tag">
        <form action={createPromo} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Kod" help="Müşterinin gireceği kod (örn. WELCOME10)." htmlFor="promo-code">
              <input id="promo-code" name="code" required placeholder="WELCOME10" className="adm-input" />
            </Field>
            <Field label="Tür" htmlFor="promo-type">
              <select id="promo-type" name="type" className="adm-select">
                <option value="PERCENT">Yüzde (%)</option>
                <option value="AMOUNT">Tutar</option>
              </select>
            </Field>
            <Field label="Değer" help="Yüzde ise 1–100; tutar ise para birimi tutarı." htmlFor="promo-value">
              <input id="promo-value" name="value" type="number" required min={1} className="adm-input" />
            </Field>
            <Field label="Kullanım limiti" help="Boş bırakırsan sınırsız." htmlFor="promo-usageLimit">
              <input id="promo-usageLimit" name="usageLimit" type="number" min={1} className="adm-input" />
            </Field>
            <Field label="Hedef hizmet" help="Boş bırakırsan tüm hizmetlerde geçerli." htmlFor="promo-targetSlug">
              <select id="promo-targetSlug" name="targetSlug" className="adm-select">
                <option value="">Tümü</option>
                <option value="antalya">Antalya</option>
                <option value="lessons">Türkçe Ders</option>
                <option value="education">Eğitim</option>
              </select>
            </Field>
          </div>
          <button className="adm-btn adm-btn-primary"><Icon name="plus" size={16} /> Ekle</button>
        </form>
      </Section>

      {promos.length === 0 ? (
        <EmptyState icon="tag" title="Henüz indirim kodu yok" description="Yukarıdan ilk indirim kodunu ekle; müşteriler ödeme sırasında girebilir." />
      ) : (
        <>
          {/* Mobil kartlar */}
          <div className="space-y-3 sm:hidden">
            {promos.map((p) => (
              <Card key={p.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="truncate font-mono font-semibold" style={{ color: "rgb(var(--foreground))" }}>{p.code}</p>
                  <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Aktif" : "Pasif"}</Badge>
                </div>
                <dl className="mt-3 space-y-2 text-[13.5px]">
                  <div className="flex justify-between gap-3"><dt className="adm-muted text-xs">İndirim</dt><dd>{p.type === "PERCENT" ? `%${p.value}` : p.value}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="adm-muted text-xs">Hedef</dt><dd>{p.targetSlug || "Tümü"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="adm-muted text-xs">Kullanım</dt><dd>{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</dd></div>
                </dl>
                <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{ borderColor: "rgb(var(--border))" }}>
                  <form action={togglePromo}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="active" value={String(p.active)} />
                    <button className="adm-btn adm-btn-ghost adm-btn-sm">{p.active ? "Pasifleştir" : "Aktifleştir"}</button>
                  </form>
                  <form action={deletePromo}>
                    <input type="hidden" name="id" value={p.id} />
                    <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                  </form>
                </div>
              </Card>
            ))}
          </div>

          {/* Masaüstü tablo */}
          <Card pad={false} className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="adm-muted text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid rgb(var(--border))" }}>
                  <th className="px-4 py-3 font-semibold">Kod</th>
                  <th className="px-4 py-3 font-semibold">İndirim</th>
                  <th className="px-4 py-3 font-semibold">Hedef</th>
                  <th className="px-4 py-3 font-semibold">Kullanım</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid rgb(var(--border))" }}>
                    <td className="px-4 py-3 font-mono font-semibold">{p.code}</td>
                    <td className="px-4 py-3">{p.type === "PERCENT" ? `%${p.value}` : p.value}</td>
                    <td className="px-4 py-3">{p.targetSlug || "Tümü"}</td>
                    <td className="px-4 py-3">{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}</td>
                    <td className="px-4 py-3"><Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Aktif" : "Pasif"}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <form action={togglePromo}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="active" value={String(p.active)} />
                          <button className="adm-btn adm-btn-ghost adm-btn-sm">{p.active ? "Pasifleştir" : "Aktifleştir"}</button>
                        </form>
                        <form action={deletePromo}>
                          <input type="hidden" name="id" value={p.id} />
                          <button className="adm-btn adm-btn-danger adm-btn-sm">Sil</button>
                        </form>
                      </div>
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
