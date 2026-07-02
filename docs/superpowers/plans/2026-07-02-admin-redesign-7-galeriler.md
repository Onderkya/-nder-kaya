# Admin Yeniden Tasarım — Faz 7: Dinamik Medya Galerileri — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Galeri bölümlerinde (tekrarlanan birimi "medya + başlık" olan bölümler) medyalar Site Editörü'nden eklenebilir/çıkarılabilir/aktif-pasif yapılabilir/sıralanabilir/güncellenebilir olur. Tekil slotlar mevcut Değiştir/Sıfırla davranışında kalır. Override yoksa site birebir aynı.

**Architecture:** Turlar kalıbının birebir uyarlaması: `Setting` `gallery:<bölümId>` JSON öğe listesi; koddaki varsayılanlar `lib/gallery-defaults.ts`'e çıkarılır (public render + admin prefill tek kaynak); public galeri bileşenleri birleşik listeyi prop alır; Site Editörü'nde galeri bölümünün kartı satır-tabanlı yönetici gösterir (**dirty-tracking ile** — dokunulmadan kaydetmek override yazmaz, Faz 4 dersi).

## Global Constraints

- Override kaydı yoksa public çıktı BİREBİR aynı (varsayılanlar koddan; başlıklar çeviri anahtarından okunmaya devam eder).
- `saveGallery(sectionId, items)`: requireAdmin + audit + `revalidatePath("/", "layout")`.
- Site Editörü'nün tek-form (`#ce-form`, `key|||locale`) sözleşmesi bozulmaz — galeri yöneticisi form DIŞI kendi aksiyonuyla kaydeder (bölüm sıralama switch'leri gibi) ya da forma girmeyen kontrollerle çalışır; metin alanlarına karışmaz.
- Tekil slotların (AssetSlotGrid) davranışı değişmez.
- Görev başına `npx tsc --noEmit` + `npm run build` → Türkçe commit + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Envanter + `lib/gallery.ts` + varsayılanlar + aksiyon

**Files:** Create `lib/gallery.ts`, `lib/gallery-defaults.ts`, `lib/gallery-actions.ts`.

**Envanter (bu görevde yapılır, rapora yazılır):** 7 public sayfanın bileşenlerini tara; "medya + başlık" listesi render eden bölümleri belirle. Bilinen adaylar: `home.zipper` (zipper-reveal kartları, ~9 video/görsel) ve Antalya incileri (`horizontal-places` — antalya sayfasından `places` prop'u). Otel kartları, turlar, misafir sözleri GALERİ DEĞİLDİR. Tekil medyalar (hero, figürler) dahil edilmez. Bulunan her galeri için: bölüm registry id'si + koddaki öğe listesi (src/type/poster/çeviri anahtarları).

**Interfaces (Produces):**
```ts
// lib/gallery.ts
export type GalleryItemCfg = { src: string; type: "image" | "video"; poster?: string; title?: L10n; desc?: L10n; active?: boolean };
export const getGalleries = cache(async (): Promise<Record<string, GalleryItemCfg[]>>); // "gallery:" öneki tek sorgu, bozuk JSON yok sayılır, hata → {}
// lib/gallery-defaults.ts
export type DefaultGalleryItem = { src: string; type: "image" | "video"; poster?: string; tKey?: string; dKey?: string; ns?: string }; // çeviri anahtarı + ad alanı
export const GALLERY_DEFAULTS: Record<string, DefaultGalleryItem[]>; // bölümId → koddaki mevcut liste BİREBİR
// lib/gallery-actions.ts
export async function saveGallery(sectionId: string, items: GalleryItemCfg[]); // doğrulama: bilinen bölümId (GALLERY_DEFAULTS anahtarı), src string, type enum, L10n temizliği; requireAdmin+audit+revalidatePath; varsayılana eşdeğer/boşsa kaydı SİL
```
- [ ] Envanter + üç dosya + `node` doğrulaması (GALLERY_DEFAULTS her öğesi ilgili bileşendeki mevcut değerlerle eşleşir — rapora tablo) + tsc/build → commit `feat(galeri): dinamik medya galerisi altyapısı — varsayılanlar tek kaynakta`

### Task 2: Public bileşenler birleşik listeyi okur

**Files:** Modify galeri render eden bileşenler + onları besleyen sayfa/sarmalayıcılar (envantere göre; bilinen: `components/zipper-reveal.tsx` + onu render eden yer, `components/horizontal-places.tsx` + `app/[locale]/antalya/page.tsx`).

- Sunucu tarafında birleşim: `getGalleries()[sectionId]` varsa (uzunluk>0) o liste (`active!==false` filtre, başlık `pickL10n(title) || çeviri(tKey)`); yoksa GALLERY_DEFAULTS + çeviri (bugünkü davranış birebir).
- Client bileşenlere serileştirilebilir prop geçir (mevcut prop şekillerini genişlet; zipper'ın iki modu — mobil scroll-snap + masaüstü fermuar — aynı listeyi kullanır).
- Öğe sayısı değişebilir → bileşenler liste uzunluğuna dayalı çalışmalı (sabit 9 varsayımı varsa kaldır; boş liste → bölüm render edilmez ya da varsayılana düşer — VARSAYILANA DÜŞ, boş liste kaydetmeyi aksiyon zaten siliyor).
- Override yokken çıktı bayt-eşdeğer (denetçi verbatim kontrol eder).
- [ ] tsc/build → commit `feat(galeri): fermuar + Antalya incileri dinamik listeden render`

### Task 3: Site Editörü galeri yöneticisi

**Files:** Create `components/admin/gallery-manager.tsx` (client); Modify `components/admin/editor-section-card.tsx` + `components/admin/content-editor.tsx` + `app/admin/content/page.tsx` (galeri verisi + prefill hazırlama).

- Galeri bölümlerinin kartında (GALLERY_DEFAULTS anahtarıyla eşleşen registryId), AssetSlotGrid YERİNE galeri yöneticisi: satır kalıbı (küçük önizleme + tip rozeti + sürükle/↑↓ + aktif switch + Değiştir [mevcut PickerModal: yükle/kütüphane/URL] + Sil) + "Medya ekle" + dil sekmeli başlık/açıklama (satır genişleyince).
- Prefill: sunucu, varsayılanları 4 dilin çevirileriyle L10n'e çevirip yollar (tur editörü kalıbı). **Dirty-tracking:** dokunulmadıysa VE kayıtlı override yoksa kaydetme; "Galeriyi kaydet" butonu satır alanının altında (bölüm metin formundan bağımsız, `saveGallery` çağırır) — kaydetmeden sekme değişirse uyarı satırı.
- Tekil slotlu bölümlerde AssetSlotGrid aynen kalır; bir bölümde HEM galeri HEM tekil slot varsa ikisi de gösterilir (galeri üstte).
- Editörde not: "Bu listeyi kaydedersen başlıklar şu anki halleriyle sabitlenir; Site İçeriği çevirileri bu galeride devre dışı kalır." (tur editörü notunun aynısı).
- [ ] tsc/build → commit `feat(admin): Site Editörü'nde galeri yöneticisi — ekle/çıkar/aktif-pasif/sırala`

### Task 4: Doğrulama + deploy (kontrolör)
- [ ] tsc+build; deploy; canlı /tr + /tr/antalya bayt-kontrol (override yokken işaretler); DEVRIM Rev 31.
