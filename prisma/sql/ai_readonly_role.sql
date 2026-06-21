-- Antalya Bridge — AI asistanı için SALT-OKUNUR Postgres rolü.
--
-- Bu rol yalnızca SELECT yapabilir. INSERT/UPDATE/DELETE/DDL veritabanı
-- tarafından reddedilir; böylece AI asistanı (prompt injection dahil) hiçbir
-- koşulda veri ekleyemez/değiştiremez/silemez.
--
-- KULLANIM (sunucuda, migration'lar uygulandıktan SONRA çalıştırın):
--   1) <GUCLU_SIFRE> yerine güçlü bir parola yazın.
--   2) Veritabanı adınız 'antalya' değilse \connect satırını düzeltin.
--   3) psql ile uygulayın:
--        docker compose exec -T db psql -U antalya -d antalya -f - < prisma/sql/ai_readonly_role.sql
--   4) .env içine ekleyin (host/port compose ağına göre; uygulama içinden 'db:5432'):
--        AI_READONLY_DATABASE_URL="postgresql://ai_readonly:<GUCLU_SIFRE>@db:5432/antalya?schema=public"

-- Rolü oluştur (varsa atla).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_readonly') THEN
    CREATE ROLE ai_readonly LOGIN PASSWORD '<GUCLU_SIFRE>';
  END IF;
END
$$;

-- Bağlantı + şema kullanımı.
GRANT CONNECT ON DATABASE antalya TO ai_readonly;
GRANT USAGE ON SCHEMA public TO ai_readonly;

-- Mevcut tüm tablolarda yalnızca SELECT.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_readonly;

-- İleride eklenecek tablolarda da otomatik SELECT (DDL'i çalıştıran rol için).
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_readonly;

-- Güvenlik gereği yazma yetkilerinin asla verilmediğinden emin ol.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON ALL TABLES IN SCHEMA public FROM ai_readonly;
REVOKE CREATE ON SCHEMA public FROM ai_readonly;
