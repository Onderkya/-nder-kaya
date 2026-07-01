# Admin Yeniden Tasarım — Faz 2: Bölüm Sıralama (7 public sayfa) — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 7 public sayfanın (home, antalya, lessons, education, about, faq, contact) bölümlerini admin'den sıralanabilir + göster/gizle yapılabilir hale getirmek; kayıt yoksa site birebir bugünkü gibi.

**Architecture:** Mevcut `sec:<id>`="off" göster/gizle sistemi aynen kalır. Sıra `Setting` `secorder:<page>` = JSON string[] (bölüm id'leri). Her public sayfa, bölümlerini `[id, ReactNode]` çiftlerine ayırır; `applySectionOrder(defaultIds, saved)` saf fonksiyonu sırayı uygular (bilinmeyen id atılır, eksik id varsayılan komşusuna göre eklenir); hero üstte / kapanış CTA altta sabittir ve kayıt defterine girmez. Admin tarafında mevcut `SectionToggles` yerini sayfa seçicili `SectionManager`'a bırakır (↑↓ + switch; sürükle-bırak Faz 3'te).

**Tech Stack:** Next.js App Router (server components), Prisma `Setting`, mevcut `lib/sections.ts` kalıpları.

## Global Constraints

- Override kaydı yoksa public sayfalar **birebir bugünkü** çıktıyı üretmeli (varsayılan sıra = koddaki sıra; hiçbir bölümün içeriğine/tasarımına dokunulmaz — yalnız diziliş mantığı).
- Hero ve sayfa-sonu CTA bölümleri kayıt defterine GİRMEZ (kilitli).
- Yeni server action'lar: `requireAdmin()` + `audit(...)` + `revalidatePath("/", "layout")` (mevcut `section-actions.ts` kalıbı).
- Alan adları/rotalar/mevcut action imzaları değişmez; `setSectionVisible` aynen kalır.
- DB hatasında varsayılana düşülür (try/catch, `getHiddenSections` kalıbı).
- Her görev sonunda `npx tsc --noEmit` + `npm run build` temiz → commit (Türkçe mesaj + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`).
- Test framework yok; saf fonksiyon için görev içinde `node` ile hızlı doğrulama scripti çalıştırılır.

---

### Task 1: Sıralama altyapısı — registry genişletme + lib + action'lar

**Files:**
- Modify: `lib/section-registry.ts` (7 sayfanın bölümleri)
- Modify: `lib/sections.ts` (sıra okuma + saf sıralama fonksiyonu)
- Modify: `lib/section-actions.ts` (saveSectionOrder + moveSection)

**Interfaces:**
- Produces (sonraki görevler bunları tüketir):
  - `SECTIONS: SectionDef[]` — 7 sayfa için genişletilmiş; `SectionDef = { page, id, label }` DEĞİŞMEZ. id kuralı: `<page>.<camelCaseAd>`. Bölüm sınırlarını belirlemek için her sayfanın `app/[locale]/<sayfa>/page.tsx` dosyasını OKU ve ana görsel blokları (hero ve kapanış CTA HARİÇ) bölüm olarak listele; home'un mevcut 10 girdisi AYNEN korunur (id'ler değişmez!). Etiketler kullanıcı diliyle Türkçe.
  - `lib/sections.ts`: `getSectionOrders = cache(async (): Promise<Record<string, string[]>>)` — tüm `secorder:` kayıtlarını tek sorguda okur (`startsWith: "secorder:"`), bozuk JSON'u yok sayar; hata halinde `{}`.
  - `lib/sections.ts`: `applySectionOrder(defaultIds: string[], saved: string[] | undefined): string[]` — SAF: saved yoksa defaultIds; saved'daki bilinmeyen id'ler atılır; defaultIds'te olup saved'da olmayan her id, varsayılan listedeki bir önceki komşusunun (sonuçta mevcutsa) hemen arkasına, yoksa başa eklenir.
  - `lib/section-actions.ts`: `saveSectionOrder(page: string, ids: string[])` — page o sayfanın registry id'lerine göre doğrulanır (bilinmeyen id atılır), `Setting` `secorder:<page>` yazılır; `moveSection(page: string, id: string, dir: "up"|"down")` — mevcut sırayı (kayıt yoksa varsayılanı) alıp komşusuyla yer değiştirir ve `saveSectionOrder`'ı kullanır. Her ikisi requireAdmin + audit + revalidatePath("/", "layout"). Mevcut `setSectionVisible` DEĞİŞMEZ.

- [ ] Registry'yi 7 sayfaya genişlet (sayfaları okuyarak; home id'leri birebir korunur)
- [ ] `getSectionOrders` + `applySectionOrder`'ı yaz
- [ ] `applySectionOrder`'ı hızlı doğrula: `node -e` ile en az 5 senaryo (boş kayıt / tam ters sıra / bilinmeyen id / eksik id ortada / hepsi bilinmeyen) — beklenen çıktıları raporla
- [ ] Action'ları yaz (kalıp: mevcut `section-actions.ts`)
- [ ] `npx tsc --noEmit && npm run build` → commit `feat(admin): bölüm sıralama altyapısı — registry 7 sayfa + secorder + action'lar`

---

### Task 2: Ana sayfa sıraya bağlanır (referans kalıp)

**Files:**
- Modify: `app/[locale]/page.tsx`

**Interfaces:**
- Consumes: Task 1 (`getSectionOrders`, `applySectionOrder`, `getHiddenSections`, registry home id'leri — registry dosyasından oku).
- Produces: diğer sayfa görevlerinin birebir izleyeceği kalıp:

```tsx
const hidden = await getHiddenSections();
const orders = await getSectionOrders();
// Her bölüm: [registryId, JSX] — JSX İÇERİĞİNE DOKUNMA, mevcut bloğu aynen taşı.
const sectionBlocks: [string, React.ReactNode][] = [
  ["home.readyRoutes", <ReadyRoutes ... />],
  // ... koddaki mevcut sırayla, yalnız registry'de olan bölümler
];
const defaultIds = sectionBlocks.map(([id]) => id);
const orderedIds = applySectionOrder(defaultIds, orders["home"]);
const byId = new Map(sectionBlocks);
...
{/* hero aynen */}
{orderedIds.filter((id) => sectionVisible(hidden, id)).map((id) => (
  <Fragment key={id}>{byId.get(id)}</Fragment>
))}
{/* kapanış CTA aynen */}
```

- Sayfada bölümler arasında kalan "ara" düğümler varsa (ör. bölüm dışı sabit şerit), en yakın bölümün JSX'ine dahil et ya da hero/CTA gibi sabit bırak — GÖRSEL ÇIKTI DEĞİŞMEMELİ.
- Mevcut `sectionVisible` çağrıları bu yapıya taşınır (davranış aynı).
- [ ] Refactor + `npx tsc --noEmit && npm run build`
- [ ] Doğrulama: `npm run build` çıktısında sayfa hâlâ derleniyor; kayıt yokken JSX sırasının koddaki sırayla aynı olduğunu koddan teyit et (defaultIds listesi eski render sırasıyla birebir)
- [ ] Commit `feat(public): anasayfa bölümleri sıraya bağlandı (kayıt yoksa birebir aynı)`

---

### Task 3: antalya + lessons + education sıraya bağlanır

**Files:**
- Modify: `app/[locale]/antalya/page.tsx`, `app/[locale]/lessons/page.tsx`, `app/[locale]/education/page.tsx`

**Interfaces:**
- Consumes: Task 1 lib'leri + registry id'leri (dosyadan oku) + Task 2'nin kalıbı (yukarıdaki kod bloğu bu görevde de geçerli — aynı desen, sayfa anahtarı değişir).
- Kural: her sayfanın hero'su ve kapanış CTA/ConversionBand'i sabit; aradaki ana bölümler registry id'leriyle eşlenir. Registry'de o sayfa için tanımlı olmayan hiçbir blok değiştirilmez.
- [ ] 3 sayfayı refactor et + tsc/build → tek commit `feat(public): antalya/lessons/education bölümleri sıraya bağlandı`

---

### Task 4: about + faq + contact sıraya bağlanır

**Files:**
- Modify: `app/[locale]/about/page.tsx`, `app/[locale]/faq/page.tsx`, `app/[locale]/contact/page.tsx`

Task 3 ile aynı kurallar/desen (sayfa anahtarları: about, faq, contact).
- [ ] 3 sayfayı refactor et + tsc/build → commit `feat(public): about/faq/contact bölümleri sıraya bağlandı`

---

### Task 5: Admin — SectionManager (sayfa seçici + ↑↓ + switch)

**Files:**
- Create: `components/admin/section-manager.tsx` (client)
- Modify: `app/admin/content/page.tsx` (SectionToggles yerine SectionManager)
- Delete etme: `components/admin/section-toggles.tsx` DURUR (başka tüketici olabilir; kontrol et, yoksa da bırak — Faz 3 temizler)

**Interfaces:**
- Consumes: Task 1 action'ları (`saveSectionOrder` DEĞİL — client'tan `moveSection(page, id, dir)` ve mevcut `setSectionVisible(id, visible)` çağrılır), `SECTIONS`/`sectionsForPage`, `getHiddenSections`, `getSectionOrders` (server tarafında okunup prop geçilir).
- Produces: `SectionManager({ pages, sectionsByPage, hidden, orders })` — üstte sayfa seçici (sekme/pill), altında seçili sayfanın bölümleri SIRALI liste: her satır `label + ↑ ↓ butonları + adm-switch`. ↑↓ `moveSection` server action'ını `useTransition` ile çağırır; switch mevcut `setSectionVisible`. Satır stilleri Faz 1 tasarım sistemi (`.adm-card` satırları, ince çizgi).
- `/admin/content` server sayfası: `hidden`, `orders`, tüm sayfaların registry bölümlerini hazırlayıp SectionManager'ı mevcut SectionToggles'ın yerine koyar. Sayfanın kalan yapısı (content-editor vb.) DEĞİŞMEZ.
- [ ] Bileşen + entegrasyon + tsc/build → commit `feat(admin): bölüm yöneticisi — 7 sayfada sırala (↑↓) + göster/gizle`

---

### Task 6: Canlı doğrulama + düzeltmeler

- [ ] `npx tsc --noEmit && npm run build` (son kontrol)
- [ ] Kontrolör deploy eder (bu görev implementer'a değil kontrolöre ait): push + sunucuda reset+rebuild
- [ ] Canlıda 7 sayfanın 200 döndüğü ve anahtar bölüm işaretlerinin HTML'de bulunduğu doğrulanır (curl)
- [ ] Bulgu varsa düzeltme görevleri açılır
