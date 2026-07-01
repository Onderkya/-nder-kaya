"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { SEC_PREFIX, SECORDER_PREFIX, applySectionOrder } from "./sections";
import { sectionsForPage } from "./section-registry";

/** Bir bölümü göster/gizle. visible=true → varsayılan (kayıt silinir); false → "off". */
export async function setSectionVisible(id: string, visible: boolean): Promise<void> {
  const session = await requireAdmin();
  const key = SEC_PREFIX + id;
  if (visible) {
    await prisma.setting.deleteMany({ where: { key } });
  } else {
    await prisma.setting.upsert({ where: { key }, update: { value: "off" }, create: { key, value: "off" } });
  }
  await audit(session.email, "toggle", "Section", id, visible ? "göster" : "gizle");
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

/**
 * Bir sayfanın bölüm sırasını kaydet. `ids` o sayfanın registry id'lerine göre
 * doğrulanır (bilinmeyen id atılır). Sonuç varsayılan sırayla aynıysa kayıt
 * silinir (varsayılan kazanır); değilse `Setting` `secorder:<page>` yazılır.
 */
export async function saveSectionOrder(page: string, ids: string[]): Promise<void> {
  const session = await requireAdmin();
  const defaultIds = sectionsForPage(page).map((s) => s.id);
  const valid = new Set(defaultIds);
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const id of ids) {
    if (valid.has(id) && !seen.has(id)) {
      cleaned.push(id);
      seen.add(id);
    }
  }
  // Doğrulanmış sırayı tam listeye tamamla (eksik id'ler komşusuna göre eklenir).
  const finalOrder = applySectionOrder(defaultIds, cleaned);
  const key = SECORDER_PREFIX + page;
  const isDefault = finalOrder.length === defaultIds.length && finalOrder.every((id, i) => id === defaultIds[i]);
  if (isDefault) {
    await prisma.setting.deleteMany({ where: { key } });
  } else {
    const value = JSON.stringify(finalOrder);
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  await audit(session.email, "reorder", "Section", page, finalOrder.join(","));
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

/**
 * Bir bölümü sırada bir yukarı/aşağı taşı. Mevcut sırayı (kayıt yoksa varsayılanı)
 * alıp komşusuyla yer değiştirir, sonra `saveSectionOrder` ile kaydeder.
 */
export async function moveSection(page: string, id: string, dir: "up" | "down"): Promise<void> {
  await requireAdmin();
  const defaultIds = sectionsForPage(page).map((s) => s.id);
  const key = SECORDER_PREFIX + page;
  let saved: string[] | undefined;
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row) {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) saved = parsed as string[];
    }
  } catch {
    saved = undefined;
  }
  const current = applySectionOrder(defaultIds, saved);
  const idx = current.indexOf(id);
  if (idx < 0) return;
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= current.length) return;
  [current[idx], current[swap]] = [current[swap], current[idx]];
  await saveSectionOrder(page, current);
}
