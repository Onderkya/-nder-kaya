import { cache } from "react";
import { prisma } from "./db";
import type { L10n } from "./tours";

/**
 * DİNAMİK MEDYA GALERİSİ. Sitedeki "medya + başlık" listeleri (ör. anasayfa
 * fermuar deneyimi `home.zipper`, Antalya bölgeleri `antalya.regions`) koddaki
 * VARSAYILAN listeyle kalır; admin bir bölüm için override yazarsa `Setting`
 * `gallery:<sectionId>` JSON'una kaydedilir → o bölüm dinamik listeyi kullanır.
 * Kayıt yoksa site birebir eskisi gibi görünür (bozulmaz). Bölüm id'leri
 * `lib/section-registry.ts` registry id'leriyle aynıdır (ör. `home.zipper`).
 */
export const GALLERY_PREFIX = "gallery:";

/** Galeri öğesi: medya + (opsiyonel) çok dilli başlık/alt başlık. */
export type GalleryItemCfg = {
  src: string;
  type: "image" | "video";
  poster?: string;
  title?: L10n;
  desc?: L10n;
  active?: boolean;
};

/**
 * Tüm galeri override'larını sectionId→öğeler olarak getirir (istek başına
 * önbelleğe alınır). Tek `gallery:` öneki sorgusu; bozuk JSON yok sayılır;
 * herhangi bir hata → {} (site asla bozulmaz).
 */
export const getGalleries = cache(async (): Promise<Record<string, GalleryItemCfg[]>> => {
  try {
    const rows = await prisma.setting.findMany({ where: { key: { startsWith: GALLERY_PREFIX } } });
    const out: Record<string, GalleryItemCfg[]> = {};
    for (const r of rows) {
      const id = r.key.slice(GALLERY_PREFIX.length);
      try {
        const parsed = JSON.parse(r.value);
        if (Array.isArray(parsed)) {
          out[id] = parsed.filter(
            (x): x is GalleryItemCfg =>
              x && typeof x.src === "string" && (x.type === "image" || x.type === "video"),
          );
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
