# DEVİR / HANDOFF — Antalya Bridge

> Bu dosya, projeyi **bu chat'ten PC'deki yeni bir chat'e / ortama** taşımak
> için hazırlandı. Tüm adımlar kopyala-yapıştır çalışacak şekilde yazıldı.
> Tarih: 2026-06-21

---

## 1. Proje özeti

**Antalya Bridge** — çok dilli danışmanlık platformu: Antalya seyahat
danışmanlığı, online Türkçe dersleri ve Türkiye'de eğitim rehberliği. Hedef
kitle yurtdışı misafirler (Kazakistan, Rusya, Özbekistan vb.).

**Teknoloji:** TypeScript · Next.js 15 (App Router) · PostgreSQL · Prisma 6 ·
Tailwind CSS · next-intl (5 dil: tr/en/ru/kk/uz) · Anthropic SDK (Claude bot) ·
OpenRouter (admin AI asistanı).

---

## 2. Mevcut durum — neler yapıldı

- **Public site** (5 dil, Akdeniz teması, açık/koyu mod): ana sayfa, hizmetler,
  Türkçe dersleri + rezervasyon widget'ı, iletişim formu, SEO/AI bulunabilirlik
  (JSON-LD, sitemap, robots.txt, llms.txt, hreflang).
- **Admin panel** (`/admin`): içerik/CMS, medya, talepler (leads), rezervasyonlar,
  indirim kodları (promos), ödemeler, faturalar, AI asistan ve konuşmalar.
- **Ödeme & fatura:** Cryptomus kripto ödeme + Kaspi, fatura üretimi.
- **Bildirim:** iletişim/rezervasyon talebinde **e-posta + Telegram** bildirimi.
- **Bilgilendirme botu** (Claude, Telegram webhook).
- **Son güvenlik sertleştirmeleri** (hepsi *graceful* — anahtar yoksa eski
  davranışa döner):
  1. **Cloudflare Turnstile** captcha (contact + booking formları); anahtar
     yoksa honeypot + rate-limit ile korunur.
  2. **Atomik promo kullanımı** + opsiyonel **Upstash Redis** rate-limit (çok
     instance için ortak sayaç; yoksa bellek-içi).
  3. **PII şifreleme** — `PII_ENCRYPTION_KEY` tanımlıysa Lead/Invoice e-posta &
     telefonları DB'de AES-256-GCM ile şifrelenir.

---

## 3. Kod nerede

- **Mevcut repo:** `Onderkya/-nder-kaya`
- **Çalışılan dal:** `claude/consulting-site-plan-6k4lix` (tüm güncel kod burada)
- **Hedef yeni private repo:** `Onderkya/antalyabridge-web` (henüz **yok**, aşağıda
  oluşturma adımları var)

---

## 4. Yeni private repoya taşıma (PC'de)

> Not: Bu bulut ortamı yeni repo oluşturma yetkisine sahip değil, bu yüzden repoyu
> sen oluşturacaksın. Tek seferlik ve temiz bir işlem.

### 4.1. Boş private repoyu oluştur
GitHub web'de: **New repository** → ad: `antalyabridge-web` → **Private** seç →
**README ekleme** (boş bırak, "Add a README" işaretleme) → Create.

Veya `gh` CLI ile:
```bash
gh repo create Onderkya/antalyabridge-web --private --description "Antalya Bridge — çok dilli danışmanlık + ödeme/rezervasyon platformu (Next.js)"
```

### 4.2. Mevcut kodu klonla ve yeni repoya taşı
```bash
git clone https://github.com/Onderkya/-nder-kaya.git antalyabridge-web
cd antalyabridge-web
git checkout claude/consulting-site-plan-6k4lix
git branch -m claude/consulting-site-plan-6k4lix main      # yeni repoda 'main' olsun
git remote set-url origin https://github.com/Onderkya/antalyabridge-web.git
git push -u origin main
```
İstersen tüm dalları + etiketleri taşı: `git push origin --all && git push origin --tags`.

---

## 5. PC'de çalıştırma (lokal geliştirme)

```bash
cp .env.example .env          # değerleri doldur (en az aşağıdaki ZORUNLU'lar)
npm install
npm run prisma:generate
npm run prisma:migrate        # PostgreSQL ayakta olmalı (DATABASE_URL)
npm run db:seed               # admin kullanıcı + temel kayıtlar
npm run dev                   # http://localhost:3000
```

- Public site: `http://localhost:3000/tr` (veya `/en`, `/ru`, `/kk`, `/uz`)
- Admin panel: `http://localhost:3000/admin` (seed e-posta/şifre ile)
- Build kontrol: `npm run build` · Tip kontrol: `npm run typecheck`

PostgreSQL'i hızlıca Docker ile kaldırmak istersen:
```bash
docker run --name antalya-pg -e POSTGRES_USER=antalya -e POSTGRES_PASSWORD=antalya -e POSTGRES_DB=antalya -p 5432:5432 -d postgres:16
```

---

## 6. Ortam değişkenleri (`.env`)

Tam liste ve açıklamalar `.env.example` içinde. Özet:

### ZORUNLU
| Değişken | Açıklama |
|---|---|
| `DATABASE_URL` | PostgreSQL bağlantısı |
| `AUTH_SECRET` | Admin oturum sırrı — `openssl rand -base64 32` |
| `ADMIN_EMAIL` | İlk admin (seed) e-postası |
| `ADMIN_PASSWORD` | İlk admin şifresi (≥12 karakter, tahmin edilemez) |
| `NEXT_PUBLIC_SITE_URL` | Sitenin tam URL'i |

### OPSİYONEL (boşsa ilgili özellik graceful kapanır)
| Grup | Değişkenler |
|---|---|
| E-posta bildirimi | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `NOTIFY_EMAIL` |
| Telegram bot/bildirim | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET` |
| Captcha | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| Rate-limit (Redis) | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| PII şifreleme | `PII_ENCRYPTION_KEY` (`openssl rand -base64 32`) |
| Claude botu | `ANTHROPIC_API_KEY` |
| Admin AI asistanı | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_MODEL_SMART` |
| Admin AI DB rolleri | `AI_READONLY_DATABASE_URL`, `AI_READWRITE_DATABASE_URL` |
| Sosyal/iletişim | `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_TELEGRAM`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_INSTAGRAM`, `NEXT_PUBLIC_TIKTOK`, `NEXT_PUBLIC_FACEBOOK`, `NEXT_PUBLIC_YOUTUBE` |

> `PII_ENCRYPTION_KEY` UYARISI: sonradan değiştirme/silme, o anahtarla yazılmış
> kayıtların okunmasını engeller. Eski düz-metin kayıtlar anahtar eklendikten
> sonra da okunur.

---

## 7. Üretim / deploy

- Hızlı: `cp .env.example .env` (üretim değerleri) → `docker compose up -d --build`
  (web + postgres; migration + seed otomatik).
- Ayrıntılı sunucu kurulumu: **`deploy/SUNUCU-KURULUM.md`** (nginx + SSL:
  `deploy/nginx-antalyabridge.conf`).
- Ödeme/Cryptomus kurulumu: **`deploy/ODEME-KURULUM.md`**.
- Telegram webhook:
  ```bash
  curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<DOMAIN>/api/bot/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
  ```

---

## 8. Açık / sonraki işler

- [ ] Yeni private repoyu oluştur ve kodu taşı (bkz. §4) — şu ana kadar henüz PR açılmadı.
- [ ] Üretim `.env` değerlerini doldur (özellikle ZORUNLU'lar + kullanacağın opsiyonel servisler).
- [ ] İsteğe bağlı servisleri etkinleştir: Turnstile, SMTP, Telegram, Redis, PII anahtarı, AI anahtarları.
- [ ] Domain + SSL kurulumu (`deploy/SUNUCU-KURULUM.md`).

---

## 9. PC'deki yeni chat'e yapıştırılacak ilk mesaj

> Aşağıdaki paragrafı kopyalayıp PC'deki Claude Code chat'ine ilk mesaj olarak ver:

```
Antalya Bridge adlı çok dilli (tr/en/ru/kk/uz) danışmanlık + ödeme/rezervasyon
platformu üzerinde çalışıyorum. Stack: Next.js 15 (App Router, TypeScript),
Prisma 6 + PostgreSQL, next-intl, Tailwind. Public site + admin panel (CMS,
leads, booking, promos, Cryptomus ödeme + fatura, Telegram bot, AI asistan)
tamamlandı; ayrıca Turnstile captcha, atomik promo + opsiyonel Upstash Redis
rate-limit ve PII (e-posta/telefon) AES-256-GCM şifreleme eklendi (hepsi
anahtar yoksa graceful kapanıyor). Kod şu an Onderkya/-nder-kaya reposunun
claude/consulting-site-plan-6k4lix dalında; yeni private repo
Onderkya/antalyabridge-web'e taşıyorum. Detaylı devir notları repodaki
DEVIR.md dosyasında. Şimdi devam etmek istediğim şey: <buraya yaz>.
```
