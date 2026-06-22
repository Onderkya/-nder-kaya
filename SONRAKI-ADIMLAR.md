# SONRAKI ADIMLAR — Antalya Bridge

> Bu dosya, başka bir chat'ten / PC'den **tek bakışta devam** etmek için kısa
> checklist'tir. Tüm detaylar için → **`DEVIR.md`**.

**Durum:** Kod hazır ve `Onderkya/-nder-kaya` reposunun
`claude/consulting-site-plan-6k4lix` dalında. Kalan tek iş: kodu yeni private
repoya taşımak ve lokalde çalıştırmak.

---

## ✅ Adım 0 — Yeni private repoyu oluştur (PC)

> Not: Bulut ortamı repo oluşturma yetkisine sahip değil, bu yüzden sen
> oluşturacaksın (tek seferlik).

- [ ] GitHub web → **New repository** → ad: `antalyabridge-web` → **Private** →
  README **ekleme** (boş bırak) → **Create**.

veya `gh` CLI ile:
```bash
gh repo create Onderkya/antalyabridge-web --private --description "Antalya Bridge — çok dilli danışmanlık + ödeme/rezervasyon platformu (Next.js)"
```

---

## ✅ Adım 1 — Kodu yeni repoya taşı (PC)

- [ ] Aşağıdaki bloğu çalıştır:
```bash
git clone https://github.com/Onderkya/-nder-kaya.git antalyabridge-web
cd antalyabridge-web
git checkout claude/consulting-site-plan-6k4lix
git branch -m claude/consulting-site-plan-6k4lix main   # yeni repoda 'main' olsun
git remote set-url origin https://github.com/Onderkya/antalyabridge-web.git
git push -u origin main
```

---

## ✅ Adım 2 — Lokalde çalıştır

- [ ] `.env` hazırla ve **ZORUNLU 5 değişkeni** doldur:
```bash
cp .env.example .env
```
| Değişken | Not |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantısı |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `ADMIN_EMAIL` | İlk admin e-postası |
| `ADMIN_PASSWORD` | ≥12 karakter |
| `NEXT_PUBLIC_SITE_URL` | ör. `http://localhost:3000` |

- [ ] Bağımlılıklar + veritabanı + çalıştır:
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev          # http://localhost:3000  (admin: /admin)
```

PostgreSQL yoksa hızlı kaldır:
```bash
docker run --name antalya-pg -e POSTGRES_USER=antalya -e POSTGRES_PASSWORD=antalya -e POSTGRES_DB=antalya -p 5432:5432 -d postgres:16
```

---

## ⏳ Adım 3 — Opsiyonel servisleri aç (gerektikçe)

Hepsi *graceful*: anahtar yoksa o özellik kapalı çalışır.

- [ ] **E-posta bildirimi** — `SMTP_*`, `NOTIFY_EMAIL`
- [ ] **Telegram bot/bildirim** — `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`
- [ ] **Captcha** — `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`
- [ ] **Redis rate-limit** — `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] **PII şifreleme** — `PII_ENCRYPTION_KEY` (`openssl rand -base64 32`)
- [ ] **AI** — `ANTHROPIC_API_KEY` (bot), `OPENROUTER_API_KEY` (admin asistanı)

Detay → `.env.example` ve `DEVIR.md` §6.

---

## ⏳ Adım 4 — Deploy (hazır olunca)

- [ ] Üretim `.env` değerlerini doldur → `docker compose up -d --build`
  (web + postgres; migration + seed otomatik).
- [ ] Domain + SSL + Cryptomus:
  `deploy/SUNUCU-KURULUM.md` ve `deploy/ODEME-KURULUM.md`.

---

## 💬 Yeni chat'e ilk mesaj

`DEVIR.md` §9'daki hazır paragrafı kopyalayıp yeni Claude Code chat'ine ilk
mesaj olarak ver; sonuna ne yapmak istediğini ekle.

---

**Tam detaylar → `DEVIR.md`**
