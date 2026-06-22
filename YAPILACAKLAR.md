# YAPILACAKLAR — Antalya Bridge

> Site **canlı**: **http://45.67.203.149:3010** (mutlaka `http://` ile aç; `https://` henüz yok).
> Admin: http://45.67.203.149:3010/admin · e-posta `onderkya35@gmail.com`
>
> Aşağıdaki maddeler **opsiyonel** ve hepsi *graceful* — anahtar girilmezse o özellik
> kapalı kalır, site çalışmaya devam eder. Her birini sen anahtarı verince ben açabilirim
> ya da kendin aşağıdaki adımlarla yapabilirsin.

**Sunucuda uygulama yeri:** `root@45.67.203.149:/opt/antalya-bridge` · ayarlar `.env` dosyasında.

**Değişiklikten sonra uygulamak için:**
```bash
cd /opt/antalya-bridge
nano .env                     # ilgili satırları doldur
docker compose up -d          # çalışma-zamanı değişkenleri (SMTP, Telegram, AI, ödeme)
# NEXT_PUBLIC_* veya Turnstile SITE key değişirse:
docker compose up -d --build  # yeniden derleme gerekir
```

---

## 1. 📧 E-posta bildirimi (talep gelince mail)
**Gerekli:** Gmail "uygulama şifresi" (16 hane). Google Hesabı → Güvenlik → 2 Adımlı Doğrulama açık → "Uygulama şifreleri" → oluştur.

`.env`:
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="onderkya35@gmail.com"
SMTP_PASS="<16-haneli-uygulama-sifresi>"
NOTIFY_EMAIL="onderkya35@gmail.com"
```
→ `docker compose up -d`

---

## 2. 💬 Telegram bot + bildirim
**Gerekli:** @BotFather'dan **bot token**, ve senin **chat ID**'in (@userinfobot'a yazarak öğrenilir).

`.env`:
```
TELEGRAM_BOT_TOKEN="<botfather-token>"
TELEGRAM_OWNER_CHAT_ID="<senin-chat-id>"
TELEGRAM_WEBHOOK_SECRET="<rastgele-gizli-metin>"
```
→ `docker compose up -d`
Bot webhook'u (domain geldikten sonra) ayarla:
```
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<DOMAIN>/api/bot/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

---

## 3. 🤖 AI özellikleri (Claude bot + admin asistanı)
**Gerekli:** Anthropic API key (site botu) ve/veya OpenRouter API key (admin /admin/ai asistanı).

`.env`:
```
ANTHROPIC_API_KEY="sk-ant-..."
OPENROUTER_API_KEY="sk-or-..."
OPENROUTER_MODEL="openai/gpt-4o-mini"
```
Admin asistanının veritabanına yazabilmesi için ayrı DB rolleri (opsiyonel, güvenli):
`deploy/SUNUCU-KURULUM.md` §6 (ai_roles.sql + AI_READONLY/READWRITE_DATABASE_URL).
→ `docker compose up -d`

---

## 4. 💳 Cryptomus kripto ödeme + fatura
**Gerekli:** Cryptomus panelinde Settings → API: **Merchant ID** + **ödeme (payment) API anahtarı**.

`.env`:
```
PAYMENTS_PROVIDER="cryptomus"
CRYPTOMUS_MERCHANT="<merchant-id>"
CRYPTOMUS_API_KEY="<payment-api-key>"
```
Webhook URL'i (domain sonrası) Cryptomus panelinde: `https://<DOMAIN>/api/payments/webhook`
Detay: `deploy/ODEME-KURULUM.md`
→ `docker compose up -d`

---

## 5. 🛡️ Cloudflare Turnstile (form spam koruması)
Şu an formlar honeypot + IP rate-limit ile zaten korunuyor. Görünür captcha istersen:
Cloudflare → Turnstile → Add site (domain'i ver) → Site key + Secret key.

`.env`:
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAA..."   # public
TURNSTILE_SECRET_KEY="0x4AAAA..."             # gizli
```
> ⚠️ Site key build'e gömülür → **`docker compose up -d --build`** ile yeniden derle.
> İkisini birlikte doldur ya da ikisini de boş bırak (yalnız secret = formlar reddedilir).

---

## 6. 🌐 Domain + SSL  (EN SON)
1. Domain al, **A kaydını `45.67.203.149`'a** yönlendir (www için de A kaydı).
2. `.env`: `NEXT_PUBLIC_SITE_URL="https://<DOMAIN>"`  → HSTS + güvenli başlıklar otomatik aktifleşir.
3. Mevcut host nginx'e (PetLingo'yu bozmadan) yeni server block + Let's Encrypt:
   ```bash
   cd /opt/antalya-bridge
   sudo cp deploy/nginx-antalyabridge.conf /etc/nginx/sites-available/antalyabridge
   sudo sed -i 's/<DOMAIN>/<gercek-domain>/g' /etc/nginx/sites-available/antalyabridge
   sudo ln -s /etc/nginx/sites-available/antalyabridge /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d <DOMAIN> -d www.<DOMAIN>
   ```
4. `docker compose up -d --build` (yeni site URL'i derlemeye gömülür).
5. İstersen `.env`'de `WEB_BIND` tekrar `127.0.0.1` yapılıp 3010 portu dışarıya kapatılabilir (erişim sadece nginx üzerinden https).
> Detaylı rehber: `deploy/SUNUCU-KURULUM.md` §5.

---

## 7. 🔐 Güvenlik (yapılması önerilir)
- **Root şifresini değiştir** (panelde açıkta kaldı): sunucuda `passwd`.
- Mümkünse SSH anahtarına geç ve parola ile girişi kapat (`/etc/ssh/sshd_config`: `PasswordAuthentication no`).

---

## Notlar
- Kod deposu: `Onderkya/-nder-kaya` dalı `claude/consulting-site-plan-6k4lix`.
  Güncelleme: sunucuda `git pull` → `docker compose up -d --build`.
- PII şifreleme (e-posta/telefon AES-256-GCM) **zaten açık** — `PII_ENCRYPTION_KEY` `.env`'de.
  Bu anahtarı **değiştirme/silme** (eski şifreli kayıtlar okunamaz hale gelir).
- Bu sunucuda **PetLingo** projesi de çalışıyor (native, port 80/4000/5001) — ona dokunulmadı.
