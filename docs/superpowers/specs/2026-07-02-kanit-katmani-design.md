# Kanıt Katmanı + Yolculuk Anlatımı — Tasarım Dokümanı

**Tarih:** 2026-07-02
**Dal:** `claude/redesign-conversion` (canlı sunucu bu daldan deploy edilir)
**Durum:** Kullanıcı onaylı tasarım; uygulama planı bekliyor.

## 1. Amaç

Site yapısal olarak üç iş hedefini (Antalya tatil danışmanlığı, Zoom Türkçe dersleri + PetLingo,
Türkiye Bursları danışmanlığı) zaten karşılıyor; eksik olan **kanıt ve inandırıcılık katmanı**.
Gerçek müşteri yorumu ve kurucu fotoğrafı henüz yok. Bu çalışma güveni **süreç şeffaflığı ve
hikâye anlatımı** ile kurar, dönüşümü tek net eyleme bağlar: **paket seçimi → WhatsApp mesajı**.

Öncelikli iş hedefi: **Antalya tatili** (üç hizmet de kalır; vitrin tatile ayarlı — mevcut hali korunur).

## 2. Değişmezler (kullanıcının koyduğu sınırlar)

- Mevcut tasarım dili (renkler, fontlar, Cormorant Garamond/Onest, animasyon sistemi) **hiç değişmez**.
- **Mevcut görseller ve videolar silinmez, başkasıyla değiştirilmez.** En fazla sayfa içi sıraları değişebilir.
- **Ana sayfa hero (DiveHero — Kaputaş drone + su altı videosu) aynen kalır, dokunulmaz.**
  Fark şeridi hero'nun *altına* yeni bölüm olarak eklenir.
- Veritabanı şeması değişmez. Yeni npm bağımlılığı eklenmez (GSAP/Reveal zaten mevcut).
- Tüm yeni metinler 4 dilde yazılır: `messages/tr.json`, `en.json`, `ru.json`, `kk.json`.
- Mobil öncelikli: her yeni bölüm önce 375px genişlikte tasarlanıp doğrulanır.

## 3. Yapılacak işler

### a. Temsili kurucu fotoğrafı
- `/public/images/founders.jpg` eklenir: telifsiz kaynaktan (Pexels/Unsplash) Kazak kadın + Türk
  erkek temsili çift fotoğrafı. **Aday görseller kullanıcıya onaylatılır**, sonra eklenir.
- Altına ince puntoyla, 4 dilde "temsili görsel" ibaresi (`about` çeviri anahtarı).
- Hakkımızda sayfasındaki emoji yer tutucusunun (🇰🇿 ♥ 🇹🇷) yerini alır — mevcut fallback kodu
  zaten `/images/founders.jpg` varlığını kontrol ediyor, dosya eklenince otomatik devreye girer.

### b. Paket → WhatsApp akışı (dönüşüm motoru)
- Ana sayfa ve `/antalya` sayfasındaki otel/paket kartlarına "WhatsApp'tan sor" eylemi eklenir.
- Tıklanınca `https://wa.me/{numara}?text=...` linki, **paket adı önceden yazılmış** locale'e uygun
  mesajla açılır. Örnek (tr): "Merhaba! {paket adı} hakkında bilgi almak istiyorum."
- Numara mevcut `site.whatsapp` ayarından okunur. **Ayarlı değilse** buton görünmez, kart mevcut
  davranışıyla `/contact` sayfasına yönlendirir (sessiz bozulma yok, mevcut davranış korunur).
- Kart tasarımı korunur; eylem, kartın mevcut buton düzenine uyumlu eklenir.

### c. Burs yolculuğu (`/education`)
- Sayfanın merkezine 6 adımlık, kaydırdıkça ilerleyen hikâye bölümü:
  1. Kazakistan'da bir hayal
  2. Türkiye Bursları başvurusu
  3. Belgeler & mülakat
  4. Kabul mektubu
  5. Antalya'ya varış, yurt hayatı
  6. Mezuniyet ve yeni hayat
- Her adım: görsel + 2-3 cümle + "Bu adımda biz ne yapıyoruz" notu (danışmanlık değeri her adımda somutlaşır).
- Görseller: sayfada halihazırda var olan medya + gerekirse telifsiz yeni ekleme (mevcutları silmeden).
- Teknik: mevcut Reveal/GSAP altyapısı; mobilde dikey zaman çizgisi; `prefers-reduced-motion`
  tercihinde animasyonsuz statik kartlara döner.
- Metin tonu: "biz bu yoldan geçtik" birinci-tekil samimiyeti; reklam dili yok.

### d. 0'dan C2'ye yol (`/lessons`)
- Kompakt seviye çizgisi: A1 → A2 → B1 → B2 → C1 → C2.
- Her seviyede tek cümle: "neyi konuşabilir hale gelirsin" (ör. A2: "Pazarda pazarlık edersin").
- Öğretmenin bu yolu sıfırdan bizzat yürüdüğü vurgusu — isimsiz, yüzsüz (gizlilik kısıtı).
- PetLingo "her gün pratik" olarak çizginin altına işlenir (mevcut PetLingoShowcase korunur).

### e. Ana sayfa fark şeridi
- Hero'nun hemen altına, mevcut "neden biz" bölümünün önüne tek satırlık kimlik cümlesi:
  tr: "Acente değiliz — bu yolu yaşamış, Antalya'da yaşayan bir aileyiz."
- Yanında 3 mikro-kanıt: "4 dil konuşuyoruz" · "Ödemeden önce anlaşma" · "Gerçek insan, bot değil".
- Görsel dil mevcut TrustStrip bileşeniyle akraba; hero'ya hiçbir müdahale yok.

### f. FAQ genişletme (AI + Google görünürlüğü)
- Her hizmete 4-6 gerçek soru-cevap eklenir. Örnek başlıklar:
  - Tatil: "Paket fiyatına neler dahil?", "Kaspi ile nasıl öderim?", "Havalimanı transferi var mı?"
  - Ders: "Zoom dersi kaç dakika sürüyor?", "PetLingo derse dahil mi?", "Hangi seviyeden başlarım?"
  - Burs: "Türkiye Bursları başvurusu ücretli mi?", "Hangi belgeler gerekiyor?", "Mülakata nasıl hazırlanırım?"
- Nihai soru listesi uygulama sırasında kullanıcıyla netleştirilir; cevaplar dürüst ve somut yazılır.
- Mevcut FAQPage JSON-LD şemasına otomatik girer → ChatGPT/Google AI aramalarında alıntılanabilirlik.
  (Teknik SEO altyapısı — hreflang, sitemap, JSON-LD — zaten mevcut; bu iş içerik tarafını tamamlar.)

## 4. Kapsam dışı (bilinçli olarak ertelendi)

- Gerçek müşteri yorumları (henüz müşteri yok; GuestVoices "sadece gerçek yorum" ilkesiyle boş kalır).
- Ses/video duyusal katman eklemeleri, ru/kk çeviri kalite denetimi, Google Business Profile,
  sayfa sayfa mobil elden geçirme → sonraki faz.
- Eşinin gerçek fotoğrafı/videosu (gizlilik nedeniyle kullanıcı reddetti; temsili görsel + "temsili" ibaresi kararı kullanıcıya ait).

## 5. Uygulama modeli

- Orkestrasyon, Türkçe metin yazımı ve çeviriler: ana oturum (Fable 5).
- Mekanik bileşen kodlaması: Sonnet 5 subagent'ları (subagent-driven development).
- Her parça sonrası preview doğrulaması: 4 locale render, 375px mobil, reduced-motion,
  WhatsApp linkinin doğru önyazılmış mesajla açılması.
- Son adım: bağımsız kod incelemesi.

## 6. Başarı ölçütleri

- Paket kartından tek dokunuşla, paket adı yazılı WhatsApp sohbeti açılıyor.
- `/education` ziyaretçisi kaydırma ile 6 adımlık süreci ve her adımdaki danışmanlık değerini görüyor.
- Hakkımızda sayfasında emoji yerine fotoğraf var; "temsili görsel" ibaresi okunuyor.
- Ana sayfa hero'su bayt bayt aynı; hiçbir mevcut görsel/video silinmemiş veya değiştirilmemiş.
- Yeni tüm metinler 4 dilde eksiksiz; FAQ şeması geçerli JSON-LD üretiyor.
