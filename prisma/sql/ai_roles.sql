-- Antalya Bridge — AI asistanı için Postgres rolleri.
--
-- İki rol:
--   ai_readonly  : yalnızca SELECT (analiz/sorgulama)
--   ai_readwrite : SELECT + INSERT + UPDATE  (ASLA DELETE/TRUNCATE/DDL yok)
--
-- Böylece AI (prompt injection dahil) hiçbir koşulda veri SİLEMEZ; yazma da
-- yalnızca yöneticinin panelde onayladığı INSERT/UPDATE ile sınırlıdır. Uygulama
-- katmanı ayrıca hassas tabloları (User, AuditLog, PaymentMethod) yazıma kapatır.
--
-- KULLANIM (migration'lar uygulandıktan SONRA):
--   1) <RO_SIFRE> ve <RW_SIFRE> yerine güçlü parolalar yazın.
--   2) Veritabanı adınız 'antalya' değilse aşağıdaki adı düzeltin.
--   3) Uygulayın:
--        docker compose exec -T db psql -U antalya -d antalya -f - < prisma/sql/ai_roles.sql
--   4) .env'e ekleyin (uygulama içinden host 'db:5432'):
--        AI_READONLY_DATABASE_URL="postgresql://ai_readonly:<RO_SIFRE>@db:5432/antalya?schema=public"
--        AI_READWRITE_DATABASE_URL="postgresql://ai_readwrite:<RW_SIFRE>@db:5432/antalya?schema=public"
--   (Yazmayı hiç istemiyorsanız ai_readwrite'ı oluşturmayın ve URL'i boş bırakın.)

-- === Roller ===
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_readonly') THEN
    CREATE ROLE ai_readonly LOGIN PASSWORD '<RO_SIFRE>';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_readwrite') THEN
    CREATE ROLE ai_readwrite LOGIN PASSWORD '<RW_SIFRE>';
  END IF;
END
$$;

-- === ai_readonly: yalnızca okuma ===
GRANT CONNECT ON DATABASE antalya TO ai_readonly;
GRANT USAGE ON SCHEMA public TO ai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_readonly;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON ALL TABLES IN SCHEMA public FROM ai_readonly;
REVOKE CREATE ON SCHEMA public FROM ai_readonly;

-- === ai_readwrite: okuma + ekleme/güncelleme (silme/DDL YOK) ===
GRANT CONNECT ON DATABASE antalya TO ai_readwrite;
GRANT USAGE ON SCHEMA public TO ai_readwrite;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO ai_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO ai_readwrite;
-- Diziler (cuid kullanılıyor ama yine de güvenli olsun):
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ai_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ai_readwrite;
-- Silme ve şema değişikliği KESİNLİKLE verilmez:
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM ai_readwrite;
REVOKE CREATE ON SCHEMA public FROM ai_readwrite;
