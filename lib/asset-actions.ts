"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { ASSET_PREFIX } from "./assets";

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
