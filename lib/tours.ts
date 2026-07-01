import { cache } from "react";
import { prisma } from "./db";

/**
 * TUR YÖNETİMİ. Koddaki 5 hazır rota (r1..r5) VARSAYILAN olarak kalır; admin
 * `Setting` `tours:items` JSON'una override yazar: sıra, aktif/pasif, foto,
 * isim/rozet (dil bazında), gün/yıldız — ve SIFIRDAN yeni tur ekleyebilir.
 * Kayıt yoksa site birebir eskisi gibi görünür (bozulmaz).
 */
export const TOURS_KEY = "tours:items";

export type L10n = Record<string, string>; // locale -> metin

export type TourStepCfg = { day: number; t: L10n; d: L10n };

export type TourCfg = {
  key: string; // r1..r5 (kodlu) | c... (özel)
  custom?: boolean;
  active?: boolean; // varsayılan true
  order?: number;
  img?: string;
  name?: L10n;
  aud?: L10n; // kitle rozeti ("Balayı" gibi)
  days?: number;
  stars?: number;
  hotel?: string;
  loc?: string;
  steps?: TourStepCfg[]; // yalnız özel turlar
  hotelWhy?: L10n;
  hotelNote?: L10n;
};

/** Kodlu turların değişmez varsayılanları (admin prefill + sıra tabanı). */
export const CODED_TOURS: { key: string; days: number; stars: number; hotel: string; audKey: string; hotelKey: string }[] = [
  { key: "r1", days: 3, stars: 5, hotel: "Lara Barut Collection", audKey: "aud_classic", hotelKey: "larabarut" },
  { key: "r2", days: 5, stars: 5, hotel: "Cullinan Belek", audKey: "aud_classic", hotelKey: "cullinan" },
  { key: "r3", days: 5, stars: 5, hotel: "NG Phaselis Bay", audKey: "aud_honeymoon", hotelKey: "ngphaselis" },
  { key: "r4", days: 7, stars: 5, hotel: "Land of Legends Kingdom", audKey: "aud_family", hotelKey: "legends" },
  { key: "r5", days: 7, stars: 5, hotel: "Maxx Royal Kemer", audKey: "aud_luxury", hotelKey: "maxxkemer" },
];

export const getTourCfgs = cache(async (): Promise<TourCfg[]> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: TOURS_KEY } });
    if (!row?.value) return [];
    const parsed = JSON.parse(row.value);
    return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.key === "string") : [];
  } catch {
    return [];
  }
});

/** Dil bazlı metin seç: istenen dil → tr → ilk dolu değer → boş. */
export const pickL10n = (m: L10n | undefined, locale: string): string =>
  m?.[locale]?.trim() || m?.tr?.trim() || (m ? Object.values(m).find((v) => v?.trim()) ?? "" : "");

/** Varsayılan sıra: kodlu turlar 0..4; özel turlar sona. */
export function tourOrder(cfg: TourCfg | undefined, key: string): number {
  if (cfg?.order != null) return cfg.order;
  const i = CODED_TOURS.findIndex((c) => c.key === key);
  return i >= 0 ? i : 999;
}
