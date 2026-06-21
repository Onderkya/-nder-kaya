/**
 * Para yardımcıları. Tutarlar veritabanında DAİMA tam sayı "en küçük birim"
 * (kuruş/cent) olarak tutulur — kayan nokta hatası olmaz. Gösterim ve sağlayıcı
 * (Cryptomus ondalık string ister) için burada dönüştürülür.
 */

/** "15" / "15.5" / "15.00" gibi kullanıcı girişini en küçük birime (cent) çevirir. */
export function parseAmountToMinor(input: string): number | null {
  const s = input.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ""] = s.split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  return Number.isFinite(cents) ? cents : null;
}

/** En küçük birimi (cent) ondalık string'e çevirir: 1500 -> "15.00". */
export function minorToDecimal(minor: number): string {
  return (minor / 100).toFixed(2);
}

/** Gösterim: 1500, "USD" -> "15.00 USD". */
export function formatAmount(minor: number, currency: string): string {
  return `${minorToDecimal(minor)} ${currency}`;
}
