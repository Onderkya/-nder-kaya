/**
 * AI asistanı salt-okuma doğrulamasının testi (bağımsız çalışır).
 * Çalıştır:  npx tsx scripts/test-ai-readonly.ts
 */
import assert from "node:assert";
import { validateSelect } from "../lib/ai/db-readonly";

let pass = 0;
function ok(name: string, cond: boolean) {
  assert(cond, `BAŞARISIZ: ${name}`);
  pass++;
}

// İzin verilenler
ok("basit SELECT geçer", validateSelect('SELECT * FROM "Lead"').ok);
ok("WITH ... SELECT geçer", validateSelect('WITH x AS (SELECT 1) SELECT * FROM x').ok);
ok("sondaki ; temizlenir", validateSelect('SELECT 1;').ok);

// Otomatik LIMIT
const lim = validateSelect('SELECT * FROM "Lead"');
ok("LIMIT yoksa eklenir", lim.ok && /limit\s+\d+/i.test(lim.sql));
const lim2 = validateSelect('SELECT * FROM "Lead" LIMIT 5');
ok("mevcut LIMIT korunur", lim2.ok && /limit\s+5/i.test(lim2.sql));

// Reddedilenler
ok("DELETE reddedilir", !validateSelect('DELETE FROM "Lead"').ok);
ok("UPDATE reddedilir", !validateSelect('UPDATE "Lead" SET name=\'x\'').ok);
ok("INSERT reddedilir", !validateSelect('INSERT INTO "Lead" (name) VALUES (\'x\')').ok);
ok("DROP reddedilir", !validateSelect('DROP TABLE "Lead"').ok);
ok("çoklu statement reddedilir", !validateSelect('SELECT 1; DROP TABLE "Lead"').ok);
ok("yorum reddedilir", !validateSelect('SELECT 1 -- yorum').ok);
ok("blok yorum reddedilir", !validateSelect('SELECT /* x */ 1').ok);
ok("SELECT içine gizli yazma reddedilir", !validateSelect('SELECT 1; UPDATE "User" SET role=\'ADMIN\'').ok);
ok("boş sorgu reddedilir", !validateSelect("   ").ok);

// "created_at" gibi kolon adı yanlışlıkla engellenmemeli
ok('"createdAt" kolonu engellenmez', validateSelect('SELECT "createdAt" FROM "Lead"').ok);

console.log(`\n✅ ${pass} test geçti.`);
