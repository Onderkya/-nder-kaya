"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { TOURS_KEY, CODED_TOURS, tourOrder, type TourCfg, type TourStepCfg, type L10n } from "./tours";

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

/** Adım dizisini doğrula: gün int≥1, icon string, active boolean, metinler L10n. */
function cleanSteps(v: unknown): TourStepCfg[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map((raw) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const step: TourStepCfg = {
      day: Math.max(1, Math.floor(Number(s.day)) || 1),
      t: cleanL10n(s.t),
      d: cleanL10n(s.d),
    };
    if (typeof s.icon === "string" && s.icon.trim()) step.icon = s.icon.trim();
    if (typeof s.active === "boolean") step.active = s.active;
    return step;
  });
}

/** "Pakete dahil" dizisini doğrula: icon string, label L10n, active boolean. */
function cleanIncluded(v: unknown): TourCfg["included"] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.map((raw) => {
    const s = (raw ?? {}) as Record<string, unknown>;
    const item: NonNullable<TourCfg["included"]>[number] = {
      icon: typeof s.icon === "string" && s.icon.trim() ? s.icon.trim() : "check",
      label: cleanL10n(s.label),
    };
    if (typeof s.active === "boolean") item.active = s.active;
    return item;
  });
}

/** Editörden gelen ham cfg'yi bilinen alanlara indirger + doğrular (geriye uyumlu). */
function sanitizeCfg(raw: TourCfg): TourCfg {
  const out: TourCfg = { key: raw.key };
  if (typeof raw.custom === "boolean") out.custom = raw.custom;
  if (typeof raw.active === "boolean") out.active = raw.active;
  if (typeof raw.order === "number") out.order = raw.order;
  if (typeof raw.img === "string") out.img = raw.img.trim();
  if (raw.name) out.name = cleanL10n(raw.name);
  if (raw.aud) out.aud = cleanL10n(raw.aud);
  if (raw.days != null) out.days = Math.max(1, Math.floor(Number(raw.days)) || 1);
  if (raw.stars != null) out.stars = Math.min(5, Math.max(1, Math.floor(Number(raw.stars)) || 5));
  if (typeof raw.hotel === "string") out.hotel = raw.hotel.trim();
  if (typeof raw.loc === "string") out.loc = raw.loc.trim();
  if (raw.hotelWhy) out.hotelWhy = cleanL10n(raw.hotelWhy);
  if (raw.hotelNote) out.hotelNote = cleanL10n(raw.hotelNote);
  const steps = cleanSteps(raw.steps);
  if (steps) out.steps = steps;
  const included = cleanIncluded(raw.included);
  if (included) out.included = included;
  return out;
}

async function loadCfgs(): Promise<TourCfg[]> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: TOURS_KEY } });
    const parsed = row?.value ? JSON.parse(row.value) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.key === "string") : [];
  } catch {
    return [];
  }
}

async function saveCfgs(cfgs: TourCfg[]): Promise<void> {
  const value = JSON.stringify(cfgs);
  await prisma.setting.upsert({ where: { key: TOURS_KEY }, update: { value }, create: { key: TOURS_KEY, value } });
  revalidatePath("/", "layout"); // public (ISR) anında tazelensin
  revalidatePath("/admin/tours");
}

/** Tek turun ayarlarını kaydet (editörden JSON gelir). */
export async function saveTour(json: string): Promise<void> {
  const session = await requireAdmin();
  let cfg: TourCfg;
  try {
    cfg = JSON.parse(json);
  } catch {
    return;
  }
  if (!cfg?.key || typeof cfg.key !== "string") return;
  const clean = sanitizeCfg(cfg);
  const cfgs = await loadCfgs();
  const i = cfgs.findIndex((c) => c.key === clean.key);
  if (i >= 0) cfgs[i] = clean;
  else cfgs.push(clean);
  await saveCfgs(cfgs);
  const detail = [
    clean.custom ? "özel tur" : "kodlu tur override",
    clean.steps ? `${clean.steps.length} adım` : null,
    clean.included ? `${clean.included.length} dahil` : null,
  ].filter(Boolean).join(", ");
  await audit(session.email, i >= 0 ? "update" : "create", "Tour", clean.key, detail);
}

/** Aktif/pasif. */
export async function toggleTour(key: string, active: boolean): Promise<void> {
  const session = await requireAdmin();
  const cfgs = await loadCfgs();
  const i = cfgs.findIndex((c) => c.key === key);
  if (i >= 0) cfgs[i].active = active;
  else cfgs.push({ key, active });
  await saveCfgs(cfgs);
  await audit(session.email, "toggle", "Tour", key, active ? "aktif" : "pasif");
}

/** Sırada yukarı/aşağı taşı. Tüm turların (kodlu+özel) birleşik sırasında çalışır. */
export async function moveTour(key: string, dir: -1 | 1): Promise<void> {
  const session = await requireAdmin();
  const cfgs = await loadCfgs();
  const byKey = new Map(cfgs.map((c) => [c.key, c]));
  // Birleşik anahtar listesi: kodlular + cfg'de olup kodlu olmayanlar (özel).
  const keys = [
    ...CODED_TOURS.map((c) => c.key),
    ...cfgs.filter((c) => !CODED_TOURS.some((k) => k.key === c.key)).map((c) => c.key),
  ];
  keys.sort((a, b) => tourOrder(byKey.get(a), a) - tourOrder(byKey.get(b), b));
  const i = keys.indexOf(key);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= keys.length) return;
  [keys[i], keys[j]] = [keys[j], keys[i]];
  // Yeni sırayı herkese yaz (cfg yoksa oluştur).
  const next: TourCfg[] = keys.map((k, idx) => {
    const c = byKey.get(k) ?? { key: k };
    return { ...c, order: idx };
  });
  await saveCfgs(next);
  await audit(session.email, "update", "Tour", key, `sıra ${dir === -1 ? "yukarı" : "aşağı"}`);
}

/** Özel turu tamamen sil (kodlular silinmez — pasif yapılır). */
export async function deleteTour(key: string): Promise<void> {
  const session = await requireAdmin();
  if (CODED_TOURS.some((c) => c.key === key)) return;
  const cfgs = (await loadCfgs()).filter((c) => c.key !== key);
  await saveCfgs(cfgs);
  await audit(session.email, "delete", "Tour", key);
}
