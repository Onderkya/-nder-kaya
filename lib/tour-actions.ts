"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { audit } from "./audit";
import { TOURS_KEY, CODED_TOURS, tourOrder, type TourCfg } from "./tours";

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
  const cfgs = await loadCfgs();
  const i = cfgs.findIndex((c) => c.key === cfg.key);
  if (i >= 0) cfgs[i] = cfg;
  else cfgs.push(cfg);
  await saveCfgs(cfgs);
  await audit(session.email, i >= 0 ? "update" : "create", "Tour", cfg.key, cfg.custom ? "özel tur" : "kodlu tur override");
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
