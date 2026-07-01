import { cache } from "react";
import { prisma } from "./db";

/**
 * Admin'in EKLEDİĞİ ekstra SSS maddeleri. Koddaki 4 temel madde (faq.q1..a4)
 * yerinde kalır; bunlar onların ALTINA eklenir. Depolama: Setting `faq:items`
 * = JSON dizi. Her madde soru+cevabı 4 dilde tutar.
 */
export type FaqExtra = { q: Record<string, string>; a: Record<string, string> };

const KEY = "faq:items";

export const getFaqExtras = cache(async (): Promise<FaqExtra[]> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: KEY } });
    if (!row?.value) return [];
    const parsed = JSON.parse(row.value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x === "object" && x.q && x.a);
  } catch {
    return [];
  }
});

/** Belirli bir dil için {q,a} listesi (o dil boşsa TR'ye, o da yoksa ilk dolu değere düşer). */
export async function getFaqExtrasFor(locale: string): Promise<{ q: string; a: string }[]> {
  const items = await getFaqExtras();
  const pick = (m: Record<string, string>) => (m[locale]?.trim() || m.tr?.trim() || Object.values(m).find((v) => v?.trim()) || "");
  return items.map((it) => ({ q: pick(it.q), a: pick(it.a) })).filter((it) => it.q && it.a);
}

export const FAQ_ITEMS_KEY = KEY;
