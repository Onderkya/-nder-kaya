# Admin Yeniden Tasarım — Faz 3: Site Editörü — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** `/admin/content` → gerçek Site Editörü: her public sayfa için bölüm kartları sitedeki GERÇEK sırayla; kart başlığında sürükle-tutamacı + aç/kapat switch + Yayında/Gizli rozeti; kart açılınca o bölümün METİNLERİ + GÖRSEL/VİDEO slotları birlikte; hero/CTA kilitli kart; SSS sekmesinde faq-manager; sürükle-bırak sıralama.

**Architecture:** Üç veri kaynağı (content-map metin grupları · section-registry bölümleri · asset-slots görselleri) yeni `lib/editor-map.ts` ile sayfa bazında birleştirilir. content-editor.tsx yeniden kurulur ama DIŞ SÖZLEŞMELER birebir korunur: tek `<form action={saveTexts}>`, input adları `key|||locale`, dil davranışı (`key={locale}` remount, 🇹🇷 referans), sayfa sekmeleri, üstte sabit Kaydet. Görsel değiştirme mevcut asset-manager mantığını (setAsset/kütüphane/URL/sıfırla) bölüm kartının içine taşır. Sıralama: kart tutamacından HTML5 drag (block-reorder.tsx kalıbı) → `saveSectionOrder(page, ids)`; ayrıca ↑↓ fallback (`moveSection`).

## Global Constraints

- `saveTexts` action'ı ve `key|||locale` alan adları DEĞİŞMEZ; tüm metin alanları tek formda kalır ve Kaydet hepsini gönderir.
- `setAsset`/asset davranışı değişmez (slot adları asset-slots'tan birebir).
- `saveSectionOrder`/`moveSection`/`setSectionVisible` imzaları değişmez (Faz 2).
- Hero/kapanış CTA kartları kilitli: tutamaç yok, switch yok, "sabit" etiketi; registry dışı oldukları için zaten sıralanamazlar.
- Public tarafta HİÇBİR dosya değişmez bu fazda.
- Görev başına `npx tsc --noEmit` + `npm run build` → Türkçe commit + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: `lib/editor-map.ts` — üç kaynağın birleştirilmesi

**Files:** Create `lib/editor-map.ts`

**Interfaces (Produces):**
```ts
export type EditorSection = {
  key: string;                 // benzersiz kart anahtarı (registryId veya "fixed:<ad>" / "other")
  registryId?: string;         // varsa sıralanabilir/gizlenebilir
  title: string;               // Türkçe kart başlığı
  locked?: boolean;            // hero/CTA
  contentKeys: string[];       // content-map'ten bu bölüme ait metin anahtarları (görünüm sırasıyla)
  assetSlots: string[];        // asset-slots'tan bu bölüme ait slot adları
};
export function editorSectionsForPage(page: string): EditorSection[];
export const EDITOR_PAGES: { key: string; label: string }[]; // content-map sayfalarıyla uyumlu (SSS dahil)
```
- Kaynaklar: `lib/content-map.ts` (sayfa×bölüm→anahtar grupları — OKU ve gerçek yapısına göre uyarla), `lib/section-registry.ts`, `lib/asset-slots.ts` (OKU; slotların sayfa/bölüm bilgisi neyse ona göre eşle).
- Eşleme kuralı: registry bölümü ↔ content-map grubu başlık/anahtar-öneki benzerliğiyle ELLE eşlenir (statik tablo yaz — tahmin algoritması değil, açık tablo). Eşlenmeyen content-map grupları sayfa sonunda `other` kartlarına; eşlenmeyen asset slotları en yakın karta ya da `other`'a.
- Hero/CTA content-map grupları `locked:true` kart olur (metinleri DÜZENLENEBİLİR kalır — yalnız sıra/gizle yok).
- Saf/senkron modül (DB yok) → hızlı `node` doğrulaması: 7 sayfa için kart sayıları + her registry id'nin tam bir kartta olduğu + hiçbir content anahtarının kaybolmadığı (content-map'teki sayfa anahtar kümesi == kartlardaki anahtarların birleşimi).

- [ ] Yaz + node doğrulama + tsc/build → commit `feat(admin): editör haritası — metin/bölüm/görsel tek modelde`

### Task 2: Site Editörü yeniden kurulumu (kartlı arayüz, ↑↓ ile)

**Files:** Modify `components/admin/content-editor.tsx` (yeniden kurulur), Create `components/admin/editor-section-card.tsx`, Modify `app/admin/content/page.tsx` (veri hazırlama: editor-map + orders + hidden + assets + media), gerekiyorsa Modify `components/admin/asset-manager.tsx` (bölüm-bazlı alt bileşen ihraç etmek İÇİN — mevcut export'lar kırılmadan).

**Davranış sözleşmesi:**
- Üst araç çubuğu: sayfa sekmeleri (EDITOR_PAGES) + dil seçici + Kaydet — mevcut davranış birebir (sekme değişince düzenleme kaybolmaz = tüm sayfaların alanları DOM'da kalır, görünmeyenler `hidden` — bugünkü mantık neyse KORU; oku ve raporla).
- Seçili sayfanın kartları: `editorSectionsForPage(page)` + Faz 2 sırası (`applySectionOrder` registry id'li kartlara uygulanır; locked kartlar sabit konumda: ilk locked'lar başta, son locked'lar sonda, `other` en sonda).
- Kart başlığı: (kilitliyse kilit ikonu, değilse ↑↓ butonları) + başlık + (registryId varsa) `.adm-switch` + Yayında/Gizli rozeti + aç/kapa şovron (native `<details>` veya state).
- Kart gövdesi: contentKeys alanları (mevcut alan render mantığı — etiket, 🇹🇷 referans, `key|||locale` adı) + assetSlots önizleme/Değiştir/Sıfırla (mevcut asset-manager parçaları yeniden kullanılır) + "Sitede gör →" (sayfa route'una link).
- SSS sekmesi: faq-manager paneli (mevcut `faqPanel` prop kalıbı) + SSS sayfasının kartları; Turlar yönlendirme kartı (`/admin/tours`).
- `components/admin/section-manager.tsx` ve `section-toggles.tsx` KULLANIMDAN KALKAR (dosyalar Task 3'te silinir); content/page.tsx'ten SectionManager çıkarılır.
- ↑↓ = `moveSection` (Faz 2, optimistic). Sürükle-bırak Task 3'te.

- [ ] Kur + tsc/build → commit `feat(admin): Site Editörü — bölüm kartları: metin+görsel+sıra+görünürlük tek ekranda`

### Task 3: Sürükle-bırak + temizlik

**Files:** Modify `components/admin/editor-section-card.tsx` ve/veya `content-editor.tsx` (drag), Delete `components/admin/section-toggles.tsx`, Delete `components/admin/section-manager.tsx`

- Drag kalıbı: `app/admin/pages/[id]/block-reorder.tsx` OKU ve aynı yaklaşımı uygula (tutamaçtan dragstart, kart üzerine dragover ile yer değiştirme, bırakınca `saveSectionOrder(page, orderedRegistryIds)`); yalnız registryId'li kartlar sürüklenir; locked/other kartların pozisyonu korunur.
- Silinen bileşenlerin başka tüketicisi olmadığını grep ile doğrula.
- [ ] Uygula + tsc/build → commit `feat(admin): bölüm kartlarında sürükle-bırak sıralama + eski toggle bileşenleri kaldırıldı`

### Task 4: Doğrulama (kontrolör)

- [ ] tsc + build; deploy; canlıda /admin/content GET 200; DEVRIM güncelle
