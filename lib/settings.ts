import crypto from "crypto";
import { cache } from "react";
import { prisma } from "./db";

/**
 * Sırların at-rest şifrelenmesi (AES-256-GCM). Anahtar `SETTINGS_KEY` ya da
 * (yoksa) `AUTH_SECRET`'ten türetilir. Anahtar yoksa düz metin saklanır (geri
 * uyum). Böylece DB yedeği ele geçse bile şifreli sırlar okunamaz.
 */
const ENC_PREFIX = "enc:v1:";
function encKey(): Buffer | null {
  const s = process.env.SETTINGS_KEY || process.env.AUTH_SECRET;
  return s ? crypto.createHash("sha256").update(s).digest() : null;
}
function encryptSecret(plain: string): string {
  const key = encKey();
  if (!key) return plain;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  const tag = c.getAuthTag();
  return ENC_PREFIX + [iv, tag, ct].map((b) => b.toString("base64")).join(":");
}
function decryptSecret(stored: string): string {
  if (!stored?.startsWith(ENC_PREFIX)) return stored;
  const key = encKey();
  if (!key) return stored;
  try {
    const parts = stored.split(":"); // ["enc","v1",iv,tag,ct]
    const iv = Buffer.from(parts[2], "base64");
    const tag = Buffer.from(parts[3], "base64");
    const ct = Buffer.from(parts[4], "base64");
    const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
  } catch {
    return stored;
  }
}

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
    return Object.fromEntries(rows.map((r) => [r.key, decryptSecret(r.value)]));
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
    // Sır tipindeki ayarlar at-rest şifrelenir; diğerleri düz saklanır.
    const def = SETTING_DEFS.find((d) => d.key === key);
    const stored = def?.secret ? encryptSecret(value) : value;
    await prisma.setting.upsert({ where: { key }, update: { value: stored }, create: { key, value: stored } });
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
