"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { SEC_PREFIX } from "./sections";

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
