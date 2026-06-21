import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Kişisel veri (PII: e-posta/telefon) için uygulama düzeyinde şifreleme.
 * AES-256-GCM (kimlik doğrulamalı). Anahtar: PII_ENCRYPTION_KEY ortam değişkeni.
 *
 * Graceful & geriye dönük uyumlu:
 * - Anahtar yoksa değerler DÜZ METİN saklanır (mevcut davranış korunur).
 * - Şifreli değerler "enc:v1:" önekiyle işaretlenir; bu önek yoksa değer eski
 *   düz-metin kayıt kabul edilir ve olduğu gibi döndürülür. Böylece anahtar
 *   sonradan eklendiğinde eski kayıtlar okunmaya devam eder.
 *
 * Not: Şifreleme rastgele IV ile non-deterministiktir → e-posta ile arama/eşleme
 * yapılamaz (Lead/Invoice'ta gerek yok). AI salt-okunur asistanı ham DB'yi
 * okuduğundan şifreli alanları ciphertext görür (PII ona da kapalı kalır).
 */
const PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const raw = process.env.PII_ENCRYPTION_KEY;
  if (!raw) return null;
  // Herhangi bir parolayı 32 baytlık anahtara indirger.
  return createHash("sha256").update(raw).digest();
}

export function encryptPII(value: string | null | undefined): string | null {
  if (value == null || value === "") return value ?? null;
  if (value.startsWith(PREFIX)) return value; // zaten şifreli
  const key = getKey();
  if (!key) return value; // anahtar yok → düz metin (graceful)
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

export function decryptPII(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (!value.startsWith(PREFIX)) return value; // eski düz-metin kayıt
  const key = getKey();
  if (!key) return value; // anahtar yok → çözemeyiz, ham bırak
  try {
    const buf = Buffer.from(value.slice(PREFIX.length), "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return value; // bozuk/yanlış anahtar → ham bırak
  }
}
