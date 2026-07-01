import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PaymentType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { validateCryptoAddress } from "@/lib/crypto-address";
import { PageHeader, Card, Section, Badge, EmptyState, Field, LocationHint } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Satış & Para"
        title="Ödeme Yöntemleri"
        description="Kazakistan için Kaspi, diğer ülkeler için kripto (USDT, BTC ve diğerleri). Kripto adresleri kaydedilmeden önce checksum ile doğrulanır; yanlış/eksik adres kabul edilmez. Tüm değişiklikler denetim kaydına yazılır."
      />

      {error && (
        <Card><p className="text-[14px]" style={{ color: "rgb(var(--accent))" }}>⚠️ {error}</p></Card>
      )}
      {ok && (
        <Card featured><p className="text-[14px]" style={{ color: "rgb(var(--primary))" }}>✓ Ödeme yöntemi doğrulandı ve eklendi.</p></Card>
      )}

      <Section title="Yeni ödeme yöntemi" description="Kaspi bilgisi veya kripto adresi ekle." icon="card">
        <form action={createMethod} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Tür" htmlFor="pm-type">
              <select id="pm-type" name="type" className="adm-select">
                <option value="KASPI">Kaspi</option>
                <option value="CRYPTO">Kripto</option>
              </select>
            </Field>
            <Field label="Coin (kripto)" htmlFor="pm-coin">
              <input id="pm-coin" name="coin" placeholder="USDT / BTC" className="adm-input" />
            </Field>
            <Field label="Ağ" htmlFor="pm-network">
              <input id="pm-network" name="network" placeholder="TRC20 / ERC20 / BTC" className="adm-input" />
            </Field>
            <Field label="Adres / Kaspi bilgisi" htmlFor="pm-address">
              <input id="pm-address" name="address" className="adm-input font-mono" autoComplete="off" spellCheck={false} />
            </Field>
          </div>
          <LocationHint>Eklediğin adresler sitenizdeki ödeme / iletişim sayfasında müşterilere gösterilir.</LocationHint>
          <button className="adm-btn adm-btn-primary"><Icon name="check" size={16} /> Doğrula &amp; Ekle</button>
        </form>
      </Section>

      {methods.length === 0 ? (
        <EmptyState icon="card" title="Henüz ödeme yöntemi yok" description="Yukarıdan bir Kaspi bilgisi veya kripto adresi ekle; ödeme sayfasında görünecek." />
      ) : (
        <>
          {/* Mobil kartlar */}
          <div className="space-y-3 sm:hidden">
            {methods.map((m) => (
              <Card key={m.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{m.type}</p>
                  <Badge tone={m.active ? "success" : "neutral"}>{m.active ? "Aktif" : "Pasif"}</Badge>
                </div>
                <dl className="mt-3 space-y-2 text-[13.5px]">
                  <div className="flex justify-between gap-3"><dt className="adm-muted text-xs">Coin</dt><dd>{m.coin || "-"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="adm-muted text-xs">Ağ</dt><dd>{m.network || "-"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="adm-muted text-xs">Adres</dt><dd className="truncate font-mono text-xs" title={m.address || ""}>{mask(m.address)}</dd></div>
                </dl>
                <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{ borderColor: "rgb(var(--border))" }}>
                  <form action={toggleMethod}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="active" value={String(m.active)} />
                    <button className="adm-btn adm-btn-ghost adm-btn-sm">{m.active ? "Pasifleştir" : "Aktifleştir"}</button>
                  </form>
                  <form action={deleteMethod}>
                    <input type="hidden" name="id" value={m.id} />
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
                  <th className="px-4 py-3 font-semibold">Tür</th>
                  <th className="px-4 py-3 font-semibold">Coin</th>
                  <th className="px-4 py-3 font-semibold">Ağ</th>
                  <th className="px-4 py-3 font-semibold">Adres</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {methods.map((m) => (
                  <tr key={m.id} style={{ borderTop: "1px solid rgb(var(--border))" }}>
                    <td className="px-4 py-3 font-semibold">{m.type}</td>
                    <td className="px-4 py-3">{m.coin || "-"}</td>
                    <td className="px-4 py-3">{m.network || "-"}</td>
                    <td className="max-w-xs px-4 py-3 font-mono text-xs" title={m.address || ""}>{mask(m.address)}</td>
                    <td className="px-4 py-3"><Badge tone={m.active ? "success" : "neutral"}>{m.active ? "Aktif" : "Pasif"}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <form action={toggleMethod}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="active" value={String(m.active)} />
                          <button className="adm-btn adm-btn-ghost adm-btn-sm">{m.active ? "Pasifleştir" : "Aktifleştir"}</button>
                        </form>
                        <form action={deleteMethod}>
                          <input type="hidden" name="id" value={m.id} />
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

      {logs.length > 0 && (
        <Section title="Son değişiklikler (denetim kaydı)" description="Ödeme yöntemlerinde yapılan son işlemler." icon="log" defaultOpen={false}>
          <ul className="space-y-2 text-xs">
            {logs.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-x-2">
                <span className="adm-muted">{l.createdAt.toLocaleString("tr-TR")}</span>
                <span className="font-semibold" style={{ color: "rgb(var(--foreground))" }}>{l.actorEmail}</span>
                <span className="rounded px-1.5" style={{ background: "rgb(var(--muted))" }}>{l.action}</span>
                <span className="adm-muted">{l.details}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
