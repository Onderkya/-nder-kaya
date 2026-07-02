"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { ASSET_PREFIX, ASSET_OFF_PREFIX } from "./assets";
import { ASSET_SLOTS } from "./asset-slots";

/**
 * Bir görsel/video slotunu ayarla veya sıfırla. Boş url → override kaldırılır
 * (varsayılana döner). Admin-only + audit + public ISR tazelenir.
 */
export async function setAsset(slotId: string, url: string): Promise<void> {
  const session = await requireAdmin();
  const key = ASSET_PREFIX + slotId;
  const clean = (url ?? "").trim();
  if (!clean) {
    await prisma.setting.deleteMany({ where: { key } });
    await audit(session.email, "delete", "Asset", slotId, "varsayılana döndü");
  } else {
    await prisma.setting.upsert({ where: { key }, update: { value: clean }, create: { key, value: clean } });
    await audit(session.email, "update", "Asset", slotId, clean);
  }
  revalidatePath("/", "layout"); // public sayfalar (ISR) tazelensin
  revalidatePath("/admin/content");
}

/**
 * Bir tekil medya slotunu göster/gizle. hidden=true → `assetoff:<slot>`="1"
 * (URL override'ı KORUNUR); false → kayıt silinir (varsayılan: görünür).
 * Bilinmeyen slotId sessizce yok sayılır (site asla bozulmaz). Admin-only +
 * audit + public ISR tazelenir.
 */
export async function setAssetHidden(slotId: string, hidden: boolean): Promise<void> {
  const session = await requireAdmin();
  if (!ASSET_SLOTS.some((s) => s.id === slotId)) return; // bilinmeyen slot → no-op
  const key = ASSET_OFF_PREFIX + slotId;
  if (hidden) {
    await prisma.setting.upsert({ where: { key }, update: { value: "1" }, create: { key, value: "1" } });
  } else {
    await prisma.setting.deleteMany({ where: { key } });
  }
  await audit(session.email, "toggle", "Asset", slotId, hidden ? "gizle" : "göster");
  revalidatePath("/", "layout"); // public sayfalar (ISR) tazelensin
  revalidatePath("/admin/content");
}
