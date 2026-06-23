# DEVRİM — Antalya Bridge immersive site (durum)

> Canlı: **http://45.67.203.149:3010** (mutlaka `http://`) · dal `claude/consulting-site-plan-6k4lix`
> Görsel/medya kaynakları: `public/images/CREDITS.txt` (tümü CC / Mixkit / CC0).

## 🔁 Revizyon 7 — dürüst ekip, geçişli hero'lar, otel akordeonu, perf
- **Dürüstlük:** "otelde çalışıyoruz" iddiası **5 dilde kaldırıldı**. Gerçek ekip: kıdemli yazılım mühendisi (PetLingo'yu + bu platformu o yaptı) + Kazakistanlı eş (Türkçe öğretmeni, üniversite/burs yolunu bizzat yürüdü). Hakkımızda yeniden yazıldı. PetLingo "**bizim kendi uygulamamız**" rozeti eklendi.
- **Geçişli (cycling) hero'lar:** Antalya, Türkçe (+Türk bayrağı), Eğitim (ofis→kampüs→öğrenci) hero'ları artık sabit değil, videolar **cross-fade** geçiyor (`CinematicHero` çok-videolu).
- **Aktiviteler güçlendirildi:** scuba2 (etkileyici dalış) + özel yat + Land of Legends + 5★ resort — hepsi premium landscape.
- **Land of Legends:** "burası bizim değil — seni oraya da götürürüz" mesajı eklendi (5 dil).
- **Oteller akordeonu:** sıradan grid → **yatay "fermuar" akordeon** (üstüne gel/tıkla → büyür, diğerleri kısalır; mobilde dikey). `components/hotel-accordion.tsx`.
- **Eğitim düzeltildi:** kötü "01" kampüs close-up → **kampüs havadan videosu**; yarısı kesilen dikey videolar → landscape (office-consult / campus-aerial / edu-street); 4. adım temiz görsel.
- **Ses butonu** → ekolayzer/dalga animasyonlu premium buton.
- **Performans:** `AutoVideo` — dekoratif videolar yalnız görünürken oynar (services/LoL/about/lessons). Eş zamanlı autoplay yükü kalktı.

## 🔁 Revizyon 6 — Travel videolu, iç sayfa hero videoları, PetLingo mini-oyun
- **Antalya/Travel:** hero gerçek Kaputaş drone videosu; bölge galerisi (`HorizontalPlaces`) artık **videolu yatay galeri** (Kaputaş/Suluada/Kemer/Olympos/Alanya/Kaleiçi/Düden) — yalnız görünür kart oynar.
- **About/SSS/İletişim hero videoları:** About `vid-kaleici`, SSS `vid-kemer`, İletişim `vid-kas` (Kaş gün batımı). About hikaye görselleri düzeltildi (Aspendos→Akdeniz kampüs, düşük çöz kaleici→harbor).
- **PetLingo gerçek mini-oyun:** her pet'in kendi kelime seti; şıkka tıkla → doğru (puan+seri+**konfeti**) / yanlış (sallanma+can); otomatik ilerleme + pet değiştirme. (`components/petlingo-live.tsx`)

## 🔁 Revizyon 5 — canlı PetLingo, video sayfalar, Land of Legends footage
- **PetLingo CANLI:** telefon mockup'ı artık uygulamanın **gerçek Lottie pet animasyonları** (sunucudan `/opt/PetLingo/assets/lottie/*` → `public/lottie/`); `lottie-web` ile oynuyor. Alttaki pete tıkla → büyük 3D pet değişir, soru kartı döner, otomatik döngü. (`components/petlingo-live.tsx`). Bozuk `:4000` API CTA'sı → `/contact`.
- **Ses butonu üstte:** dalga sesi aç/kapa sağ üst köşeye (premium glass pill) taşındı.
- **Aktiviteler hepsi video:** scuba + **Land of Legends aqua** (resmi footage) + Kaleiçi tekneleri + jet ski (statik pool/harbor gitti).
- **Land of Legends footage:** dual kartlar artık **gerçek video** — `lol-interior.mp4` (castle) + `lol-aqua.mp4` (hyper-coaster), thelandoflegends.com resmi tanıtım.
- **Türkçe sayfası dinamik:** hero `les-notebook.mp4`; 4 süreç kartı videolu (harfler / canlı ders / online / Antalya'da konuş — Lara bayrak). PetLingo öncesi "**bunu biz de yaşadık**" güven bandı.
- **Eğitim sayfası dinamik:** hero `edu-street.mp4`; StudyJourney adımları videolu (`edu-ocean/walk/students`); "bunu biz de yaşadık" bandı. `StudyJourney`'e video desteği eklendi.
- **Mesaj:** 5 dilde `lived_badge/title/text/cta` — "verdiğimiz her danışmanlığı önce kendimiz başardık" (burslu okuduk, Türkçe öğrettik, Antalya'da yaşıyoruz, otelin içindeyiz).

## 🔁 Revizyon 4 — sinematik video reel + kullanıcı seçimi klipler
- **goturkiye tarzı sticky-stack reel:** "Antalya'nın incileri" artık scroll'da **kartların birbirinin üstüne bindiği** sinematik video reel'i (`components/stacked-reel.tsx`). Önceki kart örtüldükçe küçülüp kararır (derinlik). Yalnız ekranda baskın panelin videosu oynar; poster `next/image` (lazy, optimize), video üstüne yumuşak biner → performans korunur.
- **Kullanıcının seçtiği Pexels klipleri** (telifsiz): hero üstü `kaputas-drone.mp4` (birebir Kaputaş) + sualtı `dive-fish.mp4` yenilendi; reel = Kaş / Suluada / Olympos / Kemer / Kaleiçi / Düden / Alanya Kalesi / Kleopatra (`public/media/vid-*.mp4`).
- **Yeni görseller:** `lessons-meaning.jpg` (dil öğrenim merkezi — Türkçe ders artık anlamlı) · `alanya.jpg` (Kızıl Kule, CC0 — reel posteri).
- **Açık kalan slot:** `akdeniz-campus-wide.jpg` (Akdeniz Üni **uzaktan/havadan** kampüs) — Commons'ta yok; bırakınca Eğitim sayfası + ana sayfa kartı otomatik kullanır (`existsSync` fallback).

## 🔁 Revizyon 3 — satış odaklı ana sayfa + gerçek konum görselleri
- **Hero "satış makinesi":** başlık kısaltıldı ve **aşağı alındı** (Türkçe taşma bitti). Yeni vurgu = **farkımız ne**: turuncu **"Farkımız ne?"** rozeti (parıltılı), "Antalya'yı acente değil, burada yaşayan biri anlatsın" başlığı, **3 güven çipi** (5 dil · tek muhatap · Antalya'da yaşıyoruz), CTA "Ücretsiz danışmanlık al". 5 dilde çevrildi. (`components/dive-hero.tsx`)
- **Gerçek yüksek-çöz görseller (Wikimedia CC, 3840px):** `akdeniz-campus.jpg` (Akdeniz Üni), `suluada.jpg` (Adrasan Suluada drone), `kaleici-harbor.jpg` (Yat Limanı), `kaleici-inside.jpg` (Hadrian Kapısı — eski şehir, **düşük çöz kaleici.jpg yerine**), `kemer.jpg` (Kemer Marina), `beachpark.jpg` (Konyaaltı Beach Park), `ngphaselis.jpg` (Phaselis koyu). Bkz. CREDITS.txt.
- **Saçma fotolar düzeltildi:** Türkçe ders kahve → **Kaleiçi**; Eğitim Aspendos → **Akdeniz Üni kampüsü** (hero+adım+CTA); Travel belirsiz `lagoon` + düşük çöz `kaleici` → **Suluada/Kemer/Beach Park/Kaleiçi içi**.
- **Land of Legends 2 farklı sunum:** sağ kolonda **iç tasarım (Kingdom Hotel)** + **Aqua park** görsel kartları + tanıtım videosu. Otomatik slot: `lol-interior.jpg` / `lol-aqua.jpg` (yoksa landoflegends/coaster fallback).
- **Oteller genişledi:** Maxx Royal · Rixos Premium · **NG Phaselis** · Kremlin · Miracle + otomatik-yüklenen üst-segment slotlar (3 sütun grid).
- **Animasyon/perf:** satış bandı kayan ışık + sürüklenen nokta, rozet parıltısı, otel kartı hover-lift; aktivite videoları zaten lazy (preload=none, tek-aktif). `tsc` ✓, `next build` ✓ (11/11).

### 🆕 Senin bırakacağın otomatik-yüklenen görsel slotları (`public/images/`)
Dosyayı doğru adla bırak → **otomatik devreye girer** (kod değişmez):
| Dosya | Ne | Nerede görünür |
|---|---|---|
| `lol-interior.jpg` | Land of Legends iç tasarım / Kingdom Hotel | LoL bölümü sol kart |
| `lol-aqua.jpg` | Land of Legends aqua park | LoL bölümü sağ kart |
| `hotel-ngphaselis.jpg` | NG Phaselis Bay gerçek otel fotosu | Oteller (şu an koy stand-in) |
| `hotel-titanic.jpg` | Titanic Deluxe Belek | Oteller (eklenince çıkar) |
| `hotel-delphin.jpg` | Delphin Imperial Lara | Oteller (eklenince çıkar) |
| `hotel-calista.jpg` | Calista Luxury Belek | Oteller (eklenince çıkar) |
| `hotel-regnum.jpg` | Regnum Carya Belek | Oteller (eklenince çıkar) |
| `hotel-nirvana.jpg` | Nirvana Cosmopolitan Kemer | Oteller (eklenince çıkar) |
| `dorm.jpg` (değiştir) | Akdeniz Üni **yabancı öğrenci yurdu** | Eğitim 4. adım |

**Video slotları** (`public/media/`, telifsiz kaynak: Pexels/Pixabay/Mixkit — detay aşağıdaki listede): `kaputas-drone.mp4` (birebir Kaputaş), `dive-fish.mp4` (gerçek Akdeniz sualtı), `act-scuba.mp4` / `act-jetski.mp4`.

## 🔁 Revizyon 2 — kullanıcı geri bildirimi (canlıda)
- **Türkçe sayfası baştan kuruldu:** yapboz KALDIRILDI. Artık **süreç** (4 adım: seviye tespiti → birebir canlı ders → her gün PetLingo pratiği → konuşma & ilerleme) + **PetLingo vitrini** (telefon mockup, 6 özellik, web demo `:4000` butonu + "App Store/Google Play yakında" rozetleri). `components/petlingo-showcase.tsx`.
- **Land of Legends videolu:** resmi **Rixos World tanıtımı** YouTube'dan gömüldü (`jB0xnYf4GrM`), performans için tıklayınca yüklenen facade (`components/youtube-embed.tsx`). CSP'ye youtube-nocookie + i.ytimg.com eklendi.
- **Gerçek görseller (Wikimedia CC):** `lara.jpg` (Lara falezleri), `konyaalti.jpg` (gerçek Konyaaltı + Beydağları), `campus.jpg` (Akdeniz Ünv.), `dorm.jpg` (KYK yurdu). Eski kötü `beach.jpg` Konyaaltı değiştirildi.
- **Eğitim sayfası:** StudyJourney sahneleri artık kampüs / Aspendos / Lara / yurt gerçek görselleri. **Lara Street View koordinatı düzeltildi** (ana sahil yoluna taşındı — "çalışmıyor" sorunu).
- **Sualtı "yapay" görünümü:** DiveHero'da ağır mavi kaplama + dip karartma hafifletildi → gerçek deniz daha net. (Tam çözüm: `dive-fish.mp4`'i gerçek Akdeniz klibiyle değiştir — aşağıdaki liste.)
- **Performans:** DiveHero video `preload=metadata`, YouTube/Street View/harita hepsi on-demand (tıkla/yaklaş) yüklenir.

## ✅ Yapıldı (canlıda)

### Teknik temel
- **Lenis** momentum smooth scroll + **GSAP**. Tüm scroll-sürücülü sahneler kendi rAF + scroll-event mekanizmasıyla (Lenis uyumlu, `seg()` faz haritası).
- Tipografi: Cormorant Garamond (serif) + Onest (gövde), 5 dil (TR/EN/RU/KK/UZ), latin-ext + Kiril.
- Renk/UI: turkuaz + mercan gradient palet, ışık-parıltılı premium butonlar, film grain.
- **CSP:** `frame-src` Google'a açıldı (`www.google.com` + `maps.google.com`) — Street View/harita gömmek için. `frame-ancestors 'none'` korunuyor → siteyi kimse iframe'leyemez.

### Ana sayfa immersive akış
Kaputaş "denize dalış" hero (üstten drone foto → suya zoom → gerçek sualtı video) · aktivite inişi · Land of Legends · Oteller (CC) · yatay "Antalya'nın incileri" · editoryal hizmetler · Türkçe alfabe · neden biz · CTA.
- **YENİ:** DiveHero artık `aerialVideo` prop'u alıyor → Kaputaş dron VİDEOSU geldiğinde tek satırla aktif olur (poster = kaputas.jpg fallback). Bkz. aşağıdaki medya listesi.

### 🆕 İç sayfalar — hepsi immersive yeniden tasarlandı
Hepsi `CinematicHero` (scroll-parallax + zoom, opsiyonel video) ile açılıyor.
1. **Antalya** (`app/[locale]/antalya/page.tsx`) — sinematik hero + editoryal giriş + yatay bölge galerisi + **Street View "sokakta yürü"** (Kaş/Kaleiçi/Kemer/Side/Alanya/Kalkan) + CTA.
2. **Türkçe / Lessons** (`lessons/page.tsx`) — **Türkçe kelime YAPBOZU** (sürükle-bırak, mouse+dokunmatik, konfeti): DENİZ/GÜNEŞ/ÇAY/KAHVE/KALE/LİMAN. + ders süreleri + mevcut randevu widget'ı.
3. **Eğitim / Education** (`education/page.tsx`) — **"Türkiye'de okuma" immersive iniş** (4 adım: program→burs→belge/geliş→yurt&hayat) + **Street View kampüs/Lara/Konyaaltı** "içine girer gibi" + CTA.
4. **Hakkımızda** (`about/page.tsx`) — manifesto + iki kurucu hikayesi (editoryal) + değerler bandı.
5. **SSS** (`faq/page.tsx`) — animasyonlu akordeon (`FaqAccordion`), yumuşak yükseklik geçişi.
6. **İletişim** (`contact/page.tsx`) — sinematik hero + form/ödeme + **Antalya haritası** gömülü.

### Yeni bileşenler
`components/cinematic-hero.tsx` · `street-walk.tsx` (anahtarsız svembed) · `alphabet-puzzle.tsx` · `study-journey.tsx` · `faq-accordion.tsx`.

### i18n
5 dile **`imm`** ad alanı eklendi (ant_* / les_* / edu_* / ab_* / con_* / faq_*) — tümü çevrildi. JSON'lar geçerli, `tsc --noEmit` ve `next build` ✓.

## 🎬 MEDYA İNDİRME LİSTESİ (sen `public/media/` ve `public/images/` içine bırak → otomatik çalışır)

> En iyi kaynak: **Pexels Videos** (telifsiz, ticari serbest, atıf gerekmez). Alternatif: Pixabay, Coverr, Mixkit, Videvo (lisansı kontrol et). Foto: Wikimedia Commons / Unsplash / Pexels.

| Dosya (tam ad) | Nereye | Pexels/arama terimi | Etki |
|---|---|---|---|
| `dive-fish.mp4` (DEĞİŞTİR) | `public/media/` | `Mediterranean reef`, `Kaş diving`, `underwater sea Turkey` | Hero'daki sualtı **gerçek Akdeniz** olur (şu an genel resif) |
| `kaputas-drone.mp4` (YENİ) | `public/media/` | `Kaputaş`, `Kaş Kalkan drone`, `turquoise beach aerial` | Üst hero foto yerine **dron video** olur |
| `act-scuba.mp4` / `act-jetski.mp4` | `public/media/` | `scuba diver`, `jet ski` | Daha kaliteli aktivite klipleri |
| `campus.jpg`, `dorm.jpg` (ops.) | `public/images/` | `Turkish university campus`, `student dormitory` | Eğitim sahnesi gerçek kampüs/yurt fotosu |

**Dron Kaputaş videosunu aktifleştir:** dosyayı koyduktan sonra `app/[locale]/page.tsx` içindeki `<DiveHero ... />` etiketine `aerialVideo="/media/kaputas-drone.mp4"` ekle. Sualtı için sadece `dive-fish.mp4`'i değiştirmen yeterli (kod değişmez).

## 🔑 Kararlar / açık konular
- **Street View yöntemi:** Anahtarsız `svembed` (kullanıcı seçimi). Koordinatlar curate edildi; Google Maps'te Street View'ı açıp `@lat,lng` ile ince ayar yapılabilir (`components/street-walk.tsx`). Bazı konumlarda en yakın panorama biraz kayık gelebilir.
- **Oteller:** hâlâ telifsiz (CC) gerçek otel görselleri. Resmi materyal gelince premium yerleştirilir.

## ⏭️ Sıradaki
- [ ] Gerçek Kaputaş dron videosu + gerçek Akdeniz sualtı (yukarıdaki liste — kullanıcı dosyaları bırakacak).
- [ ] Street View koordinat ince ayarı (canlıda kontrol sonrası).
- [ ] Otel bölümü resmi görsellerle yükseltme.
- [ ] Yapbozu genişletme: cümle kurma / harf-ses eşleştirme modları (istenirse).
- [ ] Performans: çok video/iframe → zayıf cihaz; lazy + tek-aktif-video + iframe-on-demand uygulandı.

## Notlar
- Deploy: sunucuda `cd /opt/antalya-bridge && git pull && docker compose up -d --build`.
- Doğrulama: `tsc --noEmit` (✓), `next build` (✓ 11/11 sayfa). Görsel kontrol canlıda (oynayan videolar nedeniyle otomatik tarayıcı yakalama donabiliyor).
