import { fas } from "@fortawesome/free-solid-svg-icons";

/**
 * FONT AWESOME KATALOĞU — SERVER-ONLY (yalnız API route'tan çağrılır).
 * `@fortawesome/free-solid-svg-icons` yalnız veri paketidir; buradan çıkardığımız
 * düz `{ name, viewBox, paths, terms }[]` client'a JSON olarak (API route üzerinden)
 * geçer — paket client bundle'a GİRMEZ (fa-icon.tsx ile aynı desen).
 *
 * `name` = saklama biçimi (`fa:faPlane`) ile birebir; `fa:` öneki API'de eklenir.
 * Her iconName için KANONİK anahtar seçilir: `fa` + PascalCase(iconName) (ör.
 * "person-swimming" → "faPersonSwimming"). Bu anahtar tüm FA setinde mevcuttur.
 */
export type IconCatalogEntry = { name: string; viewBox: string; paths: string[]; terms: string[] };

const pascal = (iconName: string): string =>
  "fa" + iconName.split("-").map((s) => (s ? s[0].toUpperCase() + s.slice(1) : "")).join("");

let CACHE: IconCatalogEntry[] | null = null;

/** Tüm solid ikonların serileştirilebilir kataloğu (modül kapsamında önbelleğe alınır). */
export function getIconCatalog(): IconCatalogEntry[] {
  if (CACHE) return CACHE;
  const byName = new Map<string, string>(); // iconName -> chosen key
  const all = fas as Record<string, { icon?: unknown; iconName?: string }>;
  for (const [key, def] of Object.entries(all)) {
    if (!def?.icon || !def.iconName) continue;
    // Kanonik anahtarı tercih et; yoksa ilk gördüğümüz anahtarı kullan.
    const canonical = pascal(def.iconName);
    if (!byName.has(def.iconName)) byName.set(def.iconName, all[canonical] ? canonical : key);
    else if (key === canonical) byName.set(def.iconName, canonical);
  }

  const items: IconCatalogEntry[] = [];
  for (const [iconName, key] of byName) {
    const def = all[key];
    const icon = def.icon as [number, number, string[] | undefined, unknown, string | string[]];
    const [w, h, aliases, , pathData] = icon;
    items.push({
      name: `fa:${key}`,
      viewBox: `0 0 ${w} ${h}`,
      paths: Array.isArray(pathData) ? pathData : [pathData],
      // Arama terimleri: iconName kelimeleri + FA search terimleri (varsa).
      terms: [...iconName.split("-"), ...(Array.isArray(aliases) ? aliases : [])],
    });
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  CACHE = items;
  return items;
}
