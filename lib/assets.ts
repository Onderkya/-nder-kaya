import { cache } from "react";
import { prisma } from "./db";

/**
 * Görsel/Video "override" sistemi. Canlı sayfalardaki her görsel/video isimli
 * bir SLOT (ör. `home.hero.video`). Varsayılan = koddaki mevcut dosya; admin
 * bir slot için yeni URL kaydederse ONUN üstüne yazılır. Değer yoksa varsayılan
 * kullanılır → site asla bozulmaz. Depolama: `Setting` tablosu `asset:` önekiyle
 * (düz değer; ayarların şifreleme katmanına dokunmaz).
 */
export const ASSET_PREFIX = "asset:";

/** Tüm override'ları slotId→url olarak getirir (istek başına önbelleğe alınır). */
export const getAssetMap = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: ASSET_PREFIX } } });
    return Object.fromEntries(rows.map((r) => [r.key.slice(ASSET_PREFIX.length), r.value]));
  } catch {
    return {};
  }
});

/** Override varsa onu, yoksa varsayılanı döndürür. */
export function pickAsset(map: Record<string, string>, slotId: string, def: string): string {
  const v = map[slotId];
  return v && v.trim() ? v : def;
}

/**
 * Tekil medya slotu göster/gizle. Varsayılan: GÖSTERİLİR. Admin bir slotu
 * gizlerse `Setting` `assetoff:<slot>` = "1" kaydedilir → public sayfa o medyayı
 * render etmez. Ayrı anahtar tutulur ki özel URL override'ı (`asset:<slot>`)
 * gizle/göster döngülerinde KORUNUR. Kayıt yoksa görünür (site asla bozulmaz).
 */
export const ASSET_OFF_PREFIX = "assetoff:";

/** Gizlenmiş slot id'lerini getirir (istek başına önbelleğe alınır; hata → boş Set). */
export const getHiddenAssetSet = cache(async (): Promise<Set<string>> => {
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: ASSET_OFF_PREFIX } } });
    return new Set(rows.filter((r) => r.value === "1").map((r) => r.key.slice(ASSET_OFF_PREFIX.length)));
  } catch {
    return new Set();
  }
});

/** Slot gizliyse null, değilse `pickAsset` sonucu (override veya varsayılan). */
export function pickAssetVisible(map: Record<string, string>, hidden: Set<string>, slotId: string, def: string): string | null {
  return hidden.has(slotId) ? null : pickAsset(map, slotId, def);
}
