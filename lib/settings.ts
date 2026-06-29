import { cache } from "react";
import { prisma } from "./db";

/**
 * Site ayarları — admin panelden düzenlenir, DB'de tutulur. Kod önce DB'den,
 * yoksa env'den okur. Böylece API anahtarları/iletişim değerleri rebuild
 * gerektirmeden değiştirilebilir. Sırlar yalnız sunucuda okunur.
 */

export type SettingDef = {
  key: string;
  group: string;
  label: string;
  hint?: string;
  secret?: boolean;
  /** Değer DB'de yoksa bakılacak ortam değişkeni. */
  env?: string;
};

export const SETTING_DEFS: SettingDef[] = [
  // --- Yapay Zekâ (OpenRouter) ---
  { key: "OPENROUTER_API_KEY", group: "Yapay Zekâ", label: "OpenRouter API Key", secret: true, env: "OPENROUTER_API_KEY", hint: "Hem ana sayfa sohbeti hem admin asistanı bunu kullanır." },
  { key: "OPENROUTER_MODEL", group: "Yapay Zekâ", label: "Model (varsayılan/hızlı)", env: "OPENROUTER_MODEL", hint: "örn. openai/gpt-4o-mini" },
  { key: "OPENROUTER_MODEL_SMART", group: "Yapay Zekâ", label: "Model (akıllı)", env: "OPENROUTER_MODEL_SMART", hint: "örn. anthropic/claude-3.5-sonnet" },
  { key: "AI_READONLY_DATABASE_URL", group: "Yapay Zekâ", label: "AI salt-okunur DB URL", secret: true, env: "AI_READONLY_DATABASE_URL", hint: "Admin asistanının DB sorguları için (salt-okunur kullanıcı önerilir)." },
  // --- İletişim ---
  { key: "WHATSAPP_NUMBER", group: "İletişim", label: "WhatsApp numarası", env: "NEXT_PUBLIC_WHATSAPP_NUMBER", hint: "Ülke kodlu, + ve boşluk olmadan. örn. 905551112233" },
  { key: "TELEGRAM_USERNAME", group: "İletişim", label: "Telegram kullanıcı adı", env: "NEXT_PUBLIC_TELEGRAM_USERNAME", hint: "@ olmadan" },
  { key: "CONTACT_EMAIL", group: "İletişim", label: "İletişim e-postası", env: "NEXT_PUBLIC_CONTACT_EMAIL" },
  // --- Site ---
  { key: "SITE_URL", group: "Site", label: "Site URL", env: "NEXT_PUBLIC_SITE_URL", hint: "https://alanadiniz.com — SEO/OG/canonical için." },
];

const WA_PLACEHOLDER = "905555555555";

/** Tüm DB ayarları (istek başına önbellekli). DB yoksa boş döner. */
export const getAllSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await prisma.setting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
});

/** Tek ayar: DB → env → "". */
export async function getSetting(key: string): Promise<string> {
  const all = await getAllSettings();
  const v = all[key];
  if (v != null && v !== "") return v;
  const def = SETTING_DEFS.find((d) => d.key === key);
  if (def?.env && process.env[def.env]) return process.env[def.env] as string;
  return "";
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (value === "") {
    await prisma.setting.deleteMany({ where: { key } });
  } else {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
}

/** Public (client'a güvenle gönderilebilir) iletişim/site değerleri — sır içermez. */
export async function getPublicSettings() {
  const all = await getAllSettings();
  const pick = (key: string, env: string, fallback = "") => all[key] || process.env[env] || fallback;
  const rawWa = pick("WHATSAPP_NUMBER", "NEXT_PUBLIC_WHATSAPP_NUMBER");
  const rawTg = pick("TELEGRAM_USERNAME", "NEXT_PUBLIC_TELEGRAM_USERNAME");
  return {
    whatsapp: rawWa || WA_PLACEHOLDER,
    telegram: rawTg || "antalyabridge",
    whatsappConfigured: rawWa !== "" && rawWa !== WA_PLACEHOLDER,
    telegramConfigured: rawTg !== "",
    email: pick("CONTACT_EMAIL", "NEXT_PUBLIC_CONTACT_EMAIL", "onderkya35@gmail.com"),
    url: pick("SITE_URL", "NEXT_PUBLIC_SITE_URL", "https://antalyabridge.com"),
  };
}

export type PublicSettings = Awaited<ReturnType<typeof getPublicSettings>>;
