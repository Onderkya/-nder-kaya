# Admin Yeniden Tasarım — Faz 5: AI Yan Paneli — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** AI asistan sağ yan panele taşınır: üst bar butonu her sayfada açar (masaüstü ~400px sağ panel, mobil alttan tam boy sheet); sohbet sayfa geçişinde kaybolmaz; sayfaya duyarlı öneri çipleri; dashboard'da gömülü AI kartı (yazınca panel açılıp soruyu gönderir); sağ-alt balon (FAB) kalkar.

**Architecture:** Panel kabuğun parçası olur: `components/admin/ai-panel.tsx` (client) — mevcut `ai-fab.tsx`'in sohbet mantığı (API çağrıları `/api/admin/ai` + `/api/admin/ai/apply`, onaylı işlem kartı, "anahtar yoksa rehber") TAŞINIR (backend değişmez). Panel aç/kapa durumu ve dashboard→panel köprüsü için küçük bir client context: `components/admin/ai-panel-context.tsx` (`AiPanelProvider`, `useAiPanel(): { open, openWith(question?), close }`). Layout `AiPanelProvider`'ı sarar; `TopBar`'daki AI butonu `useAiPanel().open`'ı çağırır (Link olmaktan çıkar); `/admin/ai` sayfası kalır (tam sayfa sürüm). Öneri çipleri `usePathname()`'e göre statik tablodan.

## Global Constraints

- Backend API rotalarına DOKUNULMAZ (`/api/admin/ai`, `/api/admin/ai/apply`); istek/yanıt sözleşmesi ai-fab'dekiyle birebir.
- Onay akışı korunur: AI'nin yazma önerisi kartta gösterilir, kullanıcı onaylamadan apply çağrılmaz; silme yok (backend zaten engelliyor).
- `assistantAvailable` false ise panel "nasıl açılır" rehberini gösterir (ai-fab'deki mevcut metin).
- Sohbet state'i panel bileşeninde (Provider altında) yaşar → route değişince kaybolmaz. (Sayfa yenilemede kaybolması NORMAL — bugünkü davranış.)
- Görev başına `npx tsc --noEmit` + `npm run build` → Türkçe commit + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: AiPanel + Provider + TopBar entegrasyonu + FAB kaldırma

**Files:** Create `components/admin/ai-panel.tsx` + `components/admin/ai-panel-context.tsx`; Modify `app/admin/layout.tsx` (Provider + AiPanel mount; AdminAiFab çıkar), `components/admin/top-bar.tsx` (Link→buton), Delete `components/admin/ai-fab.tsx`.

- ÖNCE OKU: `components/admin/ai-fab.tsx` (sohbet mantığı, API sözleşmesi, onay kartı, anahtarsız rehber — hepsi buradan taşınır), `app/admin/ai/page.tsx` + `ai-chat.tsx` (tam sayfa sürüm; ORTAK mantık varsa kopya değil paylaşım tercih et ama `ai-chat.tsx`'i kırma), `top-bar.tsx`, `layout.tsx`.
- Panel: masaüstü `fixed right-0 inset-y-0 w-[400px]` beyaz yüzey + sol hairline, üstte başlık+kapat (Esc de kapatır), ortada mesaj listesi, altta öneri çipleri + input. Mobil (<1024px): alttan sheet (tam boy, `inset-x-0 bottom-0 top-14` gibi), alt sekme çubuğunun üstünde z-index. Faz 1 tasarım dili.
- Öneri çipleri: pathname→2-3 soru statik tablosu (ör. /admin/sales→"Bu ay ciro ne kadar?", /admin/tours→"Hangi tur en çok satıyor?", /admin/leads→"Bekleyen talepleri özetle", varsayılan→"Bu ay kaç satış oldu?"). Çipe tıklayınca input dolar+gönderilir.
- `aiAvailable` layout'tan Provider'a prop geçer (mevcut hesap değişmez).
- [ ] tsc/build → commit `feat(admin): AI yan paneli — her sayfada üst bardan, sohbet gezinmede kalıcı; balon kaldırıldı`

### Task 2: Dashboard AI kartı

**Files:** Modify `app/admin/page.tsx` (metrik bandının altına AI kartı), gerekirse `ai-panel-context.tsx`'e `openWith(question)` zaten Task 1'de var — kart onu kullanır (küçük client bileşen: `components/admin/dashboard-ai-card.tsx`).

- Kart: başlık "AI Asistan" + tek satır input + 2 öneri çipi; yazıp Enter → `openWith(soru)` (panel açılır, soru gönderilir). `aiAvailable` false → kart rehber kısaltması + Ayarlar linki.
- Dashboard'un kalanına dokunma (Faz 6'nın işi).
- [ ] tsc/build → commit `feat(admin): dashboard AI kartı — yaz, panel açılsın`

### Task 3: Doğrulama (kontrolör)
- [ ] tsc+build; deploy; canlı 200 turu; DEVRIM Rev 29.
