"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { GALLERY_PREFIX, type GalleryItemCfg } from "./gallery";
import { GALLERY_DEFAULTS, type DefaultGalleryItem } from "./gallery-defaults";
import type { L10n } from "./tours";

/** Dil bazlı metni temizle: yalnız string değerleri tut, kırp; boş anahtarları at. */
function cleanL10n(v: unknown): L10n {
  const out: L10n = {};
  if (v && typeof v === "object" && !Array.isArray(v)) {
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (typeof val === "string") {
        const t = val.trim();
        if (t) out[k] = t;
      }
    }
  }
  return out;
}

/** Editörden gelen ham öğeyi bilinen alanlara indirger + doğrular. */
function cleanItem(raw: unknown): GalleryItemCfg | null {
  const s = (raw ?? {}) as Record<string, unknown>;
  if (typeof s.src !== "string" || !s.src.trim()) return null;
  if (s.type !== "image" && s.type !== "video") return null;
  const item: GalleryItemCfg = { src: s.src.trim(), type: s.type };
  if (typeof s.poster === "string" && s.poster.trim()) item.poster = s.poster.trim();
  const title = cleanL10n(s.title);
  if (Object.keys(title).length) item.title = title;
  const desc = cleanL10n(s.desc);
  if (Object.keys(desc).length) item.desc = desc;
  if (typeof s.active === "boolean") item.active = s.active;
  return item;
}

/** Varsayılan liste, GalleryItemCfg şekline indirgenir (eşdeğerlik kıyası için). */
function defaultAsCfg(items: DefaultGalleryItem[]): GalleryItemCfg[] {
  return items.map((d) => {
    const item: GalleryItemCfg = { src: d.src, type: d.type };
    if (d.poster) item.poster = d.poster;
    return item;
  });
}

/** Kararlı JSON: aynı içerik → aynı string (eşdeğerlik/boşluk kontrolü). */
function stable(items: GalleryItemCfg[]): string {
  return JSON.stringify(
    items.map((i) => ({
      src: i.src,
      type: i.type,
      poster: i.poster,
      title: i.title,
      desc: i.desc,
      active: i.active,
    })),
  );
}

/**
 * Bir bölümün galerisini kaydet. Bilinmeyen sectionId (GALLERY_DEFAULTS anahtarı
 * değilse) reddedilir. Öğeler temizlenir/doğrulanır. Liste boşsa veya varsayılana
 * eşdeğerse kayıt SİLİNİR (site varsayılana döner). requireAdmin + audit +
 * revalidatePath.
 */
export async function saveGallery(sectionId: string, items: GalleryItemCfg[]): Promise<void> {
  const session = await requireAdmin();
  if (!Object.prototype.hasOwnProperty.call(GALLERY_DEFAULTS, sectionId)) return;

  const clean = Array.isArray(items)
    ? items.map(cleanItem).filter((x): x is GalleryItemCfg => x !== null)
    : [];

  const key = GALLERY_PREFIX + sectionId;
  const isDefault = stable(clean) === stable(defaultAsCfg(GALLERY_DEFAULTS[sectionId]));

  if (clean.length === 0 || isDefault) {
    await prisma.setting.deleteMany({ where: { key } });
    revalidatePath("/", "layout"); // public (ISR) anında tazelensin
    await audit(session.email, "delete", "Gallery", sectionId, "varsayılana döndü");
    return;
  }

  const value = JSON.stringify(clean);
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/", "layout"); // public (ISR) anında tazelensin
  await audit(session.email, "update", "Gallery", sectionId, `${clean.length} öğe`);
}
