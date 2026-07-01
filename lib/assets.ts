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
