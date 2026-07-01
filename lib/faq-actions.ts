"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { FAQ_ITEMS_KEY, type FaqExtra } from "./faq";

/** Ekstra SSS maddelerini kaydet (JSON string olarak gelir). Admin-only + revalidate. */
export async function saveFaqExtras(json: string): Promise<void> {
  const session = await requireAdmin();
  let items: FaqExtra[] = [];
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      items = parsed
        .filter((x) => x && x.q && x.a)
        .map((x) => ({ q: x.q, a: x.a }))
        // en az bir dilde soru+cevabı olan maddeleri tut
        .filter((x: FaqExtra) => Object.values(x.q).some((v) => v?.trim()) && Object.values(x.a).some((v) => v?.trim()));
    }
  } catch {
    return;
  }
  await prisma.setting.upsert({
    where: { key: FAQ_ITEMS_KEY },
    update: { value: JSON.stringify(items) },
    create: { key: FAQ_ITEMS_KEY, value: JSON.stringify(items) },
  });
  await audit(session.email, "update", "Faq", null, `${items.length} ekstra madde`);
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}
