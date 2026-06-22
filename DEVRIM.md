# DEVRİM — Antalya Bridge immersive ana sayfa (durum)

> Canlı: **http://45.67.203.149:3010** (mutlaka `http://`) · dal `claude/consulting-site-plan-6k4lix`
> Görsel/medya kaynakları: `public/images/CREDITS.txt` (tümü CC / Mixkit / CC0).

## ✅ Yapıldı (canlıda)

### Teknik temel
- **Lenis** momentum smooth scroll (yağ gibi akış) + **GSAP** entegrasyonu.
- Tüm scroll-sürücülü sahneler **kendi rAF + scroll-event** mekanizmasıyla (sağlam, Lenis uyumlu; Next/Image stil-silme sorunu wrapper ile çözüldü).
- Tipografi: Cormorant Garamond (serif) + Onest (gövde), 5 dil (TR/EN/RU/KK/UZ), latin-ext + Kiril.
- Renk/UI: canlı turkuaz + mercan gradient palet, gradient + ışık-parıltılı premium butonlar, film grain.

### Ana sayfa immersive akış (yukarıdan aşağı)
1. **Kaputaş "denize dalış" hero** — üstten 4K drone Kaputaş (turkuaz) → scroll'la suya zoom → yüzey kırılma flaşı → **gerçek sualtı VİDEO (balıklı resif)** → derinleşme + sualtı mesajı. **Dalga sesi** (ilk tıklamada otomatik) + toggle.
2. **Aktivite inişi** — 🤿 Scuba (video) → ⛵ Tekne (foto) → 🌊 Su sporları/jet-ski (video) → 🏨 Oteller (foto); scroll'la crossfade + zoom, yalnız görünür sahnenin videosu oynar.
3. **The Land of Legends** — scuba'dan sonra "bambaşka": masal kalesi (CC0), sıcak/magenta sahne.
4. **Oteller** — telifsiz (CC) gerçek lüks oteller: Maxx Royal, Rixos Premium, Kremlin Palace, Miracle Resort.
5. **Antalya'nın incileri** — **sağa-sola yatay** scroll gezi (Kaputaş, Ölüdeniz, Kaş, Olympos, Phaselis, Side, Konyaaltı, Kaleiçi, Düden, Yat Limanı).
6. **Hizmetler** — premium **editoryal** düzen (büyük foto + serif başlık, alternatif yön) — eski kart grid yerine.
7. **Türkçe alfabe** — 29 harf ekran kenarlarından ortaya kademeli uçar.
8. **Neden biz** (koyu deniz bandı) + **CTA**.

## 🔑 Kararlar / açık konular
- **Oteller (NG Phaselis / Maxx Royal vb.):** Resmi foto/videolar telifli. Şu an **telifsiz (CC) gerçek otel** görselleri kullanıldı (Maxx Royal, Rixos, Kremlin Palace, Miracle). Daha iyisi için: otellerin **resmi görsellerini** ver → premium yerleştiririm.
- **Gerçek "denizin altı" + Street View ile yürünebilir sokaklar:** Street View, Google harita **iframe** gerektirir → CSP `frame-src`'i açıp gerçek "içinde yürüme" yapılabilir. (Onay bekliyor.)

## ⏭️ Sıradaki büyük parçalar
- [ ] **Tüm iç sayfaların** (Antalya / Türkçe / Eğitim / Hakkımızda / SSS / İletişim) bu immersive dile göre yeniden tasarımı.
- [ ] **Türkiye'de okuma immersive** — üniversite + yurt + Lara/Konyaaltı "içine girer gibi" sahneler.
- [ ] **Street View** ile yürünebilir Kaş/Kemer/Alanya/Olympos/Patara sokakları (CSP iframe onayı sonrası).
- [ ] Otel bölümü resmi görsellerle yükseltme (otel materyali gelince).
- [ ] Performans ince ayarı (çok video → zayıf cihazlarda; lazy + tek-aktif-video uygulandı, gerekirse daha agresif).

## Notlar
- Deploy: sunucuda `cd /opt/antalya-bridge && git pull && docker compose up -d --build`.
- Ekran görüntüsü kısıtı: oynayan videolar nedeniyle otomatik tarayıcı yakalama aracı donuyor — doğrulama fonksiyonel (DOM/scroll ölçümü) yapılıyor; görsel kontrolü kullanıcı canlıda yapar.
