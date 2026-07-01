import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { paymentsEnabled } from "@/lib/payments";
import { createInvoice } from "@/lib/invoice";
import { parseAmountToMinor, formatAmount } from "@/lib/money";
import { validatePromo } from "@/lib/promo";
import { decryptPII } from "@/lib/pii";
import { CopyButton } from "@/components/copy-button";
import { routing } from "@/i18n/routing";
import { PageHeader, Card, Section, Badge, EmptyState, Field } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

export const dynamic = "force-dynamic";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

function payLink(locale: string, ref: string) {
  return `${SITE}/${locale}/pay/${ref}`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  UNDERPAID: "Eksik ödeme",
  EXPIRED: "Süresi doldu",
  CANCELLED: "İptal",
  FAILED: "Başarısız",
};
const STATUS_TONE: Record<string, "success" | "warn" | "danger" | "neutral"> = {
  PENDING: "warn",
  PAID: "success",
  UNDERPAID: "warn",
  EXPIRED: "neutral",
  CANCELLED: "neutral",
  FAILED: "danger",
};
const statusBadge = (st: string) => <Badge tone={STATUS_TONE[st] ?? "neutral"}>{STATUS_LABEL[st] ?? st}</Badge>;

async function createInvoiceAction(formData: FormData) {
  "use server";
  const session = await requireAdmin();

  const amountStr = String(formData.get("amount") || "");
  const amountMinor = parseAmountToMinor(amountStr);
  if (amountMinor == null || amountMinor <= 0) {
    redirect("/admin/invoices?error=" + encodeURIComponent("Geçersiz tutar."));
  }
  const currency = (String(formData.get("currency") || "USD").trim() || "USD").toUpperCase();
  const description = String(formData.get("description") || "").trim();
  if (!description) redirect("/admin/invoices?error=" + encodeURIComponent("Açıklama zorunlu."));

  const service = String(formData.get("service") || "") || null;
  const localeRaw = String(formData.get("locale") || "en");
  const locale = (routing.locales as readonly string[]).includes(localeRaw) ? localeRaw : "en";
  const customerName = String(formData.get("customerName") || "").trim() || null;
  const customerEmail = String(formData.get("customerEmail") || "").trim() || null;
  const customerPhone = String(formData.get("customerPhone") || "").trim() || null;
  const promoRaw = String(formData.get("promoCode") || "").trim();

  // İndirim (varsa) — geçersizse hata döndür, sessizce yutma.
  let discount = 0;
  let promoCode: string | null = null;
  if (promoRaw) {
    const res = await validatePromo(promoRaw, service, amountMinor!);
    if (!res.ok) {
      redirect("/admin/invoices?error=" + encodeURIComponent(`İndirim kodu geçersiz (${res.reason}).`));
    }
    discount = res.discount;
    promoCode = res.code;
  }

  const finalAmount = amountMinor! - discount;

  let ref: string;
  try {
    const invoice = await createInvoice({
      amount: finalAmount,
      currency,
      description,
      promoCode,
      discountAmount: discount,
      customerName,
      customerEmail,
      customerPhone,
      locale,
      service,
    });
    ref = invoice.ref;
    await audit(session.email, "create", "Invoice", invoice.id, `${ref} ${formatAmount(finalAmount, currency)} ${description}`);
  } catch (e) {
    redirect("/admin/invoices?error=" + encodeURIComponent(`Fatura oluşturulamadı: ${(e as Error).message}`));
  }

  revalidatePath("/admin/invoices");
  redirect("/admin/invoices?created=" + encodeURIComponent(ref!));
}

async function cancelInvoiceAction(formData: FormData) {
  "use server";
  const session = await requireAdmin();
  const id = String(formData.get("id"));
  await prisma.invoice.updateMany({ where: { id, status: "PENDING" }, data: { status: "CANCELLED" } });
  await audit(session.email, "cancel", "Invoice", id);
  revalidatePath("/admin/invoices");
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  await requireAdmin();
  const { error, created } = await searchParams;
  const enabled = paymentsEnabled();
  const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 50 }).catch(() => []);
  const createdInv = created ? invoices.find((i) => i.ref === created) : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Satış & Para"
        title="Faturalar (Kripto Ödeme)"
        description="Fatura oluştur → otomatik ödeme linki üretilir → müşteriye gönder. Müşteri dilediği ağdan (TRC20 / SOL / ARB / ETH / BTC …) öder; ödeme gelince fatura otomatik “Ödendi” olur ve sana bildirim gelir. Para doğrudan senin cüzdanına geçer."
      />

      {!enabled && (
        <Card>
          <p className="text-[14px] leading-relaxed" style={{ color: "rgb(var(--gold))" }}>
            ⚠️ Ödeme sağlayıcısı henüz yapılandırılmadı. Sunucuda <code>CRYPTOMUS_MERCHANT</code> ve{" "}
            <code>CRYPTOMUS_API_KEY</code> değerlerini <code>.env</code> dosyasına ekleyip yeniden başlat.
            Kurulum: <code>deploy/ODEME-KURULUM.md</code>.
          </p>
        </Card>
      )}

      {error && (
        <Card><p className="text-[14px]" style={{ color: "rgb(var(--accent))" }}>⚠️ {error}</p></Card>
      )}

      {createdInv && (
        <Card featured>
          <p className="text-[14px]" style={{ color: "rgb(var(--foreground))" }}>
            ✓ Fatura oluşturuldu: <strong>{createdInv.ref}</strong>. Bu linki müşteriye gönder:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded-lg px-2 py-1.5 text-xs" style={{ background: "rgb(var(--muted))" }}>{payLink(createdInv.locale, createdInv.ref)}</code>
            <CopyButton value={payLink(createdInv.locale, createdInv.ref)} />
          </div>
        </Card>
      )}

      {enabled && (
        <Section title="Yeni fatura oluştur" description="Tutarı ve açıklamayı gir; ödeme linki otomatik üretilir." icon="invoice">
          <form action={createInvoiceAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Tutar" help="Örn. 50.00" htmlFor="inv-amount">
                <input id="inv-amount" name="amount" required placeholder="50.00" className="adm-input" />
              </Field>
              <Field label="Para birimi" htmlFor="inv-currency">
                <input id="inv-currency" name="currency" defaultValue="USD" className="adm-input" />
              </Field>
              <Field label="Hizmet" htmlFor="inv-service">
                <select id="inv-service" name="service" className="adm-select">
                  <option value="">—</option>
                  <option value="antalya">Antalya danışmanlık</option>
                  <option value="lessons">Türkçe ders</option>
                  <option value="education">Eğitim</option>
                  <option value="other">Diğer</option>
                </select>
              </Field>
              <Field label="Açıklama" help="Müşteri ödeme sayfasında bunu görür." htmlFor="inv-description" className="sm:col-span-2 lg:col-span-3">
                <input id="inv-description" name="description" required placeholder="30 dk Türkçe ders" className="adm-input" />
              </Field>
              <Field label="Müşteri adı" htmlFor="inv-customerName">
                <input id="inv-customerName" name="customerName" className="adm-input" />
              </Field>
              <Field label="Müşteri e-posta" htmlFor="inv-customerEmail">
                <input id="inv-customerEmail" name="customerEmail" type="email" className="adm-input" />
              </Field>
              <Field label="Müşteri telefon" htmlFor="inv-customerPhone">
                <input id="inv-customerPhone" name="customerPhone" className="adm-input" />
              </Field>
              <Field label="Dil (ödeme sayfası)" help="Ödeme sayfasının gösterileceği dil." htmlFor="inv-locale">
                <select id="inv-locale" name="locale" defaultValue="tr" className="adm-select">
                  {routing.locales.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="İndirim kodu (ops.)" htmlFor="inv-promoCode">
                <input id="inv-promoCode" name="promoCode" placeholder="WELCOME10" className="adm-input" />
              </Field>
            </div>
            <button className="adm-btn adm-btn-primary"><Icon name="invoice" size={16} /> Fatura oluştur &amp; link al</button>
          </form>
        </Section>
      )}

      {invoices.length === 0 ? (
        <EmptyState icon="invoice" title="Henüz fatura yok" description="Yukarıdaki formdan ilk faturanı oluştur; müşteriye göndereceğin ödeme linki otomatik üretilir." />
      ) : (
        <>
          {/* Mobil kartlar */}
          <div className="space-y-3 sm:hidden">
            {invoices.map((inv) => (
              <Card key={inv.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono font-semibold" style={{ color: "rgb(var(--foreground))" }}>{inv.ref}</p>
                    <p className="adm-muted text-xs">{inv.customerName || decryptPII(inv.customerEmail) || "-"}</p>
                  </div>
                  {statusBadge(inv.status)}
                </div>
                <dl className="mt-3 space-y-2 text-[13.5px]">
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Tutar</dt>
                    <dd className="font-semibold">{formatAmount(inv.amount, inv.currency)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Ağ</dt>
                    <dd className="text-right">{inv.payNetwork ? `${inv.payCurrency ?? ""} ${inv.payNetwork}` : "-"}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="adm-muted text-xs">Tarih</dt>
                    <dd className="adm-muted text-right">{inv.createdAt.toLocaleString("tr-TR")}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex items-center gap-2 border-t pt-3" style={{ borderColor: "rgb(var(--border))" }}>
                  {inv.payUrl ? <CopyButton value={payLink(inv.locale, inv.ref)} /> : null}
                  {inv.status === "PENDING" && (
                    <form action={cancelInvoiceAction}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button className="adm-btn adm-btn-danger adm-btn-sm">İptal</button>
                    </form>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Masaüstü tablo */}
          <Card pad={false} className="hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="adm-muted text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid rgb(var(--border))" }}>
                  <th className="px-4 py-3 font-semibold">Referans</th>
                  <th className="px-4 py-3 font-semibold">Tutar</th>
                  <th className="px-4 py-3 font-semibold">Müşteri</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                  <th className="px-4 py-3 font-semibold">Ağ</th>
                  <th className="px-4 py-3 font-semibold">Tarih</th>
                  <th className="px-4 py-3 font-semibold">Link</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderTop: "1px solid rgb(var(--border))" }}>
                    <td className="px-4 py-3 font-mono font-semibold">{inv.ref}</td>
                    <td className="px-4 py-3">{formatAmount(inv.amount, inv.currency)}</td>
                    <td className="px-4 py-3">{inv.customerName || decryptPII(inv.customerEmail) || "-"}</td>
                    <td className="px-4 py-3">{statusBadge(inv.status)}</td>
                    <td className="adm-muted px-4 py-3 text-xs">{inv.payNetwork ? `${inv.payCurrency ?? ""} ${inv.payNetwork}` : "-"}</td>
                    <td className="adm-muted px-4 py-3 text-xs">{inv.createdAt.toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3">{inv.payUrl ? <CopyButton value={payLink(inv.locale, inv.ref)} /> : "-"}</td>
                    <td className="px-4 py-3">
                      {inv.status === "PENDING" && (
                        <form action={cancelInvoiceAction}>
                          <input type="hidden" name="id" value={inv.id} />
                          <button className="adm-btn adm-btn-danger adm-btn-sm">İptal</button>
                        </form>
                      )}
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
