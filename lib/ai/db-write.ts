import { PrismaClient } from "@prisma/client";

/**
 * AI asistanı için GÜVENLİ YAZMA katmanı — sadece INSERT/UPDATE.
 *
 * Güvenlik (üç kat):
 *  1) DB rolü: `ai_readwrite` rolünde SELECT/INSERT/UPDATE var; DELETE/TRUNCATE/DDL
 *     YOK → silme veritabanı tarafından reddedilir (bkz. prisma/sql/ai_roles.sql).
 *  2) İfade doğrulama: yalnızca tek bir INSERT veya UPDATE; DELETE/DDL/çoklu
 *     statement/yorum reddedilir.
 *  3) Tablo beyaz listesi: hassas tablolar (User, AuditLog, PaymentMethod) AI
 *     yazımına KAPALI — kripto cüzdan/ödeme bütünlüğü ve yetki yükseltme korunur.
 *  + Her yazma, admin tarafından UI'da AÇIKÇA ONAYLANDIKTAN sonra uygulanır.
 */

let rwClient: PrismaClient | null = null;

export function readwriteDbAvailable(): boolean {
  return !!process.env.AI_READWRITE_DATABASE_URL;
}

function getReadwriteClient(): PrismaClient {
  const url = process.env.AI_READWRITE_DATABASE_URL;
  if (!url) throw new Error("AI_READWRITE_DATABASE_URL is not set");
  rwClient ??= new PrismaClient({ datasources: { db: { url } }, log: ["error"] });
  return rwClient;
}

/** AI'ın yazabileceği tablolar. Hassas tablolar bilinçli olarak DIŞARIDA. */
export const WRITABLE_TABLES = new Set([
  "Lead",
  "PromoCode",
  "SiteText",
  "LessonType",
  "Service",
  "AvailabilitySlot",
  "Section",
  "ContentBlock",
  "Translation",
  "Media",
  "Page",
]);

// NOT: "SET" listede yok — UPDATE ... SET meşrudur. Silme/DDL/çoklu komut hedeflenir.
const FORBIDDEN_WRITE =
  /\b(delete|drop|alter|truncate|grant|revoke|create|replace|merge|copy|vacuum|reindex|comment|listen|notify|select\s+into)\b/i;

export type WriteValidation = { ok: true; sql: string; table: string } | { ok: false; error: string };

/** Tek bir INSERT/UPDATE'i doğrular; DELETE ve hassas tabloları reddeder. */
export function validateWrite(raw: string): WriteValidation {
  let sql = (raw ?? "").trim();
  if (!sql) return { ok: false, error: "Boş ifade." };
  sql = sql.replace(/;\s*$/, "");
  if (sql.includes(";")) return { ok: false, error: "Çoklu statement'a izin verilmiyor." };
  if (/--|\/\*|\*\//.test(sql)) return { ok: false, error: "Yorum kullanılamaz." };

  const isInsert = /^\s*insert\s+into\s+/i.test(sql);
  const isUpdate = /^\s*update\s+/i.test(sql);
  if (!isInsert && !isUpdate) {
    return { ok: false, error: "Yalnızca INSERT veya UPDATE ifadelerine izin verilir." };
  }
  if (FORBIDDEN_WRITE.test(sql)) {
    return { ok: false, error: "İfade silme/DDL içeriyor; reddedildi." };
  }

  // Hedef tabloyu çıkar ve beyaz listeye karşı doğrula.
  const m = isInsert
    ? sql.match(/^\s*insert\s+into\s+"?(\w+)"?/i)
    : sql.match(/^\s*update\s+(?:only\s+)?"?(\w+)"?/i);
  const table = m?.[1];
  if (!table) return { ok: false, error: "Hedef tablo belirlenemedi." };
  if (!WRITABLE_TABLES.has(table)) {
    return { ok: false, error: `"${table}" tablosuna AI yazımı kapalı (hassas tablo).` };
  }

  return { ok: true, sql, table };
}

export type WriteResult = { ok: true; affected: number; sql: string } | { ok: false; error: string };

/** Doğrula → ai_readwrite rolüyle uygula. Yalnızca onaylanmış çağrılarda kullanılır. */
export async function runWrite(raw: string): Promise<WriteResult> {
  const v = validateWrite(raw);
  if (!v.ok) return { ok: false, error: v.error };
  try {
    const client = getReadwriteClient();
    const affected = await client.$executeRawUnsafe(v.sql);
    return { ok: true, affected, sql: v.sql };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen veritabanı hatası";
    return { ok: false, error: msg };
  }
}
