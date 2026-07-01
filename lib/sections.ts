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
