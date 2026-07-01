# Admin paneli yeniden tasarımı — tasarım dokümanı

Tarih: 2026-07-02 · Dal: `claude/redesign-conversion` · Durum: kullanıcı onaylı tasarım

## Amaç

Mevcut admin paneli (Rev 21–24) işlevsel ama kullanıcı sonucu beğenmedi: "basit değil,
göze şık gelmiyor, erişilebilir değil." Hedef: **temiz & modern araç** estetiğinde
(Linear/Notion netliği), her detayın tek yerden yönetildiği, telefonda da rahat bir panel.

**Değişmezler (en önemli kural):**
- Server action'lar, alan adları (`key|||locale`, sır input'ları, SaleForm adları),
  API rotaları ve veri katmanı **birebir korunur**. Bu bir sunum + az sayıda ek işlev projesidir.
- Override kaydı yoksa public site **birebir bugünkü gibi** görünür (faq/tours/asset kalıbı).
- Public veriyi değiştiren her yeni admin aksiyonu `requireAdmin` + `audit` +
  `revalidatePath("/", "layout")` çağırır (ISR 5 dk gecikmesin).
- Rotalar değişmez: `/admin/content` Site Editörü olur, `/admin/ai` kalır, vb. Kırık link yok.

## Kapsam

1. Tüm panelin görsel yeniden tasarımı (tasarım sistemi + kabuk + 18 sayfa).
2. Site Editörü: metin + görsel + bölüm yönetimi tek ekranda.
3. Bölüm **sıralama** (yeni işlev) — 7 public sayfanın tamamında + mevcut göster/gizle.
4. Tur editörü genişletmesi (yeni işlev): kodlu turların adımları dahil her şey
   düzenlenebilir; ikon seçici (Font Awesome), satır bazlı sırala/aktif-pasif.
5. AI asistan: sağ yan panel (her sayfa) + dashboard'da gömülü kart.

Kapsam DIŞI: canvas/Wix tarzı tıkla-düzenle editör; yeni DB tabloları/migration;
public sayfa tasarımlarının değişmesi.

## 1. Tasarım sistemi ve kabuk

**Görsel dil (`app/admin/admin.css` baştan yazılır):**
- Tek font: Onest (Cormorant ve altın/gradyan süslemeler adminden çıkar).
- Beyaz kart yüzeyleri, açık gri sayfa zemini, 1px ince çizgiler, minimum gölge.
- Turkuaz yalnız etkileşim rengi: aktif menü, birincil buton, switch-açık, focus.
  Mercan yalnız tehlikeli işlem. Durum çipleri sakin tonlar (yeşil/sarı/kırmızı).
- `components/admin/ui.tsx` bileşen adları ve prop API'leri aynı kalır; yalnız
  görünümleri değişir → 18 sayfa kırılmadan yeni dili giyer.

**Kabuk (`app/admin/layout.tsx`):**
- Açık renkli, sade sol menü (koyu-deniz kalkar); daraltma + localStorage davranışı korunur.
- YENİ: her sayfada sabit üst bar — solda sayfa adı, sağda "Siteyi Gör" +
  **AI Asistan butonu** (yan panel açar) + kullanıcı/çıkış.
- Mobil: mevcut üst bar + alt sekme çubuğu + drawer aynen kalır (iyi çalışıyor).

**Menü (`components/admin/nav-config.tsx`):**
- Grup yapısı korunur. Değişiklikler: "Ana Sayfa & Bölümler" → **"Site Editörü"**;
  "Sayfalar" → **"Özel Sayfalar"**; "Yardımcı > AI Asistan" menüden çıkar
  (üst bar butonu yerini alır, `/admin/ai` rotası çalışır kalır).
- Sağ-alt AI balonu (`ai-fab.tsx`) kalkar; yerine üst bar butonu + dashboard kartı.

## 2. Site Editörü (`/admin/content`)

Bugün ayrı üç blok (metin editörü, görsel yöneticisi, bölüm aç/kapat) tek yapıda birleşir:

- Üst araç çubuğu (mevcut mantık): sayfa sekmeleri (Anasayfa/Antalya/Dersler/Eğitim/
  Hakkımızda/SSS/İletişim) + tek dil düzenleme (başka dilde 🇹🇷 referans etiketi) +
  hep görünür Kaydet. `saveTexts` + `key|||locale` birebir korunur.
- Sayfanın bölümleri **sitedeki gerçek sırasıyla** kart kart listelenir. Kart başlığında:
  sürükle-bırak tutamacı (mobilde ↑↓ butonları), aç/kapat switch, "Yayında/Gizli" rozeti.
- Kart açılınca: o bölümün metin alanları (content-map'ten) + o bölümün görsel/video
  slotları (asset-slots'tan, Değiştir/Sıfırla ile) + "Sitede: X sayfasının N. bölümü ·
  Sitede gör →" satırı.
- Hero ve kapanış CTA kartları kilitli (taşınamaz/gizlenemez) — sayfanın omurgası korunur.
- SSS sekmesi faq-manager'ı (madde ekle/sil/sırala) bu yapı içinde sunar.
  Turlar sekmesi `/admin/tours`'a yönlendirir.
- Eşleme: content-map bölümleri ↔ section-registry kimlikleri ↔ asset-slot'lar
  sayfa bazında birleştirilir; eşlenmeyen metinler "Diğer" kartında kalır.

## 3. Bölüm sıralama mimarisi (yeni işlev)

- **Kayıt:** `Setting` `secorder:<sayfa>` = sıralı bölüm-id JSON listesi. Migrationsız.
  Mevcut `sec:<id>` = "off" göster/gizle sistemi aynen kalır.
- **Kayıt defteri:** `lib/section-registry.ts` 7 public sayfanın bölümleriyle genişler.
  Hero/kapanış CTA kayıt defterine girmez (kilitli).
- **Public render kalıbı:** her sayfada bölümler isimli parçalara ayrılır
  (`Record<id, ReactNode>`), kaydedilmiş sıra uygulanır, gizliler atlanır, hero üstte /
  CTA altta sabit. Bölüm içeriğine ve tasarımına dokunulmaz.
- **Kendini onarma:** tanınmayan id yok sayılır; listede olmayan yeni bölüm varsayılan
  konumuna girer; DB hatasında varsayılan sıra (try/catch, `getHiddenSections` kalıbı).
- **Aksiyon:** `saveSectionOrder(page, ids)` — `requireAdmin` + `audit` +
  `revalidatePath("/", "layout")`.
- **Doğrulama:** `tsc` + `next build` + canlıda 7 sayfada "sırala → kontrol → sıfırla" turu;
  sıralama saf fonksiyonu birim test edilebilir.

## 4. Tur editörü genişletmesi (`/admin/tours/[key]`)

Kullanıcı isteği: Hazır Rotalar'da **her şey** değiştirilebilir olmalı.

- **Kodlu turların (r1–r5) gün-gün adımları da düzenlenebilir olur.** Editör mevcut
  adımları çevirilerden önden doldurur; değişiklik `tours:items` JSON'una override
  olarak yazılır (`TourCfg.steps` artık kodlu turlar için de). Override yoksa site aynı.
- **Satır kalıbı** (üç yerde: gün-gün plan, "Pakete dahil" listesi, özel tur durakları):
  sürükle-bırak sıra · gün numarası · **ikon** (tıkla → seçici) · başlık + açıklama
  (dil sekmeli; boş dil → TR'ye düşer, `pickL10n`) · aktif/pasif switch · sil · satır ekle.
  Satıra tıklayınca genişler, yazılar doğrudan input olur.
- **"Pakete dahil" listesi tur başına özelleşir:** yeni `TourCfg.included[]`
  (`{icon, label: L10n, active}`); varsayılan = bugünkü 6 global madde (inc_*).
- **İkon seçici: Font Awesome Free.** Aranabilir modal (Türkçe anahtar kelime
  eşlemeleriyle: "tekne", "müze", "plaj"...). Kayıt: ikon adı (ör. `fa:plane`).
  **Public render: yalnız kullanılan ikonlar sunucuda inline SVG** olarak gömülür —
  webfont yüklenmez, site performansı etkilenmez. Mevcut `route-icons.tsx` seti
  varsayılan kalır; adları FA karşılıklarıyla eşlenir; `ready-routes.tsx`'teki
  sabit `landmark` (özel tur durakları) seçilen ikonu kullanır.
- **Şema ekleri (aynı JSON, migrationsız):** `TourStepCfg.icon?`, `TourStepCfg.active?`,
  `TourCfg.included?`. Tüm aksiyonlar mevcut `lib/tour-actions.ts` kalıbında
  (requireAdmin + audit + revalidate).

## 5. AI yan paneli

- Üst bar butonu her sayfada; masaüstünde sağdan ~400px panel (içerik görünür kalır),
  telefonda alttan tam boy sheet. Kabukta yaşadığı için **sohbet sayfa geçişinde kaybolmaz**.
- Dashboard'da gömülü AI kartı: yazılan soru paneli açıp gönderir.
- Sayfaya duyarlı öneri çipleri (bulunulan pathname panele iletilir — tek küçük ek).
- Onaylı işlem kartı: AI'nin INSERT/UPDATE önerisi kartta gösterilir, kullanıcı
  Onayla demeden yazılmaz; silme yetkisi yok. Arka uç değişmez
  (`/api/admin/ai` + `/api/admin/ai/apply`); anahtar yoksa "nasıl açılır" rehberi.

## 6. Diğer ekranlar (yeniden giydirme)

- **Dashboard:** metrik kartları → AI kartı → "Bugün ne yapmalıyım?" (satır satır Git →)
  → son hareketler. Hızlı işlem kutucukları kalkar (menü zaten sade).
- **Listeler** (Talepler, Rezervasyonlar, Sohbetler, Satış Defteri, Faturalar, Kayıtlar):
  masaüstü tablo / mobil kart-liste korunur; ince çizgili satırlar, sakin durum çipleri,
  satırda tek belirgin aksiyon, davetkâr boş durumlar.
- **Formlar** (Satış, İndirim Kodları, Ödeme Yöntemleri, Ayarlar, Kullanıcılar):
  bölümlü tek kolon, alan altı yardım satırları, Kaydet üstte sabit. Sır maskeleme
  ("boş=değişmez") ve alan adları birebir.
- **Görseller:** ızgara + "Kullanımda" rozeti + kütüphaneden silme korunur.
- **Özel Sayfalar (CMS):** blok editörü işlevleri (sürükle-sırala, önizleme iframe,
  "CMS ile yayınla" switch, tehlikeli bölge) yeni dille.
- **Giriş:** sade — logo, iki alan, tek buton.

## Hata yönetimi

- DB okunamazsa: varsayılan sıra/görünürlük/içerik (mevcut try/catch kalıpları).
- Bozuk `secorder`/`tours:items` JSON: yok sayılır, varsayılana düşülür.
- İkon adı çözülemezse: varsayılan ikon (`landmark`/eşlenmiş FA karşılığı) render edilir.

## Test / doğrulama

- Her aşamada `tsc --noEmit` + `next build`.
- Sıralama/birleştirme saf fonksiyonlarına birim test.
- Deploy sonrası canlıda: 7 sayfada bölüm sırala/gizle/sıfırla turu; tur editöründe
  adım düzenle/ikon değiştir/aktif-pasif; AI panelinde soru + onaylı işlem;
  telefonda menü + Site Editörü + tur editörü.

## Uygulama sırası (plan aşamasında detaylanır)

1. Tasarım sistemi + kabuk + menü (görsel temel).
2. Bölüm sıralama altyapısı + 7 public sayfa refaktörü.
3. Site Editörü.
4. Tur editörü genişletmesi (ikon seçici dahil).
5. AI yan paneli + dashboard.
6. Kalan ekranların giydirilmesi + canlı doğrulama.

## Notlar

- Deploy: canlı sunucu `claude/redesign-conversion` dalından
  (`cd /opt/antalya-bridge && git fetch && git reset --hard origin/claude/redesign-conversion
  && docker compose up -d --build`).
- Güvenlik: sunucu root şifresi sohbete girildi → kullanıcı deploy sonrası
  `passwd` ile değiştirmeli.
