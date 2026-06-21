# Otomatik Kripto Ödeme Kurulumu (Cryptomus)

Bu sistem her sipariş için **otomatik bir ödeme linki** üretir. Müşteri dilediği
ağdan (**TRC20 / SOL / ARB / ETH / BTC** ve daha fazlası) öder; ödeme gelince
fatura **otomatik "Ödendi"** olur ve sana **Telegram + e-posta** bildirimi gelir.
Para **doğrudan senin cüzdanına** geçer. Komisyon ~%0.4.

> Mimari sağlayıcı-bağımsızdır: bugün Cryptomus; ileride NOWPayments / BTCPay /
> DIY-BTC eklemek için yalnızca `lib/payments/` altına yeni bir dosya eklemek yeterli.

---

## 1) Cryptomus hesabı aç ve cüzdanını bağla

1. https://cryptomus.com → kayıt ol, e-postanı doğrula.
2. **Bir "Merchant" (işletme) oluştur.**
3. Paranın nereye gideceğini ayarla: kendi kripto cüzdanın (Trust Wallet, borsa
   adresi vb.). Cryptomus bakiyeni oraya çekersin/otomatik gönderir.

## 2) API anahtarlarını al

Cryptomus panelinde: **Settings → API** (veya "Payment API").
- **Merchant ID** (UUID) → `CRYPTOMUS_MERCHANT`
- **Payment API key** (ÖDEME anahtarı; "payout" değil) → `CRYPTOMUS_API_KEY`

## 3) Webhook URL'ini tanımla

Cryptomus panelinde webhook/callback alanına şunu gir:

```
https://SENIN-DOMAININ/api/payments/webhook
```

> ⚠️ **HTTPS şart.** Webhook ve admin paneli düz HTTP (IP:port) ile güvenli
> çalışmaz. Önce domain + ücretsiz SSL kur (bkz. `deploy/SUNUCU-KURULUM.md`).
> Not: Webhook gelmese bile, müşteri ödeme sayfasında beklerken sistem durumu
> Cryptomus'tan **otomatik sorgular** (yedek mekanizma).

## 4) `.env` doldur ve yeniden başlat

Sunucudaki `.env` dosyasına ekle:

```env
PAYMENTS_PROVIDER="cryptomus"
CRYPTOMUS_MERCHANT="buraya-merchant-id"
CRYPTOMUS_API_KEY="buraya-payment-api-key"
NEXT_PUBLIC_SITE_URL="https://senin-domainin"   # ödeme/dönüş linkleri bununla üretilir
```

Sonra:

```bash
docker compose up -d --build
```

## 5) Test et

1. Admin → **Faturalar** sayfasına gir (sol menüde "Faturalar").
2. Küçük bir fatura oluştur (ör. 1.00 USD, açıklama "test").
3. Üretilen **ödeme linkini** aç → Cryptomus sayfasında bir ağ seç → küçük bir
   ödeme yap.
4. Birkaç dakika içinde fatura **"Ödendi"** olmalı ve sana bildirim gelmeli.

---

## Güvenlik notları

- Webhook gövdesine **körü körüne güvenilmez**: imza kontrol edilir **ve** durum
  doğrudan Cryptomus API'sinden otoriter biçimde teyit edilir (`getStatus`).
  Yani sahte bir webhook faturayı "ödendi" yapamaz.
- "Ödendi" geçişi **idempotent**'tir: webhook + sayfa-yoklaması aynı anda gelse
  bile bildirim/promo **tek kez** işlenir.
- Tüm fatura işlemleri **denetim kaydına** (AuditLog) yazılır.
- Gizli anahtar/seed sunucuda **tutulmaz** — para Cryptomus üzerinden senin
  cüzdanına geçer.

## Manuel yedek (Yol A — gateway'siz)

Gateway'i hiç kullanmak istemezsen, **Ödeme Yöntemleri** sayfasından sabit
cüzdan adresi + Kaspi ekleyebilirsin (bunlar iletişim sayfasında QR ile gösterilir).
Müşteriye "ödedikten sonra TXID gönder" notu otomatik gösterilir; ödemeyi elle
doğrularsın. İki yöntem birlikte çalışabilir.
```

