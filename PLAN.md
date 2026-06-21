# Antalya Danışmanlık & Türkçe Eğitim Platformu — Proje Planı

## Context (Neden bu proje?)

Antalya'ya gelmek isteyen **yabancı turistlere** aracı danışmanlık (otel bulma,
aracı kurumlarla görüşme, araç rezervasyonu vb.), Kazak/Rus/Özbek öğrencilere
**online Türkçe ders** (randevulu, 15/30/60 dk, Zoom/yüz yüze) ve Türkiye'de
okumak isteyenlere **eğitim danışmanlığı** sunan çok dilli bir web platformu
kurulacak. **Hedef kitle tamamen yurtdışı — Türkiye'den müşteri kabul edilmeyecek.**

İş sahibinin eşi otelde satış departmanında çalışıyor (Antalya + otel sektörü
bilgisi), kendisi Türkiye'de burslu öğrenci olarak okumuş (eğitim süreci
hâkimiyeti) ve Türkçe öğretebiliyor. Rekabet avantajı bu uzmanlık + aracı model
(ekip sahaya inmez, koordinasyon yapar).

Hedef: Özgün, kullanıcı dostu, çok dilli (TR/EN/RU/KZ/UZ), tamamen admin
panelinden yönetilebilen, WhatsApp+Telegram **bilgilendirme botlu**, indirim kodu
destekli, AI arama motorlarınca (ChatGPT/Claude/Perplexity vb.) bulunabilir,
ileride mobil app'e genişleyebilecek bir site.

### Onaylanan kararlar (kullanıcıdan)
- **Diller:** Lansmanda 5 dil birden — TR, EN, RU, KZ, UZ. Dil seçici olacak.
- **Site yapısı:** Çok sayfalı site (güçlü ana sayfa + ayrı hizmet sayfaları + SSS/blog).
- **Tasarım tarzı:** Akdeniz / sıcak — turkuaz-deniz mavisi + sıcak güneş tonları,
  davetkâr, özgün UI.
- **Tema:** Açık/koyu geçiş butonu var; varsayılan **sistemi takip eder**.
- **İletişim/Bot:** WhatsApp + Telegram **bilgilendirme botu** (Claude). Bot işlem
  yapmaz, sadece bilgi verir; kişi yazınca sahibe **e-posta + Telegram** bildirimi gider.
- **Ödeme:** **KZ → Kaspi** (eşinin hesabı), **diğer tüm ülkeler (RU, UZ, vd.) →
  kripto**. Kripto çoklu olacak: **USDT + BTC dahil** birden fazla coin/ağ.
  TR müşteri yok → Türk kart altyapısına gerek yok. Hepsi manuel.
- **Barındırma:** Kullanıcının kendi sunucusu (self-hosted VPS).

---

## Teknoloji Seçimi (Neden?)

- **Dil/Framework: TypeScript + Next.js (App Router).** Tek dille hem ön hem arka
  uç; SSR → SEO ve **AI bulunabilirliği** için kritik; olgun i18n; mobil app'e
  (React Native/Expo) kod paylaşımı kolay; kendi sunucuda Docker ile kolay deploy.
- **Veritabanı: PostgreSQL + Prisma ORM.** İlişkisel çok dilli içerik, randevu ve
  indirim mantığı için güçlü, self-host'a uygun.
- **i18n: next-intl.** URL bazlı locale (`/tr`, `/en`, `/ru`, `/kk`, `/uz`), hreflang.
- **Tema: açık/koyu** (CSS değişkenleri + `prefers-color-scheme`), kullanıcı toggle'ı
  `localStorage`'da saklanır.
- **Auth: Auth.js (NextAuth).** Admin + (opsiyonel) müşteri hesapları, rol bazlı.
- **Medya: Sunucuda yerel disk + opsiyonel MinIO (S3 uyumlu, self-host).**
- **Bot: Claude API (Anthropic SDK, TS).** Model dağılımı aşağıda.
- **Bildirim: Nodemailer (e-posta, Gmail SMTP) + Telegram Bot API** (sahibe DM).
- **Deploy: Docker Compose** — Next.js app, PostgreSQL, MinIO, bot-worker, Nginx
  (reverse proxy) + Let's Encrypt (otomatik SSL).

### Hangi Claude modeli nerede?
- **WhatsApp/Telegram yoğun FAQ + dil/niyet tespiti:** `claude-haiku-4-5` (hızlı/ucuz).
- **Karmaşık danışmanlık cevabı, kişiselleştirilmiş Antalya/eğitim bilgisi, admin
  için konuşma özeti:** `claude-opus-4-8` (maliyet hassasiyetinde `claude-sonnet-4-6`).
- Akış: mesaj → Haiku ile dil/niyet → basitse Haiku yanıtlar, karmaşıksa Opus'a
  yükseltir → **her durumda sahibe e-posta + Telegram bildirimi**. Bot işlem yapmaz,
  sadece bilgi verir; satış/rezervasyon/ödeme insan (siz) tarafından tamamlanır.

---

## Mimari & Modüller

Tek Next.js app, modüler yapı:

1. **Public Site (çok dilli, SSR, Akdeniz teması, açık/koyu)**
   - Ana sayfa (hero), Antalya Danışmanlık, Türkçe Ders, Türkiye'de Eğitim
     Danışmanlığı, Hakkımızda, İletişim, SSS, Blog.
   - Tüm metin/başlık/görsel/sıralama admin panelinden gelir (CMS mantığı).
2. **Admin Panel** (rol korumalı)
   - İçerik yönetimi (sayfa→bölüm→blok), sürükle-bırak sıralama, medya yükle/değiştir/sil.
   - İndirim/promosyon modülü (içerikten ayrı — foto'ya/metne dokunmadan kod yönetimi).
   - Lead/talep yönetimi (gelen danışmanlık talepleri + bot konuşma geçmişi).
   - Ders saati/slot tanımlama (randevu talebi sahibe bildirim olarak düşer; onay manuel).
3. **İletişim & Talep Akışı**
   - Müşteri formu / bot mesajı → DB'ye `Lead`/`Conversation` kaydı → sahibe
     **e-posta + Telegram** bildirimi → siz manuel ilerletirsiniz.
4. **Bilgilendirme Bot Servisi** (bot-worker)
   - WhatsApp Business Cloud API (Meta) + Telegram Bot API → ortak Claude motoru.
   - Sadece bilgi verir + sahibe haber eder.
5. **Ödeme Bilgilendirme** (kart entegrasyonu YOK)
   - KZ → Kaspi bilgileri/QR gösterimi; diğer ülkeler → kripto (USDT) cüzdan/ağ
     bilgisi. Ödeme manuel doğrulanır; indirim kodu tutarı düşer.

---

## Veri Modeli (özet, çok dilli)

Çok dilli alanlar için çeviri deseni (kayıt × locale):

- `Page`, `Section`, `ContentBlock` (tip: hero/text/image/cards/faq...),
  `Translation` (key, locale, value), `Media`.
- `Service` (danışmanlık/eğitim hizmetleri), `LessonType` (15/30/60 dk, fiyat),
  `AvailabilitySlot`, `BookingRequest` (durum: new/contacted/confirmed/done).
- `Lead` (talep), `User` (admin/customer + rol).
- `PromoCode` (kod, tip: yüzde/tutar, geçerlilik, kullanım limiti, hedef hizmet)
  — **içerik tablolarından bağımsız**.
- `Conversation` + `Message` (bot geçmişi, kanal: whatsapp/telegram).
- `PaymentMethod` (tip: kaspi | crypto; coin: USDT/BTC/...; ağ; cüzdan adresi/QR;
  aktif/pasif) — admin çoklu kripto coin/ağ ekleyip yönetebilir.

---

## Admin Panel Gereksinimleri (kullanıcının vurgusu)

- Sayfadaki **her alan** düzenlenebilir: başlık, metin, görsel, sıralama (tüm dillerde).
- İçerik ekle/sil/değiştir, foto yükle/değiştir/sil, blokları sırala.
- **İndirim ayrı modül:** kod tanımlarken/aktif ederken içerik/foto ile uğraşılmaz.

---

## Çok Dillilik & AI/SEO Bulunabilirlik

- URL bazlı locale, `hreflang`, dile göre `<html lang>`, dil seçici menü.
- **AI bulunabilirlik:** `schema.org` JSON-LD (Service, LocalBusiness, FAQPage,
  Course), `sitemap.xml`, `robots.txt`, **`llms.txt`**, hızlı SSR, semantik HTML.
- Sosyal: Instagram/TikTok/Facebook/YouTube linkleri + Open Graph/Twitter kart.

---

## Tasarım Yönü (Akdeniz / sıcak)

- Palet: turkuaz/deniz mavisi (ana) + sıcak güneş/kum tonları (vurgular), açık ve
  koyu tema için ayrı set; yüksek okunabilirlik/kontrast.
- His: davetkâr, güven veren, turizm + eğitim dengesi; büyük hero görselleri
  (Antalya), net çağrı-butonları (WhatsApp/Telegram/İletişim).
- Özgün UI bileşen kiti (hazır tema değil); mobil öncelikli responsive.
- Açık/koyu geçiş butonu (varsayılan sistem); dil seçici header'da.

---

## Ödeme Stratejisi (sadeleştirildi)

- 🇰🇿 **Kazakistan → Kaspi** (eşinin hesabı): Kaspi bilgi/QR gösterimi, manuel doğrulama.
- 🌍 **Diğer tüm ülkeler (RU, UZ, vd.) → kripto (çoklu: USDT + BTC dahil)**: her
  coin/ağ için cüzdan adresi/QR gösterimi, manuel doğrulama. Admin panelden
  coin/ağ ekle/çıkar yönetilebilir.
- 🇹🇷 TR müşteri yok → Türk kart altyapısı (iyzico/Craftgate) yok.
- İndirim kodu her iki yöntemde de uygulanır. Tüm ödemeler insan onaylı (manuel).

> Not: Şirket gerekliliği hukuki/mali bir konudur (mali müşavire danışılmalı);
> site teknik olarak şirketsiz de yayınlanabilir.

---

## Yol Haritası (Fazlar)

**Faz 0 — Temel:** Repo iskeleti, Next.js+TS+Prisma+PostgreSQL, Docker Compose,
i18n (5 dil), Auth, açık/koyu tema altyapısı, Akdeniz UI kit temeli.
→ İlk iş: bu planı repoya `PLAN.md` olarak commit'le (branch:
`claude/consulting-site-plan-6k4lix`).

**Faz 1 — MVP:** Çok sayfalı public site (ana sayfa + 3 hizmet sayfası + iletişim
+ SSS), Admin panel (içerik + medya + sıralama), Promosyon modülü, talep/lead akışı
+ e-posta & Telegram bildirimi, ödeme bilgi gösterimi (Kaspi/kripto), SEO/AI
bulunabilirlik temeli, sosyal linkler, dil seçici, tema butonu.

**Faz 2 — Bot & İçerik:** WhatsApp + Telegram bilgilendirme botu (Claude),
randevu/slot yönetimi, blog modülü, analitik.

**Faz 3 (opsiyonel):** Mobil app (Expo/React Native).

---

## Repo Yapısı (öneri)

```
/app            # Next.js App Router (public + admin route grupları)
/components     # özgün UI bileşenleri (Akdeniz teması, açık/koyu)
/lib           # db (prisma), auth, claude client, i18n, notify (mail+telegram)
/messages      # tr/en/ru/kk/uz çeviri dosyaları
/prisma        # schema + migrations
/services/bot  # whatsapp + telegram + claude bot-worker
/docker        # Dockerfile'lar + docker-compose.yml + nginx
PLAN.md        # bu plan
```

---

## Doğrulama (Nasıl test edilir?)

- `docker compose up` → tüm servisler ayağa kalkar; site `localhost`'ta 5 dilde gezilir.
- Tema butonu açık/koyu geçişi çalışır; varsayılan sistem ayarını takip eder.
- Admin panelden bir metin/görsel değiştirilir → public sitede yansır.
- İndirim kodu tanımlanır → ödeme bilgi adımında tutardan düşer (içeriğe dokunmadan).
- İletişim formu doldurulur → DB'ye lead düşer + sahibe **e-posta + Telegram** bildirimi gelir.
- Bot test kanalına mesaj → Claude bilgi yanıtı + sahibe bildirim.
- Lighthouse/SEO + JSON-LD doğrulayıcı + hreflang + `llms.txt` kontrolü.

---

## Açık Notlar / Sonra Netleşecek
- Marka/alan adı, logo (Akdeniz paletiyle 2-3 logo/renk önerisi sunulacak).
- Türkçe ders fiyatları admin panelden girilebilir (piyasa: italki ~4-25$/seans,
  Preply ~10-40$/saat; trial %30-50 indirimli — konumlandırma iş sahibinde).
- WhatsApp Business API onayı (Meta) Faz 2 öncesi yapılmalı; Telegram bot token alınmalı.
- Kripto: çoklu coin (USDT + BTC dahil) ve ağlar (örn. USDT-TRC20/ERC20, BTC) için
  cüzdan adresleri netleşmeli; admin panelden eklenebilir olacak.
```
