import type { AbstractIntlMessages } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { prisma } from "./db";

type Json = Record<string, unknown>;

/** İç içe JSON'u noktalı anahtarlara düzleştirir: { home: { x } } -> { "home.x" } */
export function flatten(obj: Json, prefix = "", out: Record<string, string> = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v as Json, key, out);
    } else {
      out[key] = String(v);
    }
  }
  return out;
}

/** Noktalı anahtarı iç içe nesneye yazar. */
function setDeep(obj: Json, key: string, value: string) {
  const parts = key.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== "object" || cur[p] === null) cur[p] = {};
    cur = cur[p] as Json;
  }
  cur[parts[parts.length - 1]] = value;
}

async function loadBase(locale: string): Promise<Json> {
  return (await import(`../messages/${locale}.json`)).default;
}

/** Bir locale'in düzleştirilmiş varsayılan (dosya) değerleri. */
export async function loadBaseFlat(locale: string): Promise<Record<string, string>> {
  return flatten(await loadBase(locale));
}

/** Belirli locale için temel JSON + DB override'larını birleştirir. */
export async function getMergedMessages(locale: string): Promise<AbstractIntlMessages> {
  const base = await loadBase(locale);
  try {
    const overrides = await prisma.siteText.findMany({ where: { locale } });
    if (overrides.length === 0) return base as AbstractIntlMessages;
    const merged: Json = structuredClone(base);
    for (const o of overrides) setDeep(merged, o.key, o.value);
    return merged as AbstractIntlMessages;
  } catch {
    // DB yoksa (örn. build anı) varsayılanları kullan.
    return base as AbstractIntlMessages;
  }
}

/** Admin editörü için: tüm anahtarlar (en'den), her locale'in mevcut değeri. */
export async function getEditableTexts() {
  const enBase = flatten(await loadBase("en"));
  const keys = Object.keys(enBase);

  const bases: Record<string, Record<string, string>> = {};
  for (const l of routing.locales) bases[l] = flatten(await loadBase(l));

  let overrides: { key: string; locale: string; value: string }[] = [];
  try {
    overrides = await prisma.siteText.findMany();
  } catch {
    overrides = [];
  }
  const ovMap = new Map(overrides.map((o) => [`${o.locale}:${o.key}`, o.value]));

  return keys.map((key) => ({
    key,
    values: Object.fromEntries(
      routing.locales.map((l) => [
        l,
        ovMap.get(`${l}:${key}`) ?? bases[l][key] ?? bases.en[key] ?? "",
      ])
    ) as Record<Locale, string>,
    overridden: routing.locales.some((l) => ovMap.has(`${l}:${key}`)),
  }));
}
