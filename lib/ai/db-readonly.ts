import { PrismaClient } from "@prisma/client";

/**
 * AI asistanı için SALT-OKUNUR sorgu çalıştırıcı.
 *
 * İki kat savunma:
 *  1) DB seviyesi (asıl güvence): bu bağlantı `AI_READONLY_DATABASE_URL` ile,
 *     yalnızca SELECT yetkisi olan `ai_readonly` Postgres rolüne bağlanır.
 *     INSERT/UPDATE/DELETE/DDL veritabanı tarafından reddedilir — prompt
 *     injection ile kandırılsa bile yazma/silme imkânsızdır.
 *  2) Uygulama seviyesi: sorgu burada da SELECT/WITH dışıysa reddedilir,
 *     çoklu statement engellenir, otomatik LIMIT uygulanır.
 *
 * Salt-okunur URL tanımlı değilse asistanın sorgu yeteneği kapalıdır.
 */

const MAX_ROWS = 500;

let roClient: PrismaClient | null = null;

export function readonlyDbAvailable(): boolean {
  return !!process.env.AI_READONLY_DATABASE_URL;
}

function getReadonlyClient(): PrismaClient {
  const url = process.env.AI_READONLY_DATABASE_URL;
  if (!url) throw new Error("AI_READONLY_DATABASE_URL is not set");
  roClient ??= new PrismaClient({ datasources: { db: { url } }, log: ["error"] });
  return roClient;
}

/** Tehlikeli (yazma/DDL) anahtar kelimeler — derinlemesine savunma için. */
const FORBIDDEN =
  /\b(insert|update|delete|drop|alter|truncate|grant|revoke|create|replace|merge|call|do|copy|vacuum|reindex|comment|lock|listen|notify|set|reset)\b/i;

export type QueryValidation = { ok: true; sql: string } | { ok: false; error: string };

/** SELECT/WITH dışındaki her şeyi reddeder, çoklu statement'i engeller, LIMIT ekler. */
export function validateSelect(raw: string): QueryValidation {
  let sql = (raw ?? "").trim();
  if (!sql) return { ok: false, error: "Boş sorgu." };

  // Sondaki tek noktalı virgülü kabul et, gerisini at.
  sql = sql.replace(/;\s*$/, "");

  // İçeride kalan noktalı virgül = çoklu statement → reddet.
  if (sql.includes(";")) return { ok: false, error: "Çoklu statement'a izin verilmiyor." };

  // SQL yorumları (--, /* */) gizli ifade taşıyabilir → reddet.
  if (/--|\/\*|\*\//.test(sql)) return { ok: false, error: "Sorguda yorum kullanılamaz." };

  // Yalnızca SELECT veya WITH ... SELECT ile başlamalı.
  if (!/^\s*(with|select)\b/i.test(sql)) {
    return { ok: false, error: "Yalnızca SELECT sorgularına izin verilir." };
  }

  // Yazma/DDL anahtar kelimeleri (derinlemesine savunma; asıl engel DB rolü).
  if (FORBIDDEN.test(sql)) {
    return { ok: false, error: "Sorgu yazma/değiştirme ifadesi içeriyor; reddedildi." };
  }

  // Otomatik LIMIT: yoksa ekle.
  if (!/\blimit\s+\d+/i.test(sql)) {
    sql = `${sql}\nLIMIT ${MAX_ROWS}`;
  }

  return { ok: true, sql };
}

/** BigInt/Date değerlerini JSON-güvenli hale getirir. */
function serialize(rows: unknown[]): Record<string, unknown>[] {
  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
      if (typeof v === "bigint") out[k] = Number(v);
      else if (v instanceof Date) out[k] = v.toISOString();
      else out[k] = v;
    }
    return out;
  });
}

export type QueryResult =
  | { ok: true; rows: Record<string, unknown>[]; rowCount: number; sql: string }
  | { ok: false; error: string };

/** Doğrula → salt-okunur rolle çalıştır → en çok MAX_ROWS satır döndür. */
export async function runSelect(raw: string): Promise<QueryResult> {
  const v = validateSelect(raw);
  if (!v.ok) return { ok: false, error: v.error };

  try {
    const client = getReadonlyClient();
    const rows = (await client.$queryRawUnsafe(v.sql)) as unknown[];
    const limited = rows.slice(0, MAX_ROWS);
    return { ok: true, rows: serialize(limited), rowCount: rows.length, sql: v.sql };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bilinmeyen veritabanı hatası";
    return { ok: false, error: msg };
  }
}
