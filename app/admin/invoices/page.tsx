import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { paymentsEnabled } from "@/lib/payments";
import { createInvoice } from "@/lib/invoice";
import { parseAmountToMinor, formatAmount } from "@/lib/money";
import { validatePromo } from "@/lib/promo";
import { CopyButton } from "@/components/copy-button";
import { routing } from "@/i18n/routing";

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
const STATUS_CLASS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  UNDERPAID: "bg-orange-100 text-orange-700",
  EXPIRED: "bg-slate-200 text-slate-600",
  CANCELLED: "bg-slate-200 text-slate-600",
  FAILED: "bg-red-100 text-red-700",
};

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
  const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Faturalar (Kripto Ödeme)</h1>
        <p className="text-sm text-slate-500">
          Fatura oluştur → otomatik bir ödeme linki üretilir → müşteriye gönder. Müşteri
          dilediği ağdan (TRC20 / SOL / ARB / ETH / BTC …) öder; ödeme gelince fatura
          <strong> otomatik &quot;Ödendi&quot;</strong> olur ve sana bildirim gelir. Para doğrudan
          senin cüzdanına geçer.
        </p>
      </div>

      {!enabled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ Ödeme sağlayıcısı henüz yapılandırılmadı. Sunucuda <code>CRYPTOMUS_MERCHANT</code> ve{" "}
          <code>CRYPTOMUS_API_KEY</code> değerlerini <code>.env</code> dosyasına ekleyip yeniden başlat.
          Kurulum: <code>deploy/ODEME-KURULUM.md</code>.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">⚠️ {error}</div>
      )}

      {createdInv && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          ✓ Fatura oluşturuldu: <strong>{createdInv.ref}</strong>. Bu linki müşteriye gönder:
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 break-all rounded bg-white px-2 py-1 text-xs">{payLink(createdInv.locale, createdInv.ref)}</code>
            <CopyButton value={payLink(createdInv.locale, createdInv.ref)} />
          </div>
        </div>
      )}

      {enabled && (
        <form action={createInvoiceAction} className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Tutar</label>
            <input name="amount" required placeholder="50.00" className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Para birimi</label>
            <input name="currency" defaultValue="USD" className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Hizmet</label>
            <select name="service" className={`${field} w-full`}>
              <option value="">—</option>
              <option value="antalya">Antalya danışmanlık</option>
              <option value="lessons">Türkçe ders</option>
              <option value="education">Eğitim</option>
              <option value="other">Diğer</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-xs font-medium text-slate-500">Açıklama (müşteri görür)</label>
            <input name="description" required placeholder="30 dk Türkçe ders" className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Müşteri adı</label>
            <input name="customerName" className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Müşteri e-posta</label>
            <input name="customerEmail" type="email" className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Müşteri telefon</label>
            <input name="customerPhone" className={`${field} w-full`} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Dil (ödeme sayfası)</label>
            <select name="locale" defaultValue="tr" className={`${field} w-full`}>
              {routing.locales.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">İndirim kodu (ops.)</label>
            <input name="promoCode" placeholder="WELCOME10" className={`${field} w-full`} />
          </div>
          <div className="flex items-end">
            <button className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Fatura oluştur &amp; link al</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Referans</th>
              <th className="p-3">Tutar</th>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Durum</th>
              <th className="p-3">Ağ</th>
              <th className="p-3">Tarih</th>
              <th className="p-3">Link</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-slate-100">
                <td className="p-3 font-mono font-semibold">{inv.ref}</td>
                <td className="p-3">{formatAmount(inv.amount, inv.currency)}</td>
                <td className="p-3">{inv.customerName || inv.customerEmail || "-"}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[inv.status]}`}>
                    {STATUS_LABEL[inv.status] ?? inv.status}
                  </span>
                </td>
                <td className="p-3 text-xs">{inv.payNetwork ? `${inv.payCurrency ?? ""} ${inv.payNetwork}` : "-"}</td>
                <td className="p-3 text-xs text-slate-500">{inv.createdAt.toLocaleString("tr-TR")}</td>
                <td className="p-3">{inv.payUrl ? <CopyButton value={payLink(inv.locale, inv.ref)} /> : "-"}</td>
                <td className="p-3">
                  {inv.status === "PENDING" && (
                    <form action={cancelInvoiceAction}>
                      <input type="hidden" name="id" value={inv.id} />
                      <button className="text-xs text-red-600 hover:underline">İptal</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={8} className="p-4 text-center text-slate-500">Henüz fatura yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
