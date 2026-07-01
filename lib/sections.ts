import { cache } from "react";
import { prisma } from "./db";

/**
 * Bölüm göster/gizle. Her büyük sayfa bölümü isimli (ör. `home.hotels`).
 * Varsayılan: GÖSTERİLİR. Admin "kapat" derse `Setting` `sec:<id>` = "off"
 * kaydedilir → public sayfa o bölümü render etmez. Kayıt yoksa görünür (site
 * asla eksik/bozuk kalmaz).
 */
export const SEC_PREFIX = "sec:";

export const getHiddenSections = cache(async (): Promise<Set<string>> => {
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: SEC_PREFIX } } });
    return new Set(rows.filter((r) => r.value === "off").map((r) => r.key.slice(SEC_PREFIX.length)));
  } catch {
    return new Set();
  }
});

/** Bölüm görünür mü? (varsayılan: evet). */
export const sectionVisible = (hidden: Set<string>, id: string): boolean => !hidden.has(id);

/**
 * Bölüm sıralaması. Admin sürükle-bırak sıralarsa `Setting` `secorder:<page>` =
 * JSON string[] (id sırası) kaydedilir. Kayıt yoksa varsayılan (registry) sıra
 * geçerli olur → site asla bozulmaz.
 */
export const SECORDER_PREFIX = "secorder:";

export const getSectionOrders = cache(async (): Promise<Record<string, string[]>> => {
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: SECORDER_PREFIX } } });
    const out: Record<string, string[]> = {};
    for (const r of rows) {
      const page = r.key.slice(SECORDER_PREFIX.length);
      try {
        const parsed = JSON.parse(r.value);
        if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
          out[page] = parsed as string[];
        }
      } catch {
        // bozuk JSON'u yok say
      }
    }
    return out;
  } catch {
    return {};
  }
});

/**
 * SAF sıralama uygulama. `saved` yoksa varsayılan; `saved`'daki bilinmeyen id'ler
 * atılır; varsayılanda olup `saved`'da olmayan her id, varsayılan listedeki bir
 * önceki komşusunun (sonuçta mevcutsa) hemen arkasına, yoksa başa eklenir.
 */
export function applySectionOrder(defaultIds: string[], saved: string[] | undefined): string[] {
  if (!saved) return [...defaultIds];
  const defaultSet = new Set(defaultIds);
  // saved'daki bilinmeyen id'leri at, tekrarları önle.
  const result: string[] = [];
  const seen = new Set<string>();
  for (const id of saved) {
    if (defaultSet.has(id) && !seen.has(id)) {
      result.push(id);
      seen.add(id);
    }
  }
  // Eksik id'leri (varsayılanda olup saved'da olmayan) komşu konumuna göre ekle.
  for (let i = 0; i < defaultIds.length; i++) {
    const id = defaultIds[i];
    if (seen.has(id)) continue;
    // Önceki komşusunu bul (varsayılan sırada bir öncesi).
    const prev = i > 0 ? defaultIds[i - 1] : undefined;
    const at = prev !== undefined ? result.indexOf(prev) : -1;
    if (at >= 0) {
      result.splice(at + 1, 0, id);
    } else {
      result.unshift(id);
    }
    seen.add(id);
  }
  return result;
}
