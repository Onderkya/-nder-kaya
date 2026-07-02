import { minorToDecimal } from "@/lib/money";
import { Section, Field } from "@/components/admin/ui";
import { Icon } from "@/components/admin/icons";

type SaleLike = {
  id?: string;
  soldAt?: Date;
  customerName?: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerIdNo?: string | null;
  customerCountry?: string | null;
  service?: string | null;
  itemName?: string;
  amount?: number;
  currency?: string;
  promoCode?: string | null;
  discountAmount?: number;
  paymentType?: string | null;
  paymentRef?: string | null;
  status?: string;
  paidAmount?: number | null;
  note?: string | null;
};

const SERVICES = [
  { v: "antalya", l: "Antalya turu / tatil" },
  { v: "lessons", l: "Türkçe ders" },
  { v: "education", l: "Eğitim danışmanlığı" },
  { v: "it", l: "Yazılım / IT" },
  { v: "other", l: "Diğer" },
];
const CURRENCIES = ["USD", "EUR", "TRY", "RUB", "KZT"];
const PAY_TYPES = [
  { v: "", l: "—" },
  { v: "KASPI", l: "Kaspi" },
  { v: "CRYPTO", l: "Kripto" },
  { v: "CASH", l: "Nakit" },
  { v: "OTHER", l: "Diğer" },
];
const STATUSES = [
  { v: "PAID", l: "Ödendi" },
  { v: "PENDING", l: "Bekliyor" },
  { v: "PARTIAL", l: "Kısmi" },
];

export function SaleForm({
  action,
  sale,
  promos,
  payRefs,
  itemSuggestions,
  submitLabel,
}: {
  action: (fd: FormData) => void;
  sale?: SaleLike | null;
  promos: string[];
  payRefs: string[];
  itemSuggestions: string[];
  submitLabel: string;
}) {
  const s = sale ?? {};
  const dec = (n?: number | null) => (n == null ? "" : minorToDecimal(n));
  const dateVal = s.soldAt ? new Date(s.soldAt).toISOString().slice(0, 10) : "";

  return (
    <form action={action} className="space-y-5">
      {s.id ? <input type="hidden" name="id" value={s.id} /> : null}

      {/* Müşteri */}
      <Section title="Müşteri" icon="users">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Ad Soyad *" htmlFor="customerName">
            <input id="customerName" name="customerName" required defaultValue={s.customerName ?? ""} className="adm-input" />
          </Field>
          <Field label="Telefon" htmlFor="customerPhone">
            <input id="customerPhone" name="customerPhone" defaultValue={s.customerPhone ?? ""} className="adm-input" />
          </Field>
          <Field label="E-posta" htmlFor="customerEmail">
            <input id="customerEmail" name="customerEmail" type="email" defaultValue={s.customerEmail ?? ""} className="adm-input" />
          </Field>
          <Field label="Kimlik / Pasaport no" htmlFor="customerIdNo">
            <input id="customerIdNo" name="customerIdNo" defaultValue={s.customerIdNo ?? ""} className="adm-input" />
          </Field>
          <Field label="Ülke" htmlFor="customerCountry">
            <input id="customerCountry" name="customerCountry" defaultValue={s.customerCountry ?? ""} placeholder="Kazakistan / Rusya..." className="adm-input" />
          </Field>
          <Field label="Satış tarihi" htmlFor="soldAt">
            <input id="soldAt" name="soldAt" type="date" defaultValue={dateVal} className="adm-input" />
          </Field>
        </div>
      </Section>

      {/* Ürün / tur */}
      <Section title="Ürün / tur" icon="wallet">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Hizmet" htmlFor="service">
            <select id="service" name="service" defaultValue={s.service ?? ""} className="adm-select">
              <option value="">—</option>
              {SERVICES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
          <Field label="Tur / paket adı *" help="Listeden seçebilir veya elle yazabilirsin." htmlFor="itemName" className="lg:col-span-2">
            <input id="itemName" name="itemName" required list="sale-items" defaultValue={s.itemName ?? ""} className="adm-input" />
          </Field>
          <Field label="Tutar (liste fiyatı) *" htmlFor="amount">
            <input id="amount" name="amount" required type="number" step="0.01" min="0" defaultValue={dec(s.amount)} className="adm-input" />
          </Field>
          <Field label="Para birimi" htmlFor="currency">
            <select id="currency" name="currency" defaultValue={s.currency ?? "USD"} className="adm-select">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      {/* Tutar & indirim */}
      <Section title="Tutar & indirim" icon="tag">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="İndirim kodu (varsa)" htmlFor="promoCode">
            <select id="promoCode" name="promoCode" defaultValue={s.promoCode ?? ""} className="adm-select">
              <option value="">— yok —</option>
              {promos.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Manuel indirim" help="Boş bırakırsan koddan hesaplanır." htmlFor="discountAmount">
            <input id="discountAmount" name="discountAmount" type="number" step="0.01" min="0" defaultValue={dec(s.discountAmount)} className="adm-input" />
          </Field>
        </div>
        <p className="adm-help mt-3">Net tutar otomatik hesaplanır: liste fiyatı − indirim.</p>
      </Section>

      {/* Ödeme */}
      <Section title="Ödeme" icon="card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Ödeme yöntemi" htmlFor="paymentType">
            <select id="paymentType" name="paymentType" defaultValue={s.paymentType ?? ""} className="adm-select">
              {PAY_TYPES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
          <Field label="Ödeme referansı" help="Hangi adres / IBAN / txid ile ödendi." htmlFor="paymentRef" className="lg:col-span-2">
            <input id="paymentRef" name="paymentRef" list="pay-refs" defaultValue={s.paymentRef ?? ""} className="adm-input font-mono" />
          </Field>
          <Field label="Durum" htmlFor="status">
            <select id="status" name="status" defaultValue={s.status ?? "PAID"} className="adm-select">
              {STATUSES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </Field>
          <Field label="Ödenen (kısmi ise)" help="Kısmi ödemede şu ana kadar tahsil edilen tutar." htmlFor="paidAmount">
            <input id="paidAmount" name="paidAmount" type="number" step="0.01" min="0" defaultValue={dec(s.paidAmount)} className="adm-input" />
          </Field>
        </div>
        <Field label="Not" htmlFor="note" className="mt-4">
          <textarea id="note" name="note" rows={2} defaultValue={s.note ?? ""} className="adm-textarea" />
        </Field>
      </Section>

      {/* Yapışkan kaydet çubuğu */}
      <div className="adm-sticky-save flex items-center justify-end gap-3">
        <button type="submit" className="adm-btn adm-btn-primary">
          <Icon name="check" size={16} /> {submitLabel}
        </button>
      </div>

      <datalist id="sale-items">{itemSuggestions.map((i) => <option key={i} value={i} />)}</datalist>
      <datalist id="pay-refs">{payRefs.map((r) => <option key={r} value={r} />)}</datalist>
    </form>
  );
}
