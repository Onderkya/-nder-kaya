# Admin Yeniden Tasarım — Faz 4: Tur Editörü Genişletmesi — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Hazır Rotalar'da HER ŞEY düzenlenebilir: kodlu 5 turun gün-gün adımları dahil; her satırda ikon (Font Awesome seçici, Türkçe arama) + başlık/açıklama (dil sekmeli) + gün + aktif/pasif + sil + sürükle-sırala; tur başına "Pakete dahil" listesi. Override yoksa site birebir aynı.

**Architecture:** `tours:items` JSON şeması genişler (migrationsız): `TourStepCfg.icon?/active?`, `TourCfg.included?: {icon, label: L10n, active?}[]`. Kodlu turların varsayılan adımları `components/ready-routes.tsx`'ten `lib/tour-defaults.ts`'e çıkarılır (tek kaynak: public render + admin prefill). İkonlar: değer ya eski `route-icons` adı ya `fa:faPlane` biçimi; public'te `components/fa-icon.tsx` (server, `@fortawesome/free-solid-svg-icons` verisinden inline SVG — YALNIZ kullanılan ikon gömülür, webfont yok, client bundle'a FA girmez); admin seçicisi FA listesini `next/dynamic`/lazy import ile yalnız açılınca yükler + Türkçe takma-ad tablosu.

## Global Constraints

- Override kaydı yoksa public çıktı birebir aynı (kodlu adımlar çevirilerden; included varsayılan 6 `inc_*` maddesi).
- `lib/tour-actions.ts` kalıbı: requireAdmin + audit + revalidatePath("/", "layout"). Mevcut action adları/çağıranları kırılmaz (imza geriye uyumlu genişler).
- FA client bundle'a SIZMAZ (public tarafta yalnız server-side inline SVG; admin'de lazy).
- Kodlu turda kullanıcı adımları kaydederse metinler override olur (çeviri düzenlemeleri o turda artık yansımaz) — editörde küçük notla belirtilir; hiç kaydetmezse çeviriler kaynak kalır.
- Görev başına `npx tsc --noEmit` + `npm run build` → Türkçe commit + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Tipler + tur varsayılanları tek kaynağa + FaIcon

**Files:** Modify `lib/tours.ts` (tip ekleri), Create `lib/tour-defaults.ts`, Create `components/fa-icon.tsx`, Modify `components/ready-routes.tsx` (varsayılanları yeni lib'den tüketir — DAVRANIŞ BİREBİR), Modify `package.json` (`npm i @fortawesome/free-solid-svg-icons`).

**Interfaces (Produces):**
```ts
// lib/tours.ts ekleri (mevcut alanlar DEĞİŞMEZ):
export type TourStepCfg = { day: number; t: L10n; d: L10n; icon?: string; active?: boolean };
export type TourCfg = { ...mevcut...; included?: { icon: string; label: L10n; active?: boolean }[] };

// lib/tour-defaults.ts:
export type DefaultStep = { icon: string; day: number; tKey: string; dKey: string }; // routes.* çeviri anahtarları
export const DEFAULT_STEPS: Record<string, DefaultStep[]>;   // r1..r5 — ready-routes'taki mevcut diziler BİREBİR
export const DEFAULT_INCLUDED: { icon: string; labelKey: string }[]; // mevcut 6 inc_* madde
// components/fa-icon.tsx (server-safe):
export function FaIcon({ name, size, className }: { name: string; size?: number; className?: string }); // name "fa:faPlane"→fas'tan path; değilse null döner
export const isFaName = (s: string) => s.startsWith("fa:");
```
- ready-routes.tsx bu görevde SADECE veri kaynağını değiştirir (inline diziler → DEFAULT_STEPS/DEFAULT_INCLUDED); render çıktısı birebir (denetçi verbatim kontrol edecek). Özel turlardaki sabit `icon:"landmark"` bu görevde kalır (Task 2 ele alır).
- [ ] Kur + tsc/build → commit `feat(tours): tur varsayılanları tek kaynakta + FA ikon altyapısı`

### Task 2: Public render — steps/included/icon override birleşimi

**Files:** Modify `components/ready-routes.tsx`, gerekirse Modify `components/route-gallery.tsx` (ikon render'ı Fa destekli yardımcıyla).

- İkon çözümü: tek yardımcı (ör. `TourIcon({name})`): `fa:` → `FaIcon`, değilse `RouteIcon`. Galeri/modal'daki tüm adım+included ikonları bundan geçer.
- Kodlu tur: `cfg.steps?.length` varsa adımlar override'dan (icon yoksa varsayılan eşleniği; `active===false` atlanır; L10n `pickL10n`); yoksa DEFAULT_STEPS+çeviri (bugünkü davranış).
- Özel tur: adım ikonu `s.icon ?? "landmark"`.
- Included: `cfg.included?.length` varsa oradan (`active!==false` filtre, `pickL10n(label)`); yoksa DEFAULT_INCLUDED+çeviri.
- [ ] Uygula + tsc/build → commit `feat(tours): adım/included/ikon override'ları public render'da`

### Task 3: Admin tur editörü — satır kalıbı + FA seçici

**Files:** Modify `components/admin/tour-editor.tsx` (büyür: adım editörü artık kodlu turlarda da; included editörü; ikon seçici), Create `components/admin/icon-picker.tsx` (client, lazy FA listesi + Türkçe arama), Modify `lib/tour-actions.ts` (saveTour yeni alanları kabul eder — geriye uyumlu), gerekirse Create `lib/icon-search-tr.ts` (Türkçe→EN takma-ad tablosu, ~60+ turizm terimi: tekne, müze, plaj, dalış, kale, şelale, teleferik, spa...).

- Satır kalıbı (3 yerde: gün-gün plan, included, özel tur durakları — TEK bileşenle): sürükle tutamacı (+↑↓), ikon butonu (tıkla→seçici modal), gün (planda), başlık+açıklama inputları (seçili dil; editörün mevcut dil sekmesi mantığı), aktif switch, sil; altta "Satır ekle".
- Kodlu tur prefill: `DEFAULT_STEPS[key]` + `lib/messages` çevirilerinden 4 dilin metinleri doldurulur; üstte not: "Bu adımları kaydedersen metinler artık buradan yönetilir (Site İçeriği çevirileri bu turda devre dışı kalır)".
- Seçici: arama kutusu (TR takma-ad + isim eşleşmesi), grid, seçim `fa:<name>`; mevcut route-icons setinden de bölüm göster (eski adlar geçerli kalır).
- saveTour: steps[].icon/active + included[] parse+doğrulama (bilinen alanlar, string kırpma), audit'e alan adları.
- [ ] Uygula + tsc/build → commit `feat(admin): tur editörü — her adım/ikon/included düzenlenebilir, FA seçici`

### Task 4: Doğrulama (kontrolör)
- [ ] tsc+build; deploy; canlıda /tr ana sayfa rota kartları birebir; DEVRIM Rev 28.
