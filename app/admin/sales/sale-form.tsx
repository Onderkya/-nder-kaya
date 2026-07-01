import { minorToDecimal } from "@/lib/money";

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

const field = "rounded-lg border border-slate-300 px-3 py-2 text-sm";
function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-medium text-slate-500">{children}</span>;
}

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
    <form action={action} className="space-y-5 rounded-2xl bg-white p-6 shadow-sm">
      {s.id ? <input type="hidden" name="id" value={s.id} /> : null}

      {/* Müşteri */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-cyan-800">Müşteri</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label><Label>Ad Soyad *</Label><input name="customerName" required defaultValue={s.customerName ?? ""} className={`${field} w-full`} /></label>
          <label><Label>Telefon</Label><input name="customerPhone" defaultValue={s.customerPhone ?? ""} className={`${field} w-full`} /></label>
          <label><Label>E-posta</Label><input name="customerEmail" type="email" defaultValue={s.customerEmail ?? ""} className={`${field} w-full`} /></label>
          <label><Label>Kimlik / Pasaport no</Label><input name="customerIdNo" defaultValue={s.customerIdNo ?? ""} className={`${field} w-full`} /></label>
          <label><Label>Ülke</Label><input name="customerCountry" defaultValue={s.customerCountry ?? ""} placeholder="Kazakistan / Rusya..." className={`${field} w-full`} /></label>
          <label><Label>Satış tarihi</Label><input name="soldAt" type="date" defaultValue={dateVal} className={`${field} w-full`} /></label>
        </div>
      </div>

      {/* Ürün + tutar */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-cyan-800">Ürün / Tur</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label><Label>Hizmet</Label>
            <select name="service" defaultValue={s.service ?? ""} className={`${field} w-full`}>
              <option value="">—</option>
              {SERVICES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </label>
          <label className="lg:col-span-2"><Label>Tur / paket adı * (seçili gelir, elle de yazabilirsin)</Label>
            <input name="itemName" required list="sale-items" defaultValue={s.itemName ?? ""} className={`${field} w-full`} />
          </label>
          <label><Label>Tutar (liste fiyatı) *</Label><input name="amount" required type="number" step="0.01" min="0" defaultValue={dec(s.amount)} className={`${field} w-full`} /></label>
          <label><Label>Para birimi</Label>
            <select name="currency" defaultValue={s.currency ?? "USD"} className={`${field} w-full`}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* İndirim */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-cyan-800">İndirim</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label><Label>İndirim kodu (varsa)</Label>
            <select name="promoCode" defaultValue={s.promoCode ?? ""} className={`${field} w-full`}>
              <option value="">— yok —</option>
              {promos.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label><Label>Manuel indirim (boşsa koddan hesaplanır)</Label><input name="discountAmount" type="number" step="0.01" min="0" defaultValue={dec(s.discountAmount)} className={`${field} w-full`} /></label>
        </div>
        <p className="mt-1 text-xs text-slate-400">Net tutar otomatik hesaplanır: liste fiyatı − indirim.</p>
      </div>

      {/* Ödeme */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-cyan-800">Ödeme</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label><Label>Ödeme yöntemi</Label>
            <select name="paymentType" defaultValue={s.paymentType ?? ""} className={`${field} w-full`}>
              {PAY_TYPES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </label>
          <label className="lg:col-span-2"><Label>Hangi adres/IBAN/txid ile ödendi</Label>
            <input name="paymentRef" list="pay-refs" defaultValue={s.paymentRef ?? ""} className={`${field} w-full font-mono`} />
          </label>
          <label><Label>Durum</Label>
            <select name="status" defaultValue={s.status ?? "PAID"} className={`${field} w-full`}>
              {STATUSES.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </label>
          <label><Label>Ödenen (kısmi ise)</Label><input name="paidAmount" type="number" step="0.01" min="0" defaultValue={dec(s.paidAmount)} className={`${field} w-full`} /></label>
        </div>
      </div>

      <label className="block"><Label>Not</Label><textarea name="note" rows={2} defaultValue={s.note ?? ""} className={`${field} w-full`} /></label>

      <button className="rounded-lg bg-cyan-600 px-5 py-2 text-sm font-semibold text-white">{submitLabel}</button>

      <datalist id="sale-items">{itemSuggestions.map((i) => <option key={i} value={i} />)}</datalist>
      <datalist id="pay-refs">{payRefs.map((r) => <option key={r} value={r} />)}</datalist>
    </form>
  );
}
