# DEVRİM — Antalya Bridge immersive site (durum)

> Canlı: **http://45.67.203.149:3010** (mutlaka `http://`) · dal **`claude/redesign-conversion`**
> ↩️ **Geri dönüş (rollback):** eski sürüm dokunulmadı → dal `claude/consulting-site-plan-6k4lix` + etiket `safe/before-redesign-rev9`. Beğenilmezse sunucuda o dala `git reset --hard` + rebuild.
> Görsel/medya kaynakları: `public/images/CREDITS.txt` (CC / Mixkit / CC0) · oteller: kullanıcının verdiği resmi fotoğraflar (`public/images/hotels/`).

## 🔁 Revizyon 30 — Admin yeniden tasarım FAZ 6: kalan ekranlar + PROJE TAMAMLANDI (GÜNCEL · dal `claude/redesign-conversion`)

> Faz 6 (plan: `docs/superpowers/plans/2026-07-02-admin-redesign-6-kalan-ekranlar.md`) + tüm-proje final incelemesi. 6 fazlık admin yeniden tasarımı (Rev 25-30, spec: `docs/superpowers/specs/2026-07-02-admin-redesign-design.md`) **BİTTİ**. `tsc` ✓ · `next build` ✓ · final inceleme: 0 kritik/önemli, tüm minor'lar ertelenebilir.
- **Dashboard:** metrikler → AI kartı → "Bugün ne yapmalıyım?" (satır satır Git →) → son hareketler; hızlı işlem kutucukları kalktı. **Giriş:** `#0c2f39` gradyan gitti, nötr zemin + beyaz kart (submit akışı bayt-eşdeğer).
- **Listeler** (talepler/rezervasyon/sohbet/kayıtlar + satış/fatura/kod/ödeme): tek kart + ince çizgili satırlar, sakin durum çipleri, Türkçe durum etiketleri (enum value'lar birebir). **Formlar:** `Section`/`Field` bölümlü; SaleForm 19 alan adı bayt-eşdeğer. **Ayarlar/Kullanıcılar/Görseller/Özel Sayfalar:** dekor kalıntıları temizlendi; sır maskeleme, son-admin koruması, blok editörü birebir.
- **Final inceleme (tüm dal, 33 commit):** bölüm id üçlüsü (registry ↔ public sayfalar ↔ editor-map) programatik tutarlı; z-index katmanları (TopBar 25 < AI panel 45 < modallar 50 < ikon seçici 60) doğru; tur steps/included round-trip sağlam; public dosya değişimleri yalnız onaylı kapsam. Ertelenen minor'lar: FaIcon ölü export, AI panel focus yönetimi (a11y), drag dışa-bırakma optimistic sapması (refresh'te düzelir).
- ⚠️ Kullanıcıya not: admin'e girip görsel tur atılmalı (lokalde DB/hesap yok, oturumlu ekranlar canlıda doğrulanmadı); root şifresi değiştirilmeli.

## 🔁 Revizyon 29 — Admin yeniden tasarım FAZ 5: AI yan paneli (dal `claude/redesign-conversion`)

> Faz 5 (plan: `docs/superpowers/plans/2026-07-02-admin-redesign-5-ai-panel.md`). `tsc` ✓ · `next build` ✓ · incelemeler temiz · canlı 200.
- **AI yan paneli:** sağ-alt balon (FAB) KALKTI → üst bardaki "AI Asistan" butonu her sayfada sağdan ~400px panel açar (mobilde alttan sheet + mobil üst barda buton). Sohbet mantığı `components/admin/ai-chat-core.tsx`'e taşındı — **`/admin/ai` tam sayfa da aynı çekirdeği kullanır**; API rotalarına dokunulmadı, onaylı işlem kartı + anahtarsız rehber birebir. Panel layout'ta mount → **sohbet sayfa geçişinde kaybolmaz**; sayfaya duyarlı öneri çipleri (satış/tur/talep).
- **Dashboard AI kartı:** metrik bandının altında; yazıp gönderince yan panel açılıp soruyu iletir (`useAiPanel().openWith`); anahtar yoksa Ayarlar'a yönlendirir.

## 🔁 Revizyon 28 — Admin yeniden tasarım FAZ 4: tur editörü — her şey düzenlenebilir (dal `claude/redesign-conversion`)

> Faz 4 (plan: `docs/superpowers/plans/2026-07-02-admin-redesign-4-tur-editoru.md`). `tsc` ✓ · `next build` ✓ · incelemeler temiz (1 Important bulgu düzeltildi) · canlı 200.
- **Tek kaynak:** kodlu 5 turun adımları `lib/tour-defaults.ts`'e çıkarıldı (public render + admin prefill aynı veri; ready-routes çıktısı bayt-bayt aynı, script'le kanıtlı). Tipler: `TourStepCfg.icon?/active?`, `TourCfg.included?`.
- **Font Awesome altyapısı:** `@fortawesome/free-solid-svg-icons` YALNIZ sunucuda; public'te kullanılan ikon inline SVG gömülür (`fa-icon.tsx` + client `tour-icon.tsx` — client bundle'da FA yok, grep'le kanıtlı). Admin seçici: `/api/admin/icons` (requireAdmin, 1422 ikon ~796KB, lazy+cache) + `lib/icon-search-tr.ts` (~180 Türkçe takma ad: tekne, müze, plaj...).
- **Tur editörü:** gün-gün plan artık KODLU turlarda da düzenlenebilir (4 dilli çeviri prefill'i); "Pakete dahil" tur başına özelleşir (varsayılan 6 madde); tek `EditableRow` kalıbı: sürükle+↑↓, ikon seç, dil sekmeli başlık/açıklama, gün, aktif/pasif, sil, satır ekle. `saveTour` geriye uyumlu genişledi (`sanitizeCfg` doğrulama).
- **Önemli düzeltme (cb03889):** kodlu tura dokunmadan Kaydet, çeviri anlık görüntüsünü override olarak YAZMAZ (dirty-tracking; 16 mutasyon yolu tek setter hunisinden — bypass imkânsız, yeniden incelemeyle kanıtlı). Kaydedersen metinler o anki halleriyle donar — editörde not var.

## 🔁 Revizyon 27 — Admin yeniden tasarım FAZ 3: Site Editörü (dal `claude/redesign-conversion`)

> Faz 3 (plan: `docs/superpowers/plans/2026-07-02-admin-redesign-3-site-editoru.md`). `tsc` ✓ · `next build` ✓ · görev başı inceleme temiz · canlı 200.
- **`lib/editor-map.ts`:** content-map (~470 anahtar) + section-registry (33 bölüm) + asset-slots (76 slot) TEK modelde (`EditorSection`); statik eşleme tablosu; invariant'lar bağımsız script'le kanıtlı (hiç anahtar kaybolmaz, her registry id tam bir kartta).
- **Site Editörü (`/admin/content`):** sayfa sekmeleri + dil + Kaydet araç çubuğu KORUNDU (`saveTexts`, `key|||locale`, tek form `#ce-form`, sekme geçişinde kayıp yok — alanlar DOM'da hidden kalır); her sayfa BÖLÜM KARTLARI sitedeki gerçek sırayla: kilit/tutamaç + ↑↓ + aç-kapat switch + Yayında/Gizli + kart içinde o bölümün metinleri VE görsel/video slotları (`AssetSlotGrid`) + "Sitede gör →". SSS sekmesi faq-manager + Turlar yönlendirme kartı.
- **Sürükle-bırak:** kart tutamacından (block-reorder kalıbı), yalnız registry kartları; bırakınca `saveSectionOrder`; stable-key sayesinde form girdileri kaybolmaz. `section-toggles.tsx` + `section-manager.tsx` + ölü `AssetManager` sarmalayıcı SİLİNDİ.
- Bilinen minor'lar (final incelemede): dışa-bırakmada geçici optimistic sapma (refresh'te düzelir), global pending.

## 🔁 Revizyon 26 — Admin yeniden tasarım FAZ 2: bölüm sıralama 7 sayfada (dal `claude/redesign-conversion`)

> Faz 2 (plan: `docs/superpowers/plans/2026-07-02-admin-redesign-2-siralama.md`). `tsc` ✓ · `next build` ✓ · görev başı bağımsız inceleme temiz · canlıda 7 sayfa 200 doğrulandı.
- **Altyapı:** `section-registry` 7 sayfaya genişledi (33 bölüm; home 10 id birebir). `lib/sections.ts`: `getSectionOrders` (tek sorgu, `secorder:` öneki) + saf `applySectionOrder` (bilinmeyen id atılır, eksik id varsayılan komşusunun arkasına — kendini onarır; varsayılana eşitse kayıt SİLİNİR → "kayıt yok = bugünkü site" değişmezi). `section-actions`: `saveSectionOrder` + `moveSection` (requireAdmin+audit+revalidatePath).
- **7 public sayfa** `[id, JSX]` kalıbına geçti (home/antalya/lessons/education/about/faq/contact): bölüm JSX'i VERBATIM taşındı (denetçiler satır-eşleştirmeyle kanıtladı), hero+kapanış CTA sabit; kayıt yoksa çıktı birebir aynı.
- **Admin:** `components/admin/section-manager.tsx` — `/admin/content`te sayfa seçicili panel: ↑↓ sırala + aç/kapat (optimistic). content-editor'daki eski SectionToggles prop'suz kaldı (render etmiyor); Faz 3 Site Editörü hepsini kart arayüzüne taşıyacak.

## 🔁 Revizyon 25 — Admin yeniden tasarım FAZ 1: temiz & modern kabuk (dal `claude/redesign-conversion`)

> Kullanıcı Rev 21-24 admin görünümünü reddetti ("basit değil, şık değil") → onaylı spec: `docs/superpowers/specs/2026-07-02-admin-redesign-design.md` (6 faz). Bu revizyon = Faz 1 (plan: `docs/superpowers/plans/2026-07-02-admin-redesign-1-kabuk.md`). `tsc` ✓ · `next build` ✓ · tüm-dal kod incelemesi temiz.
- **Tasarım sistemi (`admin.css` baştan):** nötr açık palet **`.adm-body` KAPSAMINDA** override (globals.css'e dokunulmadı → public birebir aynı). Beyaz kartlar, açık gri zemin, ince çizgiler, gölgesiz düz butonlar; turkuaz (`11 122 140`) yalnız etkileşim; Cormorant/altın adminden çıktı (`--font-display→sans`, `--gold→amber`, `--lagoon→primary` alias). 48 eski sınıf korundu + `.adm-topbar/.adm-topbar-title/.adm-btn-ai`.
- **Kabuk:** AÇIK kenar çubuğu (248px, daralt=72px, localStorage korunur) + **masaüstü üst bar** (`top-bar.tsx`: sayfa adı + Siteyi Gör + AI Asistan→`/admin/ai`). **Onest fontu admin'e İLK KEZ gerçekten yüklendi** (admin kendi `<html>`'ini render ediyor, font değişkenleri hiç gelmiyormuş — başlıklar sistem serif'ine düşüyordu). Mobil alt sekme + drawer korundu (drawer açık temaya uyarlandı).
- **Menü:** 5→4 grup; "Ana Sayfa & Bölümler"→**Site Editörü**, "Sayfalar"→**Özel Sayfalar**, son grup "Yönetim"; AI menüden çıktı (üst bar butonu). Rotalar değişmedi. AI balonu (FAB) Faz 5'e kadar duruyor.
- ⏭️ Sıradaki fazlar: 2) bölüm sıralama (7 sayfa) · 3) Site Editörü · 4) tur editörü (FA ikon seçici, kodlu tur adımları) · 5) AI yan panel · 6) kalan ekranlar (login gradyanı `#0c2f39` yerine nötr — bkz. final inceleme Minor #1).

## 🔁 Revizyon 24 — TURLAR yönetimi: sırala/aç-kapat/foto/isim + yeni tur ekle (dal `claude/redesign-conversion`)

> Kullanıcı: "Turlar adında page oluştur, anasayfadaki turları oraya göm; tura tıklayınca fotosunu-içeriğini-sırasını-pasif/aktifini HER ŞEYİNİ değiştireyim." Yapıldı (B aşamasının turlar yarısı). `tsc` ✓ · `next build` ✓.
- **Depolama:** `Setting` `tours:items` JSON (migrationsız, faq:items kalıbı). Kodlu 5 rota VARSAYILAN kalır; kayıt yoksa site birebir aynı (bozulmaz). `lib/tours.ts` (tipler, getTourCfgs, pickL10n, tourOrder, CODED_TOURS) + `lib/tour-actions.ts` (saveTour/toggleTour/moveTour/deleteTour — hepsi requireAdmin+audit+revalidate).
- **Public:** `components/ready-routes.tsx` merge — override (isim/rozet dil bazlı, gün/yıldız/otel/konum/foto), aktif filtresi, sıraya dizme, **özel turlar** (uçuş+transfer otomatik + admin'in gün-gün durakları, otel neden/not, harita otel+konum aramasıyla).
- **Admin `/admin/tours` (nav: Sitem > Turlar):** turlar sitedeki kart görünümüyle; ← → sırala, switch aç/kapat, özel turda Sil, "Yeni tur ekle". **`/admin/tours/[key]`** editör: foto (yükle/kütüphane/URL + sıfırla), dil sekmeli isim+rozet (kodluda boş=varsayılan, placeholder gösterir), gün/yıldız/otel/konum, aktif switch; özel turda gün-gün plan (durak ekle/sil) + otel tanıtımı. `yeni` → boş özel tur.
- Kodlu turların derin metinleri (gün-gün plan) hâlâ Site İçeriği > Antalya sekmesinden (routes.* çevirileri) — editörde not olarak belirtiliyor.

## 🔁 Revizyon 23 — Admin cila turu: görsel kalite + önizleme fix + switch'ler (dal `claude/redesign-conversion`)

> Kullanıcı geri bildirimi: "buton/kart/gölge/font UI-UX zayıf; bölüm bölüm ayır büyüt; önizleme hatalı (üzgün-yüz); aktif/pasif olmalı; dil'e tıklayınca içerik gelmiyor; Kaydet neden en altta; sol menü kapansın." Hepsi yapıldı, deploy edildi. `tsc` ✓ · `next build` ✓.
- **Görsel sistem (`admin.css`):** derinlikli butonlar (lagoon→primary gradient + hover-lift + gölge), katmanlı kart gölgeleri + daha yumuşak köşe, **editoryal Cormorant bölüm başlığı** (`.adm-section-title` + altın dikey bar), **`.adm-thumb`** (görsel kartı hover-lift), **`.adm-switch`** (aç/kapa anahtarı), rafine inputlar (46px, iç gölge, yumuşak focus).
- **Önizleme BUG:** site `X-Frame-Options: DENY` + `frame-ancestors 'none'` idi → admin kendi sitesini iframe'de gösteremiyordu. **`SAMEORIGIN` + `'self'`** (dış siteler yine gömemez).
- **Dil BUG:** dil değişince alanlar yeni dile geçmiyordu (uncontrolled remount) → content-editor `key={locale}`.
- **UX:** Kaydet + sekmeler + dil ÜSTTE sabit araç çubuğunda (aşağı inme yok); sol menü **daraltılabilir** (localStorage); AI balonu **her sayfada** (anahtar yoksa "nasıl açılır" notu); görsel yöneticisinde kütüphane **sil** eklendi.
- **CMS sayfa editörü (`pages/[id]`):** PageHeader, gold-bar başlıklar, "Yayında"/"CMS ile yayınla" gerçek **switch**, "Bu sayfayı sil" net **danger buton** (Tehlikeli bölge), BÖLÜMLER büyütülüp kart kart ayrıldı, önizleme uzatıldı + boş-blok notu.
- Not: "Sayfalar" = sıfırdan blokla ÖZEL sayfa kurma (gelişmiş); normal metin/görsel düzenleme **"Ana Sayfa & Bölümler"**tedir (home kodlu tasarım kullandığı için CMS'te boş görünür — normal).

## 🔁 Revizyon 22 — Admin: içerik sayfa-sayfa + görsel yönetimi + SSS/rezervasyon + yüzen AI (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Kullanıcı: "içerik editörü saçma (imm/meta/nav ne?), sayfa-sayfa böl üstte sekmeler; sitenin görsel/videolarını sayfadan değiştireyim (ayrı Görseller sayfası gereksiz); SSS'ye madde ekleyeyim; rezervasyon tarih/saat aç-kapa; her sayfada üstte AI yardımcı. Görsel bir site, yazıyla boğma." Onay: "Yap hepsini." 4 parça, her biri deploy edildi. `tsc` ✓ · `next build` ✓.

- **Parça 1 — İçerik sayfa-sayfa + tek dil:** `lib/content-map.ts` (~470 yazı anahtarı → 8 gerçek sayfa × 51 bölüm, görünüm sırasıyla). `components/admin/content-editor.tsx` (client): üstte **sayfa sekmeleri** (Anasayfa/Antalya/…) + **dil seçici**, TEK DİL düzenlenir; başka dilde 🇹🇷 referans metni etiket olur. Sekme değişince düzenleme kaybolmaz. `saveTexts` + `key|||locale` alan adları **birebir korundu**. Eşlenmeyenler "Diğer"de.
- **Parça 2 — Görsel/video override (tüm sayfalar):** `lib/assets.ts` (`getAssetMap`/`pickAsset`, `Setting` `asset:` öneki, istek-cache) + `lib/asset-actions.ts` (setAsset) + `lib/asset-slots.ts` (**76 isimli slot**). `components/admin/asset-manager.tsx`: her sayfa sekmesinde o sayfanın tüm görsel/videoları önizlemeli; **Değiştir** (yükle / kütüphaneden seç / URL) + **Sıfırla** — content editörüne gömülü (ayrı Görseller sayfasına gerek yok). Public 7 sayfa + bileşenlerdeki tüm sabit yollar `pickAsset(map, slot, def)` ile sarıldı (**varsayılan fallback → override yoksa site birebir aynı**). ISR revalidate ile anında.
- **Parça 3 — SSS ekleme + rezervasyon aç/kapat:** `lib/faq.ts` + `lib/faq-actions.ts` (`Setting` `faq:items` JSON) + `components/admin/faq-manager.tsx` — SSS sekmesinde madde **ekle/sil/sırala** (seçili dil, diğer diller korunur); public `/faq` bunları koddaki 4 maddenin altına ekler. Booking'e elle **Aç/Kapat** (slot `booked` toggle) — kapalı slot müşteriye görünmez. (Müşteri zaten yalnız `booked:false`+gelecek slotları görüyordu.)
- **Parça 4 — Yüzen AI yardımcı:** `components/admin/ai-fab.tsx` — **her admin sayfasında sağ altta balon**; açılınca tam AI asistanı paneli (DB sorusu + öneri). Layout'ta `assistantAvailable()` ise gösterilir (mobilde alt sekmenin üstünde).

## 🔁 Revizyon 21 — Admin paneli baştan tasarım + perf/güvenlik/mobil turu (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Kullanıcı admin panelini "berbat, isimler kötü, menü sabit değil, telefondan kullanılamaz" diye tümden reddetti → **bespoke, basit, mobil-öncelikli yönetim paneli** yapıldı (işlev korunarak, yalnız sunum). Ayrıca aynı oturumda performans + ödeme + giriş + mobil düzeltmeleri. `tsc` ✓ · `next build` ✓ (18 admin rotası).

### 🎛️ Admin yeniden tasarım
- **Tasarım sistemi (`app/admin/admin.css` + `components/admin/*`):** marka token'ları (cream yüzey · turkuaz primary · altın accent · mercan danger, Cormorant başlık + Onest gövde). Paylaşılan parçalar `components/admin/ui.tsx` (`PageHeader, Card, Section, StatCard, Field, Badge, EmptyState, LocationHint`) + `icons.tsx` (yalın çizgi ikon seti). Eskiden generic slate/cyan idi, sıfır paylaşılan bileşen vardı.
- **Kabuk (`app/admin/layout.tsx`):** **sabit koyu-deniz kenar çubuğu** (264px, sticky, kendi kaydırması), 15 düz link → **5 anlaşılır grup** (Sitem · Gelen Kutusu · Satış & Para · Yardımcı · Ayarlar) + net Türkçe isimler ("CMS" jargonu kaldırıldı, "Medya"→"Görseller", "Denetim"→"Kayıtlar"). Aktif durum vurgusu (`sidebar-nav.tsx`, usePathname). "Siteyi Gör" butonu.
- **Mobil (`components/admin/mobile-nav.tsx`):** üst bar + **sabit alt sekme çubuğu** (Panel·Sitem·Gelen·Satış·Daha fazla) + tam-boy drawer, Gelen Kutusu'nda **yeni talep rozeti** (NEW lead sayısı), safe-area. Telefondan yönetim artık kolay.
- **Dashboard (`app/admin/page.tsx`):** 4 bant — "Bugün ne yapmalıyım?" dikkat kartı (yeni talep/bekleyen fatura/yaklaşan rezervasyon, boşsa "her şey yolunda ☀️") · metrik StatCard'lar (bu ay ciro/yeni talep/rezervasyon/bekleyen fatura) · hızlı işlem kutucukları · son hareketler (audit).
- **Tüm sayfalar yeniden stillendi** (5 paralel ajanla, işlev/`name`/server-action korunarak): geniş tablolar **telefonda kart-listesi + masaüstünde tablo**; formlar bölümlere ayrıldı + yardım metinleri ("bu, sitede şurada görünür"); durum çipleri `Badge`; boş durumlar `EmptyState`; medyada "Kullanımda" rozeti; premium **giriş sayfası**; AI sohbet ve ayarlar (sırlar maskeli, "boş=değişmez") yeni stille. `key|||locale`, sır input'ları, SaleForm adları vb. **birebir korundu** (0 yasak renk kaldı).
- ⏭️ Yapılmadı (bilinçli): tam Wix-canvas editörü (aylarca sürer). Mevcut: sayfa editöründe **canlı iframe önizleme** + "sitede gör" linkleri. Medyada gerçek klasör/etiket için şema değişikliği gerekir (şimdilik alt-metin + "Kullanımda" rozeti).

### ⚡ Aynı oturum — perf/güvenlik/mobil (deploy edildi)
- **ISR:** public sayfalar `force-dynamic` → `revalidate=300` + `generateStaticParams` (● SSG). Canlı: 330ms→117ms, `x-nextjs-cache: HIT`. Admin düzenlemeleri `revalidatePath("/", "layout")` ile anında yansır (booking dahil).
- **Kod-bölme:** GSAP+Lenis (`smooth-scroll.tsx`) + lottie-web (`petlingo-live.tsx`) dinamik import → başlangıç JS'inden çıktı. Viewport export + theme-color.
- **Ödeme:** satış defteri PERCENT indirim yuvarlaması faturayla tutarlı (floor); fatura ref 6→12 karakter (IDOR/PII). (AMOUNT `*100` money.ts 2-ondalık konvansiyonuyla tutarlı — bilerek dokunulmadı.)
- **Giriş bug'ı:** oturum çerezi `secure: NODE_ENV==="production"` idi ama site HTTP → tarayıcı çerezi saklamıyordu → giriş sessizce başarısız. Artık `secure = NEXT_PUBLIC_SITE_URL https` (next.config `isHttps` kuralı). HTTPS'e geçince otomatik Secure.
- **Fermuar → "Dalış portalı":** ana sayfa deneyim bölümü çapraz fermuar yerine **ortadan büyüyen daire** (clip-path evenodd) + ışıltılı su halkası.
- **Tablet:** iletişim/hakkımızda `md:` 2-kolon + güven şeridi 3-up.

## 🔁 Revizyon 20 — Manuel Satış Defteri (/admin/sales) (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Admin'den elle satış/sipariş kaydı: kime (ad·telefon·e-posta·kimlik/pasaport·ülke), ne (hizmet + tur/paket — seçili gelir + elle yazılır), tutar+para birimi, indirim (mevcut koddan seç VEYA manuel), **nasıl+hangi adresle ödendi** (Kaspi/Kripto/Nakit + IBAN/txid datalist), durum (Ödendi/Bekliyor/Kısmi), tarih, not. `tsc` ✓ · `next build` ✓. Migration `0005_sales` otomatik uygulanır.

- **`Sale` modeli** (migration `0005_sales`): tutarlar en küçük birimde (kuruş/cent); `finalAmount = amount − discount` sunucuda hesaplanır. İndirim: manuel girildiyse o; boşsa seçilen `PromoCode`'dan (PERCENT→oran, AMOUNT→×100).
- **`/admin/sales`** (+nav "Satışlar"): ciro özeti (kayıt sayısı + para birimi bazında tahsilat; PARTIAL'da `paidAmount`), açılır "yeni satış" formu, düzenle/sil tablosu. **`/admin/sales/[id]`** düzenleme. Ortak `sale-form.tsx`. `actions.ts` (create/update/delete) `requireAdmin`+`audit`+revalidate.
- **Seçili+serbest:** hizmet dropdown; tur/paket adı datalist (5 hazır rota adı + 8 otel) ama serbest yazılır; indirim kodu dropdown (aktif kodlar); ödeme adresi datalist (kayıtlı PaymentMethod adresleri).
- **AI görebilir:** `Sale` şema bağlamına eklendi → admin asistanı "bu ay kaç satış / toplam ciro" sorabilir (Setting/User hariç, denylist korunur).

## 🔁 Revizyon 19 — Ayarlar admin'den (API anahtarları dahil) + AI OpenRouter (home+admin) (dal `claude/redesign-conversion`)

> **Şu an buradayız.** "Her şeyi admin'den değiştir, API'ler dahil; AI OpenRouter, hem ana sayfa hem admin." `tsc` ✓ · `next build` ✓ (11/11). Migration `0004_settings` sunucuda otomatik uygulanır.

- **`Setting` modeli (key/value) + `lib/settings.ts`:** Tüm ayarlar DB'de; kod **DB → env** sırasıyla okur (React `cache` ile istek başına). `getSetting`, `getAllSettings`, `setSetting`, `getPublicSettings` (sırsız public değerler), `SETTING_DEFS` kayıt defteri.
- **`/admin/settings`** (+nav "Ayarlar"): gruplu form (Yapay Zekâ / İletişim / Site). Düzenlenebilir: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL(_SMART)`, `AI_READONLY_DATABASE_URL`, `WHATSAPP_NUMBER`, `TELEGRAM_USERNAME`, `CONTACT_EMAIL`, `SITE_URL`. Sırlar **maskeli** (boş bırakılırsa dokunulmaz), ADMIN-only, audit'e **değer yazılmaz**, "sil → env'e dön". **Rebuild gerekmez.**
- **AI artık settings'ten (OpenRouter):** `lib/ai/llm.ts` (key/model/referer async, DB→env), `lib/ai/db-readonly.ts` (readonly URL settings'ten, URL değişince client yenilenir), `assistant.ts` (`assistantAvailable` async). **`/api/chat` (ANA SAYFA sohbeti) artık önce OpenRouter** (settings key), Anthropic yalnız env yedek. Admin asistanı da aynı. → OpenRouter anahtarını panele yapıştır, her iki AI **anında** çalışır.
- **WhatsApp/Telegram/SITE_URL/email runtime (DB, rebuild'siz):** `lib/config.ts` client'ta `window.__SITE__` okur (layout enjekte eder `getPublicSettings`'ten) → tüm client butonları (floating-contact, route-gallery "Bu tatili iste", quick-plan, contact-form) runtime. Server tüketicileri `getPublicSettings` kullanır: layout metadata, footer (prop), contact, ready-routes wa, premium ContactInfo/ConversionBand, faq/about/education wa, sitemap, robots, home+about JSON-LD.

### 🔐 Güvenlik notu
- Sırların DB'de tutulması env'den daha az güvenli (DB yedeği sırları içerir). İstendiği için yapıldı; ADMIN-only + maskeli + audit'te değer yok + client'a asla sızmaz. Daha yüksek güvenlik isteyen sır için env hâlâ kullanılabilir (DB boşsa env okunur).
- `AI_READONLY_DATABASE_URL` için **salt-okunur** Postgres kullanıcısı önerilir (DB seviyesinde yazma engeli). Ana `DATABASE_URL` yapıştırılırsa uygulama-seviyesi koruma (SELECT-only doğrulama) devrede kalır ama DB-seviyesi garanti olmaz.

### 🔒 Sertleştirme (Rev 19'a eklendi)
- **AI okuma denylist:** `lib/ai/db-readonly.ts` `validateSelect` artık `"Setting"` ve `"User"` tablolarını reddeder → AI prompt-injection ile bile API anahtarlarını/parola hash'lerini okuyamaz.
- **Sırlar at-rest şifreli:** `lib/settings.ts` secret tipli ayarları **AES-256-GCM** ile şifreler (`SETTINGS_KEY` ya da `AUTH_SECRET`'ten türetilen anahtar; yoksa düz metin geri-uyum). DB dump'ı ele geçse bile şifreli sırlar okunamaz. Çözme yalnız sunucuda; client'a asla gitmez.

### ⛔ AÇIK / SIRADAKİ (Rev 19)
- **HTTPS (kullanıcı alıyor):** Sırları panele girmeden önce TLS şart. `docker/nginx.conf` hazır; domain gelince Let's Encrypt ile aç.
- Kullanıcı panelden girecek: OpenRouter API key (+ model), AI readonly DB URL (salt-okunur Postgres rolü önerilir), WhatsApp, Telegram, SITE_URL → `/admin/settings`.
- Opsiyonel: admin login 2FA. Root şifresi değiştirilmeli; çift fotoğrafı (`founders.jpg`) bekleniyor.

## 🔁 Revizyon 18 — CMS: TÜM premium bileşenler özel-tip (dal `claude/redesign-conversion`)

> **Şu an buradayız.** "Tüm her şeyi bitir" — kalan bespoke bölümler de CMS premium-tipi oldu. Artık **14 premium tip** var → her sayfa (home/antalya/lessons/education/contact/faq) CMS'te tasarım kaybetmeden kurulabilir. `tsc` ✓ · `next build` ✓.
>
> **Premium tipler (`components/cms/premium-blocks.tsx`, hepsi kendi çevirisini okur):** diveHero (ana hero), routeGallery, studyJourney, hotels, horizontalPlaces (Antalya bölgeleri), zipper (fermuar), petlingo, guestVoices, quickPlan, contactInfo (form+ödeme+hızlı iletişim), booking (ders rezervasyon, prisma slot), faqAccordion, trustStrip, conversionBand. Wiring kaynak sayfalarla birebir; metinler **Site İçeriği**'nden 5 dilde. `PremiumBlock` artık `locale` alır (booking için). `BookingWidget` `@/app/[locale]/lessons/booking-widget`'tan import edilir (bracket-path tsc/build ✓).

## 🔁 Revizyon 17 — CMS Faz 2: sürükle-bırak + medya seçici + premium özel tipler (dal `claude/redesign-conversion`)

> Rev 16'daki "Faz 2" maddeleri tamamlandı. `tsc` ✓ · `next build` ✓.

- **Premium özel tipler (`components/cms/premium-blocks.tsx`):** Mevcut sinematik bileşenler CMS bloğu olarak eklenebilir → bir sayfa CMS'e taşınırken **tasarım kaybolmaz**. Tipler: `routeGallery` (ReadyRoutes, propsuz), `studyJourney`, `hotels`, `petlingo`, `guestVoices`, `quickPlan`. Her biri kendi çevirisini okur (wiring kaynak sayfalarla birebir); metinleri **Site İçeriği**'nden düzenlenir. `lib/cms-blocks.ts`'e `custom:true` tipler eklendi (alan yok); `block-renderer` `PREMIUM_TYPES` için `<PremiumBlock>`'a yönlendirir; editör custom blokta alan yerine bilgi notu gösterir.
- **Medya seçici modal (`app/admin/pages/[id]/image-field.tsx`, client):** görsel proplarında URL input + "Seç" → yüklenen medya grid'inden seç (önizleme + temizle). Datalist yerine gerçek modal.
- **Gerçek sürükle-bırak (`app/admin/pages/[id]/block-reorder.tsx`, client):** blok kartları tutamaçtan sürüklenip sıralanır; "Sıralamayı kaydet" → `reorderBlocks` server action (sıralı id listesi → `order` 0..n). ↑↓ butonları da fallback olarak duruyor. Sunucuda render edilen blok kartları client sarmalayıcıya `node` olarak geçer (formlar/inputlar normal çalışır).

### ⛔ AÇIK / SIRADAKİ (Rev 17)
- Daha çok premium özel tip istenirse eklenebilir (DiveHero, ContactForm+ödeme, lessons booking, zipper). Şu an 6 tip.
- Çift fotoğrafı (`founders.jpg`), domain (`NEXT_PUBLIC_SITE_URL`), WhatsApp numarası, root şifre değişikliği hâlâ kullanıcıdan bekleniyor.

## 🔁 Revizyon 16 — genel blok CMS (admin'den sayfa kur/düzenle) (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Kullanıcı: "admin'de sayfanın her detayına ulaşıp değişiklik yapabileyim, db kur." Karar: **gerçek genel blok CMS** ama **mevcut premium sayfaları kazara yok etmeden** — bir rotayı CMS ile yayınlamak **açık ve geri alınabilir** (`Page.managed`). Sen "CMS ile yayınla" demeden mevcut kodlu tasarım canlı kalır. `tsc` ✓ · `next build` ✓ (12 rota; `[slug]` eklendi).

### 🧱 Mimari
- **Şema (migration `0003_cms`):** Mevcut boş CMS tabloları kullanıldı. `Page.title`, `Page.managed` eklendi; `ContentBlock`'a `pageId` (doğrudan sayfaya bağlı blok), `props Json?` eklendi, `sectionId` opsiyonel yapıldı. Çeviri `Translation(blockId, field, locale, value)`. Migration sunucuda compose `command`'ındaki `prisma migrate deploy` ile **otomatik uygulanır**.
- **`lib/cms-blocks.ts`** — blok tip kayıt defteri (admin + renderer ortak, saf config): hero, heading, richtext, image, imageText, cta, quote, cards, faq. `cards/faq` `count` prop'una göre dinamik öğe alanları üretir.
- **`lib/cms.ts`** — `getManagedPage(slug, locale)` yalnız `managed && published` sayfayı döndürür (yoksa null → kodlu tasarıma düşer); `listPages`, `getPageForAdmin`. DB hatasında null (build güvenli).
- **`components/cms/block-renderer.tsx`** — blok tiplerini site tasarım token'larıyla (Cormorant başlık, accent buton, container-wide) render eder → "genel" ama markaya uygun.
- **Public entegrasyon:** Yeni sayfalar için dinamik `app/[locale]/[slug]/page.tsx` (statik rotalar önce gelir, sadece eşleşmeyen slug'ları yakalar). Mevcut 7 sayfanın (home dahil) başına **geri-alınabilir guard**: `const cmsPage = await getManagedPage("<slug>", locale); if (cmsPage) return <BlockRenderer .../>` — managed=false iken inert.
- **Admin `/admin/pages`** (+nav linki): sayfa listesi + bilinen rota hızlı-oluştur + yeni özel sayfa. Editör `/admin/pages/[id]`: sayfa ayarları (başlık, yayında, **CMS ile yayınla**), blok ekle/sırala(↑↓)/sil, her blok 5 dilde + props (görsel URL = medya datalist), **canlı önizleme iframe** (dil sekmeleri + yeni sekme). Server action'lar `requireAdmin` + `audit` + `revalidatePath("/", "layout")`.

### ⛔ AÇIK / SIRADAKİ (Rev 16)
- **Faz 2 fikirleri:** gerçek sürükle-bırak sıralama (şimdilik ↑↓), blok kopyalama, medya seçici modal (şimdilik URL datalist), daha çok blok tipi (galeri/video/booking gömme), sayfa SEO alanları (description/OG) CMS'ten.
- **Mevcut premium bileşenleri CMS'te tip olarak sunma** (RouteGallery, StudyJourney, zipper...) istenirse registry'ye "özel tip" olarak eklenebilir — o zaman bir rota tasarımı kaybetmeden CMS'e taşınır.
- Çift fotoğrafı (`founders.jpg`) ve domain (`NEXT_PUBLIC_SITE_URL`) hâlâ kullanıcıdan bekleniyor (Rev 15).

## 🔁 Revizyon 15 — iç sayfalara dönüşüm katmanı (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Kullanıcı isteği: ana sayfa + /antalya HARİÇ diğer 5 sayfayı (lessons, education, about, faq, contact) "insanları hayallerine ulaştır ama satın almalarını sağla" amacına göre, mevcut immersive yapıyı **bozmadan** yeniden tasarla. Karar: **dönüşüm katmanı ekle** (yapı korunur) · **sayfaya özel + tek hedefe akan CTA** · **dürüst sosyal kanıt/aciliyet** (uydurma yorum YOK). `/` ve `/antalya` dosyalarına dokunulmadı. `tsc --noEmit` ✓ · `next build` ✓.

### 🎯 Paylaşılan dönüşüm bileşenleri (DRY, yeni)
- **`components/trust-strip.tsx`** — `trust.p1-p5` gibi zaten 5 dile çevrilmiş maddeleri yatay dürüst güven rozeti şeridine çevirir (about/faq/education/contact).
- **`components/conversion-band.tsx`** — mevcut "lived" bandıyla aynı turkuaz→deniz gradyan kapanış CTA bandı. Birincil = her zaman çalışan yerelleştirilmiş iç bağlantı (lead). İkincil WhatsApp **yalnız `whatsappConfigured` ise** render edilir → ölü link yok.
- **`components/mobile-plan-cta.tsx`** — additive `href` prop'u eklendi (varsayılan `#hazir-rotalar` korunur) → her sayfa kendi hedefine sabit mobil CTA.
- **i18n:** yeni `convert` ad alanı (20 anahtar) **5 dile** eklendi (tr/en/ru/kk/uz). Gerisi mevcut çevrili anahtarlardan (`trust`, `voices`, `studyHome`, `lived`, `nav`).

### 📄 Sayfa sayfa (yalnızca eklenti)
- **lessons:** hero altı dönüşüm şeridi (dürüst kontenjan microcopy + "İlk dersini ayırt"→`#randevu`) · süreler → "planını seç" (orta kart "En çok seçilen" vurgulu, her kartta CTA→`#randevu`) + güvence satırı · `GuestVoices` dürüst panel (boş, uydurma yok) · randevu bölümü `id="randevu"` + güvence pili · mobil sabit CTA.
- **education:** **ölü Street View siyah kutusu KALDIRILDI** (`street-walk` import + bölüm) → yerine "senin için neyi hallediyoruz" 4 teslimat kartı (`studyHome.f1-4`) + dürüst aciliyet pili ("başvuru/burs dönemleri sınırlı") + `TrustStrip` · kapanış CTA güçlendi (stronger label + koşullu WhatsApp) · mobil CTA `/contact`.
- **about:** değerler bandı sonrası `TrustStrip` kanıt şeridi + **yol seçici** (Antalya/lessons/education 3 kart → ilgili rota) + `ConversionBand` kapanış. Eski tekil küçük CTA kaldırıldı.
- **faq:** akordeon sonrası `TrustStrip` (gizli ücret yok·manuel onay·tek muhatap) + `ConversionBand` ("sorun cevaplanmadı mı? 1 mesajda sor").
- **contact:** hero altı güvence şeridi (24s yanıt·ücretsiz·tek muhatap) · "En hızlısı" gradyan WhatsApp/Telegram kartı (koşullu, ölü link üretmez) · gönder altı güven mikro-satırı · ödeme/harita korundu.

### ⛔ AÇIK / SIRADAKİ (Rev 15)
- **Deploy bekliyor:** dalda commit edilip sunucuda `git reset --hard origin/claude/redesign-conversion && docker compose up -d --build`.
- **WhatsApp koşullu:** `whatsappConfigured` false olduğundan (numara `.env`'de yok) ikincil WhatsApp butonları ve contact "En hızlısı" kartındaki WA satırı **şimdilik gizli**; numara gelince otomatik görünür (NEXT_PUBLIC_* → rebuild).
- **`components/street-walk.tsx` artık hiçbir yerde kullanılmıyor** (antalya Rev14'te, education Rev15'te kaldırıldı) — dosya duruyor, zararsız; istenirse silinebilir.
- **GuestVoices** lessons + ana sayfada boş-dürüst; gerçek yorum gelince `reviews[]`'e eklenir.

## 🔁 Revizyon 14 — canlı doğrulama + kırık Street View kaldırıldı (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Bu oturum canlıda (Chrome) doğrulama + tek temiz kod düzeltmesi yaptı. Kalan işler **kullanıcının vereceği değerlere** bağlı (WhatsApp no, gerçek yorum verisi, sunucu sırları). Son commit: **`f75a57d`** (dalda, deploy bekliyor).

### ✅ Canlıda DOĞRULANDI (http://45.67.203.149:3010/tr/antalya)
- **İleri/geri ‹ › butonları ÇALIŞIYOR.** Her iki yön + başa/sona sarma canlıda test edildi (Chrome tıklama). Rev 13'ün manuel-tween düzeltmesi sağlam. Kod değişmedi.
- **Detay modalı haritası ÇALIŞIYOR.** "Klasik Antalya" açıldı → "Otelin tam konumu" gerçek Google harita (Belek golf-resort kıyısı, Cullinan Links, deniz altta) yükleniyor; otel doğru deniz-kenarı bölgede. Anahtarsız **place embed** (`output=embed`) güvenilir — kod değişmedi.

### 🔧 YAPILDI — Street View kaldırıldı (commit f75a57d)
- **EN ÖNEMLİ DERS:** Google **anahtarsız Street View gömmeyi** (`output=svembed`, `components/street-walk.tsx:25`) devre dışı bıraktı → panel canlıda **SİYAH KUTU** çıkıyor, lat/lng ne olursa olsun. Yani "koordinatlar kötü" yanlış teşhis; **gömme yöntemi ölü**, koordinat ayarı çözmez.
- `/antalya`'dan `StreetWalk` bölümü + import'u **kaldırıldı** (`app/[locale]/antalya/page.tsx`). Hemen üstündeki "Antalya'nın incileri" galerisi o yerleri zaten gösteriyor. `tsc --noEmit` ✓.
- **NOT:** Aynı `<StreetWalk>` hâlâ **`/education`**'da duruyor — orada da siyah. İstenirse kaldır/yeniden yap. Gerçek Street View için **Google Maps Embed API key** (faturalı GCP) gerekir.

### ⛔ AÇIK / SIRADAKİ (Rev 14) — kullanıcı girdisi bekliyor
- **Deploy:** Bu oturum SSH yapamadı (root şifresi bu sohbette yok — olmamalı). Kullanıcı `f75a57d`'i deploy etmeli (siyah kutu canlıda o zaman gider).
- **Task 4 — WhatsApp:** KOD HAZIR, değişiklik gerekmez. Numara gelince sunucu `.env`'e `NEXT_PUBLIC_WHATSAPP_NUMBER=905XXXXXXXXX` (ülke kodlu, + yok) + rebuild → "Bu tatili iste" tek-tık WhatsApp. **Numara bekleniyor.**
- **Task 3 — sosyal kanıt:** `GuestVoices` yalnız **ana sayfada** (`app/[locale]/page.tsx:330`, `reviews={[]}`). Wire için her yorum: **ad · ülke · bayrak emoji · yıldız(1-5) · metin**. Ayrıca KARAR: nereye? (ana sayfa paneli / `/antalya` route modalı / ikisi). Varsa gerçek "X kişi bu rotayı yaşadı" sayısı. **Gerçek veri bekleniyor — uydurma yok.**
- **Task 6 — güvenlik (hepsi sunucu tarafı, kullanıcı aksiyonu):**
  - **Root şifresi kullanıcı kendi değiştirmeli** (asistan sunucu güvenlik kimlik bilgisini değiştirmez, sohbete sır girmez). `passwd` veya SSH-key-only.
  - Sunucu `.env`'e gerçek değerler (sır sohbete girilmeden): `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY` (admin AI asistanı), `NEXT_PUBLIC_SITE_URL=https://<domain>` (canonical/OG; NEXT_PUBLIC_* → rebuild şart).

### 📌 Deploy (kullanıcı çalıştırır)
```
cd /opt/antalya-bridge && git fetch origin claude/redesign-conversion \
  && git reset --hard origin/claude/redesign-conversion \
  && docker compose up -d --build
```
İlk denemede geçici hata (OOM/ağ) verirse tekrar çalıştır.

## 🔁 Revizyon 13 — "Antalya Danışmanlık" sayfası = HAYALİ SEÇ + KİŞİSELLEŞTİR + SAT (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Kullanıcının "insanlar detaya boğulmadan hayalindeki tatili seçip alsın" vizyonu, **doğru sayfada** (Antalya Danışmanlık) sinematik bir satış deneyimine dönüştü.

### ⚠️ EN KRİTİK DERS — DOĞRU SAYFA
- Kullanıcının dediği **"Antalya danışmanlık page" = menüdeki "Antalya Danışmanlık" linki = `/[locale]/antalya` rotası** (`app/[locale]/antalya/page.tsx`). **ANA SAYFA (`/`) DEĞİL.**
- 6 tur boyunca yanlışlıkla **ana sayfa** düzenlendi; kullanıcı menüden /antalya'ya gidip "değişiklik göremiyorum / sen hangi sayfayı yaptın?" dedi. Header menüsü: Ana Sayfa→/ · **Antalya Danışmanlık→/antalya** · Türkçe Ders→/lessons · Türkiye'de Eğitim→/education · Hakkımızda · SSS · İletişim.
- Bir sonraki chat: "Antalya/paket/danışmanlık" işi = önce **`/antalya`** ve **`components/ready-routes.tsx` + `components/route-gallery.tsx`**.

### 🎬 HAZIR ROTALAR — paylaşılan bileşen (ana sayfa + /antalya, tek kaynak)
- **`components/ready-routes.tsx` (server):** `routes` + `hotelsd` çevirilerini okur, 5 rotayı (veri + adımlar + otel why/note + Google harita sorgusu) hazırlar, intro'yu (eyebrow/başlık/promise + "endişeler üstü çizili → Hepsi çözüldü" çipleri) container içinde, **`<RouteGallery>`'yi container DIŞINDA tam ekran** render eder. Rota→otel eşlemesi: `hkeyOf = {r1:larabarut, r2:cullinan, r3:ngphaselis, r4:legends, r5:maxxkemer}`.
- **`components/route-gallery.tsx` (client "use client"):** tüm etkileşim burada.
  - **Tam ekran (kenara kadar) SONSUZ otomatik marquee** — JS rAF ile sola `scrollLeft += 0.5`, yarıya gelince `-= half` (kartlar `[...routes, ...routes]` 2× çoğaltılı → kusursuz döngü). Kenarlarda sinematik fade. Üstüne gelince / dokununca / **modal açıkken** durur (`pausedRef`, `activeRef`).
  - **İleri/geri ‹ › butonları** — native `scrollBy({behavior:'smooth'})` rAF'ın per-frame yazımıyla **çakışıp iptal oluyordu** (hata buydu); yerine **kendi eased rAF tween'imiz** (doğrudan `scrollLeft`) + tween boyunca otomatik kayma duraklı (`resumeTimer`). Geri başta → `scrollLeft += half` ile sona sarar.
  - **Poster kartlar** (aspect 5/7, gerçek otel görseli): kitle rozeti · gün · yıldız · ad (büyük Cormorant + text-shadow) · otel pini · **"Kişiye özel fiyat"** altın rozet · "BU PAKETTE HER ŞEY DAHİL" 6 ikon · "Detayları gör". Premium katmanlı gölge + hover'da altın hat/turkuaz glow (`.route-card` globals.css).
  - **Tıkla/dokun → detay modalı** (hover ile AÇILMIYOR — denendi, kaldırıldı). Modal `createPortal(document.body)` ile render edilir — çünkü sayfa-geçiş sarmalayıcısı `.animate-fade-up` **transform** taşıyor ve `position:fixed`'i bozuyordu (panel ekran dışında ~15000px açılıyordu).
  - **Modal = OTEL SATIŞ sayfası:** büyük görsel başlık → **"Neden bu otel"** (`hotelsd._why`) + dürüst not → **"Otelin tam konumu"** GERÇEK Google harita embed (`https://www.google.com/maps?q=<otel adı + loc>&output=embed`, anahtarsız, isimle birebir resort/deniz kenarı; CSP `frame-src`'de www.google.com zaten açık) → "her şey dahil" tam liste → **GÜN GÜN PLAN: durak ÇIKAR/EKLE** (uçuş/transfer/giriş = ilk 3 adım sabit/çıkarılamaz; gerisi onay kutusuyla çıkarılır/geri eklenir) → **"Eklemek ister misin?"** çipleri (tekne/spa/rehber/VIP/ekstra gece/özel akşam yemeği) → serbest not → **"Bu tatili iste"**.
  - **Modal scroll düzeltmesi:** `data-lenis-prevent` (dialog + panel) + `overscroll-contain` + body `overflow:hidden`. Önceki hata: Lenis smooth-scroll modal'ı dinlemiyor, arka sayfa kayıyordu.
  - **"Bu tatili iste" akışı:** WhatsApp tanımlıysa → `wa.me` önceden-doldurulmuş mesaj; **tanımlı değilse** (ŞU AN BÖYLE) → özet `sessionStorage("pkgRequest")`'e yazılır → `/contact`'a gider; **`components/contact-form.tsx`** mount'ta bunu okuyup **mesaj alanını + hizmet=antalya'yı önceden doldurur** → `/api/contact` ile **LEAD** olarak yakalanır. (Mesaj: intro + ad/gün/otel + istenen program + çıkarılanlar + eklenenler + not.)

### 🏠 Ana sayfa (`app/[locale]/page.tsx`) — omurga da değişti
- Hero yeniden yazıldı: **"Hayalindeki Antalya tatili. Zaten hazır."** + "uçak/transfer/otel/deniz/gezi düşünüldü, sen seç". DiveHero CTA'ları artık **#hazir-rotalar** (birincil) + **#hizli-plan** (özel).
- Sıra: Hero → **`<ReadyRoutes/>`** → Oteller → (aşağı alınan) **Hızlı Plan formu** ("Hazırlardan biri tam uymadı mı? sıfırdan kuralım") → Fermuar → … Mobil sabit CTA → #hazir-rotalar.

### 🌐 i18n / ikon / CSS
- **`routes` ad alanı ~125 anahtar** (5 dil): promise, worry1-4/worryLead/worryResolved, allInLabel, inc_flight/transfer/hotel/board/tours/support, ctaPick, waMsg, curated, routeLabel, oneMessage, details, close, dayByDay, custTitle/custHint, addonsTitle/addNotePh, a_boat/spa/guide/vip/night/dinner, mIntro2/mKept/mRemoved/mAddons/mNote, priceLabel, whyHotel, mapTitle. Ayrıca `home.hero*`, `plan.eyebrow/title/subtitle`, `antalya.title/intro` "dream" diline çevrildi (uz dahil 5 dil, ama uz pasif).
- **`components/route-icons.tsx`:** `utensils` + `headset` ikonları eklendi.
- **`app/globals.css`:** `.no-scrollbar`, modal `pkg-overlay`/`pkg-panel` animasyon, premium `.route-card` gölge/hover glow, (kullanılmayan) `.pkg-marquee` keyframe.
- `tsc --noEmit` ✓ · `next build` ✓ (11/11).

### ⛔ AÇIK / SIRADAKİ (Rev 13)
- **WhatsApp/Telegram sunucuda BOŞ:** `.env` içinde `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_TELEGRAM`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID` **hepsi boş**. Bu yüzden "Bu tatili iste" şimdilik forma düşüyor (lead olarak yakalanıyor). **Gerçek WhatsApp numarası gelince** `NEXT_PUBLIC_WHATSAPP_NUMBER=905XXXXXXXXX` (ülke kodlu, + yok) eklenip rebuild → tek-tık önceden-doldurulmuş WhatsApp aktifleşir. NEXT_PUBLIC_* build'e gömülür → rebuild şart.
- **İleri/geri butonu:** düzeltme deploy edildi (manuel tween) ama otomatik test ortamı sayfa-geçişte **2 kopya RouteGallery** ürettiği için tık-testi temiz doğrulanamadı; canlı (tek kopya) doğrulanmalı. Çalışmazsa not edilsin.
- **Sosyal kanıt:** gerçek misafir yorumları / "X kişi yaşadı" / fiyat aralığı — kullanıcı istedi, **gerçek veri** lazım (uydurma yok). `guest-voices` paneli zaten boş-dürüst bekliyor.
- **/antalya alt kısmı:** `StreetWalk` (Street View sokak turu) hâlâ duruyor; kullanıcı "map konumları kötü" demişti — detay modalına birebir otel haritası eklendi ama StreetWalk koordinatları elden geçmedi (istenirse).
- Harita modal **açılınca** (client) yüklenir; iframe src + CSP yerelde doğrulandı.

### 📌 Deploy (bu oturumda SSH ile yapıldı)
`sshpass -p '<root-şifresi>' ssh root@45.67.203.149` → `cd /opt/antalya-bridge && git fetch origin claude/redesign-conversion && git reset --hard origin/claude/redesign-conversion && docker compose up -d --build`. **Not:** `docker compose up --build` bazen ilk denemede geçici hata (OOM/ağ) veriyor → tekrar çalıştır, geçiyor. Bu oturum commit'leri (redesign-conversion): `2408aae → 4862318 → dda9dca → c0994aa → 5a65b98 → d27e30c → 4b9b764 → 90df52d → ceac545 → 7411ea0`. **Sunucu root şifresi sohbette açık geçti → DEĞİŞTİRİLMELİ.**

## 🔁 Revizyon 12 — premium rota kartları + admin paneli genişletmesi (dal `claude/redesign-conversion`)

- **ROTA KARTLARI premium yükseltme** (`app/globals.css` `.route-card`/`.route-img` + `app/[locale]/page.tsx`): daha büyük görsel (16:10 → **3:2**), kart aralığı arttı, **kartın üstüne gelince otel fotoğrafı büyür** (scale 1.12, kartın kendisinde hover), **turkuaz/mercan ışıltılı gölge** + daha derin lift (translateY −12px). reduced-motion korumalı. Renk/yazı zaten uyumlu (Cormorant başlık + accent gradient rozetler).
- **ADMIN PANELİ genişletildi** (`app/admin/**`, sadece admin — public dokunulmadı):
  - **Kullanıcılar** (`/admin/users`): admin/editör ekle-sil, rol değiştir; parola `lib/auth.hashPassword` (bcrypt) ile; **kendini silme + son admini silme/düşürme koruması**; e-posta/parola doğrulama; AuditLog'a yazar. Parola hash'i asla seçilmez/gösterilmez.
  - **Denetim Kaydı** (`/admin/audit`): son ~100 AuditLog (zaman · actor · action · entity · detay), salt-okunur.
  - **Dashboard**: "Hızlı erişim" kısayolları + nav'a **Kullanıcılar** ve **Denetim** linkleri. Her sayfa/aksiyon `requireAdmin()`.
- **Mevcut admin yetenekleri (hatırlatma):** Tüm site metinleri — **rotalar (`r*`), oteller (`hotelsd.*`), voices, hero, SSS dahil** — `/admin/content` üzerinden **5 dilde** düzenlenebilir (`SiteText` override + `lib/messages.ts` merge). Medya yükleme, talepler, rezervasyon (ders tipi+slot), sohbetler, indirim kodları, ödeme yöntemleri, faturalar yönetilebilir. **AI asistan** (`/admin/ai`): doğal dille DB sorgusu + onaylı INSERT/UPDATE (silme yok) — `OPENROUTER_API_KEY` gerekir.
- **⏭️ Sıradaki (tam dinamik sıralama):** rota/otel/voices **listelerinin sırası ve ekle/çıkar** hâlâ kodda (`page.tsx` dizileri). Drag-drop sıralama + admin'den kart ekleme için bunları DB'ye taşımak gerekir (yeni `Route`/`Hotel` modelleri + CRUD UI + `order` alanı + 5 dil içerik). Büyük, ayrı bir faz — canlıyı riske atmamak için metin düzenleme şimdilik `/admin/content`'ten yapılıyor.

`tsc --noEmit` ✓ · `next build` ✓ (13/13 — admin/users + admin/audit eklendi).

## 🔁 Revizyon 11 — iç sayfa rötuşları + eğitim hero düzeltmesi (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Kullanıcı geri bildirimiyle iç sayfa düzeltmeleri yapıldı.

- **EĞİTİM HERO DÜZELTİLDİ** (`app/[locale]/education/page.tsx`): Boat-flag videosu **PORTRAIT (9:16)** olduğu için full-bleed landscape hero'da dikey şeride kırpılıyordu (direk + martılar, dağınık) → **temiz LANDSCAPE Türk bayrağı fotosu** ile değiştirildi (`turkish-flag-sky.jpg`, Wikimedia CC, 1920×1272, gökyüzünde dalgalanan bayrak; başlık için bol temiz alan). Statik + CinematicHero scroll-zoom = sakin/premium. Mezuniyet madalyonu (`emblem`) korundu. (Komite/kurul fotosu zaten Rev 10'da kaldırılmıştı.)
- **ANTALYA CTA arka planı** (`antalya/page.tsx`): gece marina (`harbor-night.jpg`) → **Kaputaş/Kaş turkuaz denizi** (`kaputas.jpg`), overlay hafifletildi.
- **TÜRKÇE DERS — ZOOM ONLY:** tüm "Antalya'da yüz yüze" iddiaları kaldırıldı; dersler artık yalnız **Zoom üzerinden online** (5 dil: `imm.les_p2Text` · `lessonsHome.c3` · `lessons.intro` · `services.lessonsDesc` · `faq.a3`).
- **Ders süreç kartları** eşit yükseklik (`h-full` flex). **PetLingo kartı (03)**: "🎁 Ücretsiz bonus" pulse rozeti + **"PetLingo'yu dene →"** CTA → `#petlingo` (PetLingoShowcase'e `id` + `scroll-mt-20` eklendi); turkuaz glow ile öne çıkarıldı.
- **CinematicHero**: yeni opsiyonel **`emblem`** prop'u (cam içinde mezuniyet kepi madalyonu, sağ üst).
- **Ana sayfa eklemeleri (Rev 10 sonrası):** **Misafir sözleri paneli** (`guest-voices.tsx`) — DÜRÜST: uydurma yorum yok; boşken "yalnızca gerçek misafirler" daveti + bayraklar; gerçek yorum gelince `reviews[]` dizisine eklenir. **Mini-SSS** (mevcut faq q1-a4). **Mobil sabit "Tatil planı iste" pili** (`mobile-plan-cta.tsx`, sol alt). `voices` ad alanı 5 dilde.
- **Özbekçe (uz) PASİF:** `i18n/routing.ts` locales = `["tr","en","ru","kk"]`; `uz.json` + çeviriler duruyor (tek satırla geri açılır). `/uz` artık servis edilmiyor.
- **Türk bayraklı tekne videosu** (`turkish-flag-boat.mp4`, portrait) hâlâ ana sayfa "Türkiye'de eğitim" bölümünün **4:3 figüründe** kullanılıyor (orada kabul edilebilir kırpılıyor); eğitim HERO'da artık landscape foto var.

`tsc --noEmit` ✓ · `next build` ✓ (11/11) · 4 aktif dil.

## 🔁 Revizyon 10 — DÖNÜŞÜM ODAKLI YENİDEN YAPI (dal `claude/redesign-conversion`)

> **Şu an buradayız.** Ana ürün net: **kişiye özel Antalya tatil planlama**. Türkçe ders + Türkiye'de eğitim ikincil; IT ana sayfadan kaldırıldı. Tüm değişiklikler 5 dilde.

**Yeni ana sayfa akışı (`app/[locale]/page.tsx`):**
1. **Hero** — seyahat odaklı: "Antalya tatilini sana özel planlayan yerel rehberin" + 4 güven rozeti (Antalya'da yaşıyoruz · 5 dil · otel+transfer+aktivite · baştan sona tek muhatap).
2. **Hızlı Plan formu** (`components/quick-plan-form.tsx`) — tarih/kişi/gün/bütçe/tarz + **WhatsApp no/Telegram kullanıcı adı** + **"bilmemiz gereken bir şey?"** notu → girdilerden özet kurup **WhatsApp/Telegram'a deep-link** (backend yok, manuel/kişisel konum).
3. **Hazır Rotalar** — **5 adım-adım ikonlu rota** (`components/route-icons.tsx` = RouteIcon): ✈ uçuş → 🚐 transfer → 🏨 otel → gün gün duraklar, "N. Gün" etiketli. **3/5/7 gün × klasik/balayı/aile/lüks** kitle rozetli. İçerik **web araştırmasıyla** kuruldu (Aspendos/Side/Perge/Düden/Phaselis/Tahtalı/Çıralı/Kekova/Köprülü/Land of Legends/Antalya Akvaryumu). `routes` ad alanı **85 anahtar**, 5 dil. Kart üstünde 3D konum pini + otel adı.
   - Rotalar→oteller: Kısa Kaçamak (3g · Lara Barut) · Klasik Antalya (5g · Cullinan Belek) · **Balayı Kıyısı (5g · NG Phaselis Bay)** · Aile Macerası (7g · Land of Legends) · Lüks & Adrenalin (7g · Maxx Royal Kemer).
4. **Oteller** (`components/hotel-cards.tsx`) — **8 gerçek otel** premium kart grid'i; görseller **kullanıcının resmi fotoğrafları** (`public/images/hotels/*.jpg`, 1600px). Her kartta **3D konum pini** (sağ üst), **Kimler için / Neden öneriyoruz / ⓘ Dürüst not** + "Bu otel için teklif iste" (butonlar `mt-auto` ile hizalı). `hotelsd` ad alanı. **NG Phaselis Bay = Göynük, Kemer** (Tekirova değil — resmi adresle düzeltildi). Eski `hotel-accordion.tsx` duruyor (kullanılmıyor).
5. **Fermuar deneyimi** — iki modlu (aşağıda PERF).
6. **Neden Antalya Bridge** (koyu deniz bandı, 3 neden).
7. **Türkçe ders + PetLingo** — sağ kolonda **CANLI uygulama** (telefon mockup + `PetLingoLive`, gerçek Lottie mini-oyun), "🎁 Ücretsiz bonus" rozeti. Ders bonusu olarak konumlandırıldı.
8. **Türkiye'de eğitim** (ikincil) — görsel yerine **Türk bayraklı tekne videosu** (`turkish-flag-boat.mp4`, AutoVideo, yalnız görünürken oynar; Pexels #30383116, 148MB→**9.6MB** ffmpeg ile sıkıştırıldı, poster `turkish-flag.jpg`).
9. **Ödeme & Güven** — Kaspi + kripto + **5 güven maddesi** (net anlaşma · manuel onay · gizli ücret yok · WA/TG · ilk mesajdan plana kadar tek muhatap). Sakin dil, kripto öne çıkmıyor.
10. **Son CTA** — "Antalya planını birlikte kuralım" → #hizli-plan + /contact.

**SEO/metadata (`app/[locale]/layout.tsx`):** dönüşüm odaklı başlık/açıklama (TR: "Antalya Tatilini Yerel Uzmanlarla Sana Özel Planla" / EN: "Personalized Antalya Travel Planning with Local Experts") 5 dil · **og:image + twitter:image** `/og/antalya-bridge.jpg` (1200×630, üretildi) · `summary_large_image` · canonical + **hreflang (5 dil + x-default)** + locale `og:locale` · **TravelAgency** JSON-LD (knowsLanguage + offers).

**İletişim güvenliği (`lib/config.ts`):** `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_TELEGRAM_USERNAME` (eski adlara fallback). Numara/kullanıcı adı yoksa veya placeholder ise WA/TG butonları **ölü link yerine `/contact`'a** düşer (footer + floating-contact).

**⚡ PERFORMANS — fermuar iki modlu (`components/zipper-reveal.tsx`):**
- **Mobil / dokunmatik / reduced-motion →** native **scroll-snap galeri** (poster görseller, video YOK, rAF YOK, clip-path YOK) → tarayıcının kendi 60fps'i. Eski sorun: her karede `clip-path: path()` + sürekli rAF salınımı + 9 eşzamanlı `<video>` decode mobilde kasıyordu.
- **Masaüstü (≥1024 + pointer:fine) →** imza fermuar korunur ama **sürekli rAF yerine yalnız scroll'da tek kare** hesap (boştayken sıfır repaint); idle `sin()` salınımı kaldırıldı; "canlılık" sürgü kulpunda küçük CSS transform (`.zip-pull`); `will-change` yalnız cover+content; kart videoları `preload=none` + yalnız aktif oynar.
- **Temizlik:** kullanılmayan **29 medya dosyası silindi** (eski `act-*`/`lol-*`/`edu-*` videolar, eski otel/ders görselleri) → `public` **203MB→143MB**.

**i18n yeni ad alanları (5 dil):** `plan` · `trust` · `lessonsHome` · `studyHome` · `hotelsd` · yenilenen `routes` (85). `tsc --noEmit` ✓, `next build` ✓ (11/11).

### ⛔ AÇIK / YAPILACAK (Rev 10)
- **Production env:** `NEXT_PUBLIC_SITE_URL` gerçek domaine ayarlanmalı (şu an canonical/og IP gösteriyor). `NEXT_PUBLIC_WHATSAPP_NUMBER` + `NEXT_PUBLIC_TELEGRAM_USERNAME` gerçek değerlerle doldurulmalı (yoksa butonlar /contact'a düşüyor).
- **AI chat anahtarı hâlâ boş** (Rev 9'dan devam) — `.env` `ANTHROPIC_API_KEY`/`OPENROUTER_API_KEY`.
- **Güvenlik:** sunucu root şifresi sohbette açık geçti → **değiştirilmeli**.
- **Tipografi:** Cormorant Garamond (başlık) + Onest (gövde) **korundu** — Kiril (RU/KK) gerekliliği premium serif seçimini kısıtlıyor; mevcut pairing uygun ve premium. Opsiyonel alternatif: Playfair Display (Kiril destekli) — istenirse.
- Daha fazla otel fotoğrafı gelince `public/images/hotels/<ad>.jpg` (1600px) + `hotelsd`/route eşleşmesi eklenir.

## 🔁 Revizyon 9 — gerçek fermuar, hazır rotalar, IT alanı, öğretmen kimliği, ödeme

> **Şu an buradayız.** Son commit dalda; deploy için sunucuda `git reset --hard origin/...` (aşağıdaki nota bak).

- **FERMUAR (ana sayfa "deneyim" bölümü) — `components/zipper-reveal.tsx`:** birçok tur döndü, son hâli **Coca-Cola "real magic" tarzı ÇAPRAZ fermuar**:
  - Çapraz/kıvrımlı dikiş ekranı ikiye böler; **gerçek metal dişler = kalın `stroke-dasharray` stroke** (iki sıra kenetli), metalik **sürgü + sallanan kulp**.
  - **Turkuaz deniz örtüsü** (`kaputas-drone.mp4`) `clip-path` ile çapraz açılıp altındaki içeriği (scuba + Kaputaş/Kaş/Suluada/Olympos/Kemer/Alanya/Kleopatra/Land of Legends) gösterir.
  - smootherstep **ease** (yağ gibi), hafif **salınım** (sürekli rAF, yalnız görünürken), içerik **sana doğru zoom**, sonunda **tam açılır**.
  - ⏳ **Kullanıcı telefonda görsel ince ayar bekliyor** (diş boyutu/metaliklik, dikiş açısı, kıvrım, örtü klibi, sürgü boyutu). Eski denemeler: dikey "V" fermuar, sticky-stack reel (kasıyordu — kaldırıldı).
- **HAZIR ROTALAR** (`app/[locale]/page.tsx`): 4 sinematik rota kartı — **Klasik Antalya (5g/5★) · Lüks & Adrenalin (7g/5★) · Romantik Kaş (4g) · Aile Tatili (6g/5★)**. Gün gün dikey zaman çizgisi, yıldız, **"uçak + otel + transfer dahil"**, güçlü CTA. 5 dilde (`routes` ad alanı).
- **IT / YAZILIM — ÖZEL bölüm** (teknolojik koyu tema): danışmanlık + **uygulanabilirlik analizi** + web/mobil + AI entegrasyonu + ürün iyileştirme. "Hizmetimizde sınır yok." 5 dilde (`services.it_*`). (Hizmet kartı da duruyor.)
- **ÖĞRETMEN KİMLİĞİ** (lessons): **anadili Kazakça & Rusça · C2 Türkçe & İngilizce · 10+ yıl Türkiye'de · Antalya'yı/otelleri içeriden bilir** (`imm.les_teacher_*`, `les_cred1-4`).
- **PetLingo:** "⚡ Bizim kendi uygulamamız" + "✦ Yapay zekâ destekli" rozetleri + telefon arkası parıltı/AI ikon. Canlı Lottie mini-oyun zaten oynanıyor.
- **ÖDEME şeridi (ana sayfa):** **Kazakistan → Kaspi** + **Kripto (USDT/BTC)** (mevcut `payment` ad alanı).
- **Oteller:** akordeonda aktif panelde **5★ "Lüks resort"** rozeti.
- **Mobil menü bug DÜZELTİLDİ:** overlay `<header>` içindeydi → `backdrop-filter` onu 64px header kutusuna hapsediyordu (arka sayfa sızıyordu). **Header DIŞINA** alındı, opak zemin, `z-[70]`.
- **AI butonu:** kafa karıştıran toggle kaldırıldı; WhatsApp+Telegram hep görünür; AI butonu **yeni ikon + isim** ("Asistana Sor / Ask our AI / …").

### ⛔ AÇIK / BLOKLAYAN
- **AI chat cevap vermiyor — anahtar yok:** sunucu `.env`'de **`ANTHROPIC_API_KEY=""` ve `OPENROUTER_API_KEY=""` ikisi de BOŞ**. Kod iki sağlayıcıyı da destekliyor (`app/api/chat/route.ts`, model env `CHAT_MODEL`); anahtar eklenince anında çalışır. Yokken widget kibarca WhatsApp/Telegram'a düşüyor (bozuk değil).
- **Fermuar görsel ince ayarı** (yukarıda) — kullanıcının "şu şöyle olsun" geri bildirimi bekleniyor.
- **Otel "wow" konsepti** — kullanıcı daha çarpıcı/farklı bir yapı istiyor (şu an akordeon + 5★).
- **Tipografi/renk/font yönü** — kullanıcı "çok daha iyi" istiyor; 3 yön önerildi (editoryal-lüks / modern-net / sıcak-güven), seçim bekleniyor.
- **Land of Legends aqua medyası** — daha iyi klip istendi; şu an resmi coaster loop'u kullanılıyor (medya ajanı API hatasıyla düşmüştü).
- **Akdeniz Üni uzaktan kampüs** — Commons'ta yok; `akdeniz-campus-wide.jpg` slotu açık.

### 🚀 Deploy notu (ÖNEMLİ)
Sunucuda `git pull` bazen ilerlemiyor (untracked `build.log` / `docker-compose.override.yml`). **Garantili deploy (GÜNCEL dal):**
```
cd /opt/antalya-bridge
git fetch origin claude/redesign-conversion
git reset --hard origin/claude/redesign-conversion
docker compose up -d --build
```
**Geri dönüş:** yukarıdaki iki `redesign-conversion` satırını `consulting-site-plan-6k4lix` ile değiştir → eski sürüm geri gelir.

## 🔁 Revizyon 8 — AI asistan, LoL kaldırıldı, IT hizmeti, dalga buton, mobil menü
- **AI sohbet asistanı her sayfada:** yüzen widget (AI Asistan + WhatsApp + Telegram). `/api/chat` (OpenRouter, public + rate-limit) müşterinin dilinde konuşur, hedef/tarih/bütçe sorar, ona özel taslak plan sunar, WhatsApp'a yönlendirir. `components/floating-contact.tsx` (5 dil UI). Fiyat vermez, uydurmaz.
- **Land of Legends bölümü kaldırıldı** + **Aktiviteler kaldırıldı**; ikisi tek performanslı "Antalya'nın incileri" reel'inde toplandı (8→6 panel, üst üste binme azaldı). Aqua park reel'e "seni buraya da götürürüz" notuyla eklendi.
- **IT / Yazılım danışmanlığı hizmeti** eklendi (4. kart, 5 dil): "hizmetimizde sınır yok". AI asistan da bunu sunar.
- **Ses butonu** → ekolayzer değil, **gerçek akan sine dalga çizgisi**.
- **Mobil menü** → premium **tam-ekran overlay** (büyük tipografi, kademeli giriş, CTA, scroll-lock).
- **Perf:** ağır 2 sticky-video bölümü tek reel'e indi; AutoVideo (yalnız görünürken oynar) tüm dekoratif videolarda.
- **Akdeniz:** gerçek Akdeniz Üni binası (Mimarlık Fak.) poster olarak kullanılıyor; bulunan "akdeniz-real.jpg" stadyum olduğu için tercih edilmedi.

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
