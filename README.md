# Antalya Bridge 🌊

Çok dilli danışmanlık platformu: **Antalya seyahat danışmanlığı**, **online
Türkçe dersleri** ve **Türkiye'de eğitim rehberliği**. Yurtdışından gelen
misafirler için — Kazakistan, Rusya, Özbekistan ve diğer ülkeler.

> Detaylı ürün planı için [`PLAN.md`](./PLAN.md) dosyasına bakın.

## Özellikler

- **5 dil**: Türkçe, İngilizce, Rusça, Kazakça, Özbekçe (`next-intl`, URL bazlı).
- **Akdeniz teması**, açık/koyu mod (varsayılan: sistem ayarı).
- **Admin panel**: talepler, indirim kodları (içerikten bağımsız) ve ödeme
  yöntemleri (Kaspi + çoklu kripto: USDT, BTC…) yönetimi.
- **İletişim formu** → DB'ye kaydeder + sahibe **e-posta + Telegram** bildirimi.
- **Bilgilendirme botu** (Claude) — Telegram webhook; bot sadece bilgi verir,
  işlemleri ekip yürütür.
- **SEO/AI bulunabilirlik**: JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`, hreflang.
- **Self-host**: Docker Compose (Next.js + PostgreSQL).

## Teknoloji

TypeScript · Next.js 15 (App Router) · PostgreSQL · Prisma · Tailwind CSS ·
next-intl · Anthropic SDK (Claude)

## Geliştirme

```bash
cp .env.example .env          # değerleri doldurun (en az DATABASE_URL, AUTH_SECRET)
npm install
npm run prisma:generate
npm run prisma:migrate        # ilk migration'ı oluşturur
npm run db:seed               # admin kullanıcı + temel kayıtlar
npm run dev                   # http://localhost:3000
```

- Public site: `http://localhost:3000/tr` (veya `/en`, `/ru`, `/kk`, `/uz`)
- Admin panel: `http://localhost:3000/admin` (seed'deki e-posta/şifre ile)

## Üretim (kendi sunucunuzda)

```bash
cp .env.example .env          # üretim değerleri
docker compose up -d --build  # web + postgres ayağa kalkar, migration+seed otomatik
```

İsteğe bağlı Nginx + SSL için `docker/nginx.conf` ve `docker-compose.yml`
içindeki `nginx` servisini etkinleştirin.

## Claude bot modelleri

- `claude-haiku-4-5` — kısa/sıradan sorular (hızlı, ucuz)
- `claude-opus-4-8` — uzun/karmaşık danışmanlık cevapları

Telegram webhook kurulumu:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<DOMAIN>/api/bot/telegram&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## Proje yapısı

```
app/[locale]/        Çok dilli public sayfalar
app/admin/           Yönetim paneli (locale öneki yok)
app/api/             contact, admin auth, bot webhook
components/          UI bileşenleri (tema, header, footer, form…)
i18n/                next-intl yapılandırması
messages/            tr, en, ru, kk, uz çevirileri
lib/                 db, auth, notify, claude, config
prisma/              schema + seed
docker/              Dockerfile + nginx örneği
```
