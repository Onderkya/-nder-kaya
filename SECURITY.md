# Güvenlik (Security)

Bu proje, özellikle **kripto ödeme** akışı başta olmak üzere güvenlik öncelikli
tasarlanmıştır. Aşağıda uygulanan önlemler ve operatörün yapması gerekenler yer alır.

## Kripto ödeme güvenliği (en kritik)
- **Adres bütünlüğü:** Admin panele girilen kripto adresleri kaydedilmeden önce
  **checksum ile doğrulanır** (`lib/crypto-address.ts`): TRON (TRC20, base58check),
  EVM (ERC20/BEP20/… 0x+40hex), Bitcoin (base58check + bech32/bech32m). Tek harf
  hatası bile reddedilir; coin/ağ uyumsuzluğu engellenir.
- **Sahte QR riski yok:** Müşteriye gösterilen QR, **gösterilen adresin kendisinden
  sunucuda** üretilir (`components/payment-methods.tsx`, `qrcode`). Harici QR
  servisi kullanılmaz; QR ile metin adresi her zaman birebir aynıdır.
- **Manuel yazım hatası önleme:** Adresler kopyala butonuyla sunulur + "göndermeden
  önce doğrulayın, işlem geri alınamaz" uyarısı gösterilir.
- **Değişiklik izleme:** Tüm ödeme yöntemi ekleme/açma-kapama/silme işlemleri
  **denetim kaydına** (`AuditLog`) yazılır (kim, ne, ne zaman) ve panelde gösterilir.

## Kimlik doğrulama & yetkilendirme
- Admin oturumu: `jose` ile imzalı JWT, `httpOnly` + `secure` (prod) + `sameSite=strict` çerez.
- **Tüm admin server action'ları `requireAdmin()` ile korunur** — middleware yalnızca
  sayfa render'ını korur; mutasyonlar ayrıca oturum doğrular.
- Login **brute-force sınırı**: IP başına 15 dk'da 8 deneme (`lib/rate-limit.ts`).
- Şifreler `bcrypt` (cost 12). Seed, **zayıf/varsayılan şifreyi reddeder** (min 12 karakter).

## Giriş doğrulama & spam/DoS
- İletişim formu: zod doğrulama + **IP başına dakikada 5 talep** sınırı + honeypot +
  locale beyaz listesi.
- Telegram webhook: **`TELEGRAM_WEBHOOK_SECRET` zorunlu (fail-closed)** — secret yoksa
  endpoint 503 döner; sahte mesaj enjeksiyonu engellenir. Mesaj boyutu 2000 karakterle sınırlı.
- Bildirimlerde Telegram `parse_mode` kullanılmaz (markdown/HTML enjeksiyonu önlenir).

## HTTP güvenlik başlıkları (`next.config.ts`)
- `Content-Security-Policy` (frame-ancestors 'none', object-src 'none', base-uri 'self' …)
- `Strict-Transport-Security` (HSTS, preload), `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- `X-Powered-By` kapalı; `next/image` harici joker (`**`) kaldırıldı (yalnızca yerel).

## Operatörün yapması gerekenler (deploy öncesi ZORUNLU)
1. `AUTH_SECRET` üret: `openssl rand -base64 32` (boş bırakılamaz).
2. Güçlü `ADMIN_PASSWORD` belirle (min 12 karakter, tahmin edilemez).
3. `TELEGRAM_WEBHOOK_SECRET` üret ve `setWebhook` ile Telegram'a tanıt.
4. Sunucuyu HTTPS arkasında (Nginx + Let's Encrypt) çalıştır; gerçek istemci IP'si
   için `X-Forwarded-For` başlığını proxy'de doğru ayarla.
5. `.env` dosyasını asla commit'leme (zaten `.gitignore`'da).

## Bilinen, kabul edilen kalanlar
- `next`in iç bağımlılığındaki `postcss` için moderate bir uyarı, üst Next.js
  yamasıyla kapanacak (uygulama kodunu etkilemez).
- Çok-instance ölçeklemede bellek-içi hız sınırlayıcı yerine Redis tabanlı bir
  çözüme geçilmelidir.
