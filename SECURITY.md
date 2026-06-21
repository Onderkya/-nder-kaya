# Güvenlik (Security)

Bu doküman platformun güvenlik önlemlerini ve işletme (operasyon) gereksinimlerini özetler.

## Kripto ödeme güvenliği (en kritik alan)

- **Adres bütünlüğü / checksum doğrulaması:** Cüzdan adresleri kaydedilmeden önce
  `lib/crypto-address.ts` ile doğrulanır. TRON (TRC20, base58check), EVM (ERC20/BEP20/…
  0x+40 hex), Bitcoin (base58check + bech32/bech32m) desteklenir. **Tek karakterlik bir
  hata bile (checksum) reddedilir** — yanlış adrese para gitmesi önlenir.
- **Ağ-uyumluluk kontrolü:** Adres, seçilen ağa uymazsa (örn. EVM adresi TRON ağında)
  kabul edilmez.
- **QR güvenliği:** Public sayfadaki QR, harici bir servisten değil, gösterilen adresin
  ta kendisinden **sunucuda** üretilir (`qrcode`). Böylece QR ile metin adresi her zaman
  birebir aynıdır; sahte/uyumsuz QR riski yoktur.
- **Denetim kaydı (audit log):** Ödeme yöntemi ekle/değiştir/sil işlemleri `AuditLog`
  tablosuna (kim, ne, ne zaman, eski/yeni özet) yazılır ve admin panelde gösterilir.
- **Müşteri uyarısı:** Ödeme alanında "adresi/ağı iki kez kontrol et, elle yazma,
  kopyala; kripto transferleri geri alınamaz" uyarısı gösterilir.

## Kimlik doğrulama & yetkilendirme

- Admin oturumu JWT (jose, HS256) + httpOnly, `secure` (prod), `sameSite=strict` cookie.
- **Tüm yönetim server action'ları `requireAdmin()` ile korunur** — middleware yalnızca
  sayfa render'ını korur; mutasyonlar ayrıca oturum doğrular.
- Login için brute-force koruması: IP başına 15 dk'da 8 deneme (`lib/rate-limit.ts`).
- Şifreler bcrypt (cost 12) ile saklanır. Seed, **zayıf/varsayılan şifreyi reddeder**
  (min 12 karakter) ve `AUTH_SECRET` zorunludur.

## Genel sertleştirme

- **Güvenlik başlıkları** (`next.config.ts`): CSP, HSTS, X-Frame-Options=DENY,
  X-Content-Type-Options=nosniff, Referrer-Policy, Permissions-Policy; `X-Powered-By` kapalı.
- **Görsel kaynakları** yalnızca kendi sunucu (harici joker kaldırıldı).
- **İletişim formu:** zod doğrulama, honeypot, locale beyaz listesi, IP başına dk'da 5 istek.
- **Telegram webhook:** `TELEGRAM_WEBHOOK_SECRET` **zorunlu** (fail-closed: yoksa 503);
  secret eşleşmezse 403. Mesaj boyutu 2000 karakterle sınırlı.
- **Bildirimler:** Telegram'a `parse_mode` olmadan düz metin gönderilir (markdown
  enjeksiyonu önlenir); e-posta HTML'i escape edilir.
- Bağımlılıklar güncel: Next.js, nodemailer ve next-intl bilinen CVE'ler için yamandı.

## İşletme gereksinimleri (deploy öncesi ZORUNLU)

1. `AUTH_SECRET` üret: `openssl rand -base64 32`
2. Güçlü `ADMIN_PASSWORD` (≥12 karakter) belirle.
3. `TELEGRAM_WEBHOOK_SECRET` üret ve Telegram `setWebhook` ile aynısını tanımla.
4. HTTPS zorunlu (Nginx + Let's Encrypt); HSTS başlığı zaten gönderilir.
5. Veritabanı ve `.env` dosyasını gizli tut; `.env` repoya **commit edilmez**.

## Bilinen artıklar / sonraki adımlar

- PII (e-posta/telefon) düz metin saklanır — gerekiyorsa sütun şifrelemesi eklenebilir.
- Çok-instance ölçeklemede bellek-içi rate limit yerine Redis tabanlı limiter gerekir.
- Captcha (hCaptcha/Turnstile) ileride spam'a karşı eklenebilir.
