# Admin Yeniden Tasarım — Faz 8: Tekil Medya Gizle/Göster — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Tekil medya slotları (hero videosu, bölüm görselleri — 76 slot) Site Editörü'nden **gizlenebilir/gösterilebilir** olur (kullanıcının "kaldırma/pasif" isteği; pozisyon silinemez, medya render edilmez). Video gizlenince poster'ı varsa poster gösterilir. Hiçbir slot gizli değilken site birebir aynı.

**Architecture:** `sec:` kalıbının aynısı: `Setting` `assetoff:<slotId>` = "1" (URL override'dan BAĞIMSIZ — gizle/göster arasında özel URL kaybolmaz). `lib/assets.ts`'e `getHiddenAssetSet` (cached) + `pickAssetVisible(map, hidden, slotId, def): string | null`. 56 public kullanım görünürlük-duyarlı hale getirilir (gizli → öğe render edilmez ya da video→poster düşüşü). Admin'de `AssetSlotGrid` satırına Görünür/Gizli switch'i.

## Global Constraints

- Hiçbir slot gizli değilken public çıktı BAYT-EŞDEĞER (denetçi verbatim kontrol eder).
- Mevcut `pickAsset`, `setAsset`, Değiştir/Sıfırla akışları birebir korunur; `pickAsset` imzası değişmez.
- `setAssetHidden(slotId, hidden)`: requireAdmin + audit + `revalidatePath("/", "layout")` (`setSectionVisible` kalıbı; slotId `ASSET_SLOTS`'ta doğrulanır).
- Galeri bölümleri (Faz 7) etkilenmez (kendi aktif/pasif'i var).
- Görev başına `npx tsc --noEmit` + `npm run build` → Türkçe commit + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Altyapı + admin switch

**Files:** Modify `lib/assets.ts` (getHiddenAssetSet + pickAssetVisible), `lib/asset-actions.ts` (setAssetHidden), `components/admin/asset-manager.tsx` (AssetSlotGrid satırına Görünür/Gizli `.adm-switch`, optimistic, gizliyken kart soluk + "Gizli" rozeti), `app/admin/content/page.tsx` (hidden set'i props'a ekle).

**Interfaces (Produces):**
```ts
// lib/assets.ts ekleri
export const ASSET_OFF_PREFIX = "assetoff:";
export const getHiddenAssetSet = cache(async (): Promise<Set<string>>); // tek sorgu, hata → boş Set
export function pickAssetVisible(map: Record<string,string>, hidden: Set<string>, slotId: string, def: string): string | null; // gizliyse null, değilse pickAsset sonucu
// lib/asset-actions.ts ekleri
export async function setAssetHidden(slotId: string, hidden: boolean): Promise<void>;
```
- [ ] tsc/build → commit `feat(admin): tekil medya gizle/göster — altyapı + editör switch'i`

### Task 2: Public tarama — 56 kullanım görünürlük-duyarlı

**Files:** Modify `app/[locale]/{page,antalya,lessons,education,about,faq,contact}/page.tsx` + `components/ready-routes.tsx` (+ medya prop'u alan bileşenlerde null-toleransı gerekiyorsa minimal ek).

- Her kullanım `pickAssetVisible`'a geçer; `null` ise: (a) bağımsız görsel/video → öğe (ve YALNIZ ona ait sarmalayıcı figür) render edilmez; (b) video+poster çifti → video null ise poster statik görsel olarak gösterilir (poster da gizliyse hiçbiri); (c) arka plan görseli → stilsiz düşme yerine mevcut degrade/renk zaten altta ise sadece görsel katmanı atlanır. Her kararı rapora tablo olarak yaz (slot → gizlenince ne olur).
- Hiçbir slot gizli değilken (`hidden` boş Set) çıktı bayt-eşdeğer: `pickAssetVisible` boş set'te `pickAsset`'le aynı stringi döndürür, koşullu dallar tetiklenmez.
- [ ] tsc/build → commit `feat(public): tekil medyalar gizlenebilir — 56 kullanım görünürlük-duyarlı`

### Task 3: Doğrulama + deploy (kontrolör)
- [ ] tsc+build; deploy; canlı işaret kontrolü; DEVRIM Rev 32.
