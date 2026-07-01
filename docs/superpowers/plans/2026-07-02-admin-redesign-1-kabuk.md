# Admin Yeniden Tasarım — Faz 1: Tasarım Sistemi + Kabuk + Menü — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin panelinin görsel temelini "temiz & modern araç" diline çevirmek: nötr açık palet, tek sans font (Onest), açık renkli sol menü, masaüstünde sabit üst bar (Siteyi Gör + AI butonu), sadeleşmiş menü etiketleri.

**Architecture:** Tüm renk token'ları `.adm-body` kapsamında override edilir (public `globals.css`'e DOKUNULMAZ) — 18 admin sayfasındaki inline `rgb(var(--...))` kullanımları otomatik yeni paleti alır. `admin.css` tamamen yeniden yazılır ama **her mevcut sınıf seçicisi korunur** (sayfalar kırılmaz). Kabuk (`layout.tsx`) açık kenar çubuğu + yeni `TopBar` bileşenini alır; Onest fontu admin layout'una `next/font` ile eklenir (bugün admin'de hiç font yüklenmiyor!).

**Tech Stack:** Next.js App Router, Tailwind (yardımcı sınıflar), saf CSS (`admin.css`), next/font/google.

## Global Constraints

- `app/globals.css`'e ve public site dosyalarına DOKUNMA (spec değişmezi).
- Server action'lar, alan adları, rotalar birebir korunur; bu faz yalnız sunum.
- `admin.css`'teki HİÇBİR sınıf seçicisi silinmez (sayfalar `.adm-*` kullanıyor); yalnız görünüm değerleri değişir, yeni sınıf eklenebilir.
- `AdminAiFab` bu fazda KALIR (Faz 5'te yan panele dönüşecek).
- Her görev sonunda: `npx tsc --noEmit` temiz + `npm run build` başarılı → commit.
- Commit mesajları Türkçe, `feat(admin):`/`fix(admin):` öneki; gövde sonuna `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Test framework yok; doğrulama = typecheck + build + dev sunucusunda görsel kontrol (görev adımlarında somut kontrol listesi var).

---

### Task 1: `admin.css` tam yeniden yazımı (nötr palet + tüm sınıflar)

**Files:**
- Modify: `app/admin/admin.css` (tam içerik değişimi)

**Interfaces:**
- Produces: `.adm-body` kapsamlı token override'ları; mevcut tüm `.adm-*` sınıfları yeni görünümle; YENİ sınıflar: `.adm-topbar`, `.adm-topbar-title`, `.adm-btn-ai`. Task 3'teki `TopBar` bunları kullanır.

- [ ] **Step 1: Dosyayı aşağıdaki içerikle tamamen değiştir**

```css
/*
 * Antalya Bridge — Yönetim paneli tasarım katmanı (Faz 1 yeniden yazım).
 * "Temiz & modern araç": beyaz yüzeyler, açık gri zemin, ince çizgiler,
 * neredeyse sıfır gölge, tek sans font. Turkuaz yalnız etkileşim rengi,
 * mercan yalnız tehlike. Public marka token'ları .adm-body KAPSAMINDA
 * override edilir — globals.css'e dokunulmaz, public site etkilenmez.
 */

:root {
  --adm-nav-h: 64px; /* mobil alt sekme yüksekliği */
}

/* ---- Kabuk + panel-içi palet ---- */
.adm-body {
  --background: 246 247 249;      /* açık gri sayfa zemini */
  --foreground: 26 32 38;         /* koyu nötr metin */
  --card: 255 255 255;            /* beyaz yüzey */
  --card-foreground: 26 32 38;
  --muted: 241 243 246;
  --muted-foreground: 105 116 128;
  --primary: 11 122 140;          /* derin turkuaz (beyazda okunur) */
  --primary-foreground: 255 255 255;
  --accent: 202 62 40;            /* sakin mercan — yalnız tehlike */
  --accent-foreground: 255 255 255;
  --lagoon: 11 122 140;           /* eski lagoon kullanıcıları primary'ye düşer */
  --gold: 176 118 28;             /* amber — yalnız uyarı çipi */
  --border: 228 232 238;
  --ring: 11 122 140;
  --font-display: var(--font-sans); /* adminde serif başlık yok */

  background-color: rgb(var(--background));
  color: rgb(var(--foreground));
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
}

.adm-sidebar {
  background: rgb(var(--card));
  color: rgb(var(--muted-foreground));
  border-right: 1px solid rgb(var(--border));
  transition: width 0.2s ease, padding 0.2s ease;
}
.adm-main-wrap { transition: padding-left 0.2s ease; }

/* Daraltma butonu — kenar çubuğu üst-sağ */
.adm-collapse-btn {
  display: none; /* yalnız masaüstünde göster */
  align-items: center; justify-content: center;
  width: 30px; height: 30px; flex-shrink: 0;
  border-radius: 8px;
  color: rgb(var(--muted-foreground));
  background: transparent;
  transition: background 0.15s ease, color 0.15s ease;
}
.adm-collapse-btn:hover { background: rgb(var(--muted)); color: rgb(var(--foreground)); }
@media (min-width: 1024px) { .adm-collapse-btn { display: inline-flex; } }

/* ---- Daraltılabilir kenar çubuğu (yalnız masaüstü) ---- */
@media (min-width: 1024px) {
  [data-adm-collapsed="1"] .adm-sidebar { width: 72px; padding-left: 10px; padding-right: 10px; }
  [data-adm-collapsed="1"] .adm-sidebar .adm-side-text { display: none; }
  [data-adm-collapsed="1"] .adm-sidebar .adm-group-label { display: none; }
  [data-adm-collapsed="1"] .adm-sidebar .adm-brandrow { justify-content: center; }
  [data-adm-collapsed="1"] .adm-sidebar .adm-brand { display: none; }
  [data-adm-collapsed="1"] .adm-sidebar .adm-nav-item,
  [data-adm-collapsed="1"] .adm-sidebar .adm-side-btn { justify-content: center; gap: 0; position: relative; }
  [data-adm-collapsed="1"] .adm-sidebar .adm-nav-badge { position: absolute; top: 3px; right: 6px; margin: 0; min-width: 16px; height: 16px; font-size: 9px; }
  [data-adm-collapsed="1"] .adm-main-wrap { padding-left: 72px; }
}
.adm-sidebar-scroll { scrollbar-width: thin; scrollbar-color: rgb(var(--border)) transparent; }
.adm-sidebar-scroll::-webkit-scrollbar { width: 6px; }
.adm-sidebar-scroll::-webkit-scrollbar-thumb { background: rgb(var(--border)); border-radius: 999px; }

.adm-brand { font-family: inherit; color: rgb(var(--foreground)); }

/* Grup başlığı */
.adm-group-label {
  color: rgb(var(--muted-foreground) / 0.85);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
}

/* Nav öğesi */
.adm-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 8px 10px;
  border-radius: 8px;
  color: rgb(var(--muted-foreground));
  font-size: 13.5px;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.adm-nav-item:hover { background: rgb(var(--muted)); color: rgb(var(--foreground)); }
.adm-nav-item[data-active="true"] {
  background: rgb(var(--primary) / 0.1);
  color: rgb(var(--primary));
  font-weight: 600;
}
.adm-nav-item svg { flex-shrink: 0; }
.adm-nav-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgb(var(--primary));
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

/* Kenar çubuğu alt aksiyonları */
.adm-side-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 8px 10px;
  border-radius: 8px;
  color: rgb(var(--muted-foreground));
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}
.adm-side-btn:hover { background: rgb(var(--muted)); color: rgb(var(--foreground)); }
.adm-side-cta {
  border: 1px solid rgb(var(--border));
  color: rgb(var(--foreground));
  font-weight: 600;
  justify-content: center;
}
.adm-side-cta:hover { border-color: rgb(var(--primary) / 0.5); background: rgb(var(--card)); }

/* ---- Üst bar (masaüstü) ---- */
.adm-topbar {
  position: sticky; top: 0; z-index: 25;
  display: none;
  align-items: center; gap: 12px;
  min-height: 54px;
  padding: 0 24px;
  background: rgb(var(--card) / 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgb(var(--border));
}
@media (min-width: 1024px) { .adm-topbar { display: flex; } }
.adm-topbar-title { font-size: 14px; font-weight: 600; color: rgb(var(--foreground)); }

/* AI butonu — turkuaz tonlu, sakin */
.adm-btn-ai {
  background: rgb(var(--primary) / 0.1);
  color: rgb(var(--primary));
  font-weight: 600;
}
.adm-btn-ai:hover:not(:disabled) { background: rgb(var(--primary) / 0.16); }

/* ---- Mobil alt sekme + drawer ---- */
.adm-bottomnav {
  background: rgb(var(--card) / 0.94);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgb(var(--border));
  padding-bottom: env(safe-area-inset-bottom);
}
.adm-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex: 1;
  min-height: var(--adm-nav-h);
  color: rgb(var(--muted-foreground));
  font-size: 10.5px;
  font-weight: 600;
  position: relative;
}
.adm-tab[data-active="true"] { color: rgb(var(--primary)); }
.adm-tab .adm-tab-dot {
  position: absolute;
  top: 8px; right: calc(50% - 20px);
  min-width: 16px; height: 16px; padding: 0 4px;
  border-radius: 999px; background: rgb(var(--primary)); color: #fff;
  font-size: 9px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center;
}

/* ---- Kartlar & yüzeyler ---- */
.adm-card {
  border-radius: 12px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--card));
  box-shadow: none;
}
.adm-card-pad { padding: 1.1rem; }
@media (min-width: 640px) { .adm-card-pad { padding: 1.35rem; } }

/* Öne çıkan / dikkat kartı — turkuaz iç çizgi */
.adm-card-featured {
  border-color: rgb(var(--primary) / 0.35);
  box-shadow: inset 3px 0 0 rgb(var(--primary));
}

/* Görsel/medya kart tırnağı */
.adm-thumb {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--muted));
  transition: border-color 0.15s ease;
}
.adm-thumb:hover { border-color: rgb(var(--primary) / 0.5); }

/* ---- Tipografi ---- */
.adm-title { font-family: inherit; font-weight: 650; letter-spacing: -0.02em; line-height: 1.1; color: rgb(var(--foreground)); }
.adm-eyebrow { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; color: rgb(var(--muted-foreground)); }
.adm-muted { color: rgb(var(--muted-foreground)); }
.adm-num { font-family: inherit; font-weight: 650; letter-spacing: -0.02em; line-height: 1; color: rgb(var(--foreground)); font-variant-numeric: tabular-nums; }

/* ---- Form kontrolleri ---- */
.adm-label { display: block; font-size: 12.5px; font-weight: 600; color: rgb(var(--foreground)); margin-bottom: 6px; text-transform: none; letter-spacing: 0; }
.adm-help { font-size: 12.5px; line-height: 1.4; color: rgb(var(--muted-foreground)); margin-top: 6px; }

.adm-input, .adm-textarea, .adm-select {
  width: 100%;
  min-height: 40px;
  border-radius: 8px;
  border: 1px solid rgb(var(--border));
  background: rgb(var(--card));
  padding: 8px 12px;
  font-size: 14px;
  color: rgb(var(--foreground));
  outline: none;
  box-shadow: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  font-family: inherit;
}
.adm-textarea { min-height: 88px; resize: vertical; line-height: 1.5; }
.adm-input::placeholder, .adm-textarea::placeholder { color: rgb(var(--muted-foreground) / 0.6); }
.adm-input:focus, .adm-textarea:focus, .adm-select:focus {
  border-color: rgb(var(--primary));
  box-shadow: 0 0 0 3px rgb(var(--primary) / 0.12);
}

/* ---- Butonlar ---- */
.adm-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  min-height: 40px; padding: 8px 16px;
  border-radius: 8px;
  font-size: 13.5px; font-weight: 600; letter-spacing: 0.005em;
  cursor: pointer; text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, filter 0.15s ease;
  white-space: nowrap;
}
.adm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.adm-btn-primary {
  background: rgb(var(--primary));
  color: #fff;
  box-shadow: none;
}
.adm-btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
.adm-btn-primary:active:not(:disabled) { filter: brightness(0.96); }
.adm-btn-ghost {
  background: rgb(var(--card)); color: rgb(var(--foreground));
  border: 1px solid rgb(var(--border));
}
.adm-btn-ghost:hover:not(:disabled) { background: rgb(var(--muted)); border-color: rgb(var(--muted-foreground) / 0.35); }
.adm-btn-danger { background: rgb(var(--accent) / 0.06); color: rgb(var(--accent)); border: 1px solid rgb(var(--accent) / 0.3); }
.adm-btn-danger:hover:not(:disabled) { background: rgb(var(--accent) / 0.12); border-color: rgb(var(--accent) / 0.5); }
.adm-btn-sm { min-height: 32px; padding: 5px 11px; font-size: 12.5px; border-radius: 7px; }

/* ---- Aç/Kapa anahtarı (aktif/pasif) ---- */
.adm-switch { position: relative; display: inline-flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.adm-switch input { position: absolute; opacity: 0; width: 0; height: 0; }
.adm-switch-track { width: 40px; height: 22px; border-radius: 999px; background: rgb(var(--muted-foreground) / 0.3); transition: background 0.18s ease; position: relative; flex-shrink: 0; }
.adm-switch-track::after { content: ""; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 999px; background: #fff; box-shadow: 0 1px 2px rgb(26 32 38 / 0.25); transition: transform 0.18s ease; }
.adm-switch input:checked + .adm-switch-track { background: rgb(var(--primary)); }
.adm-switch input:checked + .adm-switch-track::after { transform: translateX(18px); }
.adm-switch input:focus-visible + .adm-switch-track { box-shadow: 0 0 0 3px rgb(var(--primary) / 0.2); }
.adm-switch-label { font-size: 13.5px; font-weight: 600; color: rgb(var(--foreground)); }

/* Bölüm başlığı — sade sans */
.adm-section-title { font-family: inherit; font-weight: 600; font-size: 1.05rem; line-height: 1.2; letter-spacing: -0.01em; color: rgb(var(--foreground)); }

/* ---- Rozetler / durum çipleri ---- */
.adm-badge { display: inline-flex; align-items: center; gap: 5px; padding: 2px 9px; border-radius: 999px; font-size: 12px; font-weight: 600; line-height: 1.4; }
.adm-badge-neutral { background: rgb(var(--muted)); color: rgb(var(--muted-foreground)); }
.adm-badge-success { background: rgb(var(--primary) / 0.1); color: rgb(var(--primary)); }
.adm-badge-warn { background: rgb(var(--gold) / 0.14); color: rgb(var(--gold)); }
.adm-badge-danger { background: rgb(var(--accent) / 0.1); color: rgb(var(--accent)); }

/* ---- Boş durum ---- */
.adm-empty { text-align: center; padding: 36px 24px; border: 1.5px dashed rgb(var(--border)); border-radius: 12px; background: rgb(var(--muted) / 0.5); }

/* ---- Yardımcılar ---- */
.adm-divider { height: 1px; background: rgb(var(--border)); border: 0; }
.adm-gold-rule { height: 1px; width: 40px; background: rgb(var(--primary) / 0.4); }

/* Mobil yapışkan kaydet çubuğu */
.adm-sticky-save {
  position: sticky; bottom: 0; z-index: 20;
  background: rgb(var(--card) / 0.94);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgb(var(--border));
  padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
}

/* Yükleniş animasyonu (reduced-motion güvenli) */
@keyframes adm-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.adm-rise { animation: adm-rise 0.3s ease both; }
@media (prefers-reduced-motion: reduce) { .adm-rise { animation: none; } }

/* Detay/accordion (native <details>) */
.adm-section > summary { list-style: none; cursor: pointer; }
.adm-section > summary::-webkit-details-marker { display: none; }
.adm-section[open] > summary .adm-chev { transform: rotate(180deg); }
.adm-chev { transition: transform 0.2s ease; }
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: tsc sessiz; build başarılı, tüm admin rotaları derlenir.

- [ ] **Step 3: Commit**

```bash
git add app/admin/admin.css
git commit -m "feat(admin): tasarım sistemi yeniden yazımı — nötr palet, tek sans, ince çizgiler

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Menü yapılandırması — Site Editörü, Özel Sayfalar, AI'nin menüden çıkışı

**Files:**
- Modify: `components/admin/nav-config.tsx` (tam içerik değişimi)

**Interfaces:**
- Produces: `NAV_GROUPS` (4 grup: Sitem / Gelen Kutusu / Satış & Para / Yönetim — "Yardımcı" grubu ve `/admin/ai` linki KALKAR), `HOME_ITEM`, `MOBILE_TABS` (değişmez). Task 3'teki `TopBar` `NAV_GROUPS`+`HOME_ITEM`'ı başlık eşlemesi için kullanır.
- Consumes: `IconName` (`./icons`, değişmez).

- [ ] **Step 1: Dosyayı aşağıdaki içerikle değiştir**

```tsx
import type { IconName } from "./icons";

export type NavItem = { href: string; label: string; icon: IconName };
export type NavGroup = { label: string; items: NavItem[] };

/** 4 anlaşılır kova. AI menüde değil — üst bardaki buton (TopBar) açar. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Sitem",
    items: [
      { href: "/admin/content", label: "Site Editörü", icon: "content" },
      { href: "/admin/tours", label: "Turlar", icon: "map" },
      { href: "/admin/media", label: "Görseller", icon: "image" },
      { href: "/admin/pages", label: "Özel Sayfalar", icon: "pages" },
    ],
  },
  {
    label: "Gelen Kutusu",
    items: [
      { href: "/admin/leads", label: "Talepler", icon: "inbox" },
      { href: "/admin/booking", label: "Rezervasyonlar", icon: "calendar" },
      { href: "/admin/conversations", label: "Sohbetler", icon: "chat" },
    ],
  },
  {
    label: "Satış & Para",
    items: [
      { href: "/admin/sales", label: "Satış Defteri", icon: "wallet" },
      { href: "/admin/invoices", label: "Faturalar", icon: "invoice" },
      { href: "/admin/promos", label: "İndirim Kodları", icon: "tag" },
      { href: "/admin/payments", label: "Ödeme Yöntemleri", icon: "card" },
    ],
  },
  {
    label: "Yönetim",
    items: [
      { href: "/admin/settings", label: "Ayarlar", icon: "settings" },
      { href: "/admin/users", label: "Kullanıcılar", icon: "users" },
      { href: "/admin/audit", label: "Kayıtlar", icon: "log" },
    ],
  },
];

/** Panel her zaman en üstte, gruba dahil değil. */
export const HOME_ITEM: NavItem = { href: "/admin", label: "Panel", icon: "panel" };

/** Mobil alt sekme çubuğu: 4 ana hedef + "Daha fazla". */
export const MOBILE_TABS: { href: string; label: string; icon: IconName; badgeKey?: "inbox" }[] = [
  { href: "/admin", label: "Panel", icon: "panel" },
  { href: "/admin/content", label: "Sitem", icon: "content" },
  { href: "/admin/leads", label: "Gelen", icon: "inbox", badgeKey: "inbox" },
  { href: "/admin/sales", label: "Satış", icon: "wallet" },
];
```

- [ ] **Step 2: `/admin/ai` sayfasının menü dışından erişilebilir kaldığını doğrula**

Run: `ls app/admin/ai/page.tsx`
Expected: dosya var (rota yaşıyor; TopBar Task 3'te ona bağlanacak).

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: temiz. (`NAV_GROUPS` tüketicileri — sidebar-nav, mobile-nav — yapıyı değil yalnız veriyi okuyor, kırılmaz.)

- [ ] **Step 4: Commit**

```bash
git add components/admin/nav-config.tsx
git commit -m "feat(admin): menü sadeleşmesi — Site Editörü, Özel Sayfalar, AI üst bara taşınıyor

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: TopBar bileşeni + kabuk (layout.tsx) + Onest fontu

**Files:**
- Create: `components/admin/top-bar.tsx`
- Modify: `app/admin/layout.tsx` (tam içerik değişimi)

**Interfaces:**
- Consumes: `NAV_GROUPS`, `HOME_ITEM` (Task 2), `.adm-topbar`/`.adm-btn-ai` CSS (Task 1), `Icon` (`./icons`).
- Produces: `TopBar({ siteUrl: string })` client bileşeni — pathname'den sayfa başlığı türetir; sağda "Siteyi Gör" + `/admin/ai`'ye giden "AI Asistan" butonu. Faz 5 bu butonu yan panel tetikleyicisine çevirecek.

- [ ] **Step 1: `components/admin/top-bar.tsx` oluştur**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { NAV_GROUPS, HOME_ITEM } from "./nav-config";

const ALL_ITEMS = [HOME_ITEM, ...NAV_GROUPS.flatMap((g) => g.items)];

/** En uzun eşleşen href'in etiketi (ör. /admin/tours/r2 → "Turlar"). */
function titleFor(pathname: string): string {
  let bestLen = 0;
  let title = "Yönetim";
  for (const item of ALL_ITEMS) {
    const match =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname === item.href || pathname.startsWith(item.href + "/");
    if (match && item.href.length > bestLen) {
      bestLen = item.href.length;
      title = item.label;
    }
  }
  return title;
}

/** Masaüstü üst barı: solda sayfa adı, sağda Siteyi Gör + AI Asistan. */
export function TopBar({ siteUrl }: { siteUrl: string }) {
  const pathname = usePathname() || "";
  return (
    <header className="adm-topbar">
      <span className="adm-topbar-title">{titleFor(pathname)}</span>
      <span className="ml-auto flex items-center gap-2">
        <a href={siteUrl} target="_blank" rel="noopener" className="adm-btn adm-btn-ghost adm-btn-sm">
          <Icon name="external" size={15} /> Siteyi Gör
        </a>
        <Link href="/admin/ai" className="adm-btn adm-btn-sm adm-btn-ai" title="AI Asistan">
          <Icon name="bolt" size={15} /> AI Asistan
        </Link>
      </span>
    </header>
  );
}
```

- [ ] **Step 2: `app/admin/layout.tsx`'i aşağıdaki içerikle değiştir**

Değişenler: Onest fontu (`--font-sans` admin'de ilk kez gerçekten yüklenir), açık kenar çubuğu (248px, `text-white` sınıfları kalktı), `TopBar` eklendi, "Siteyi Gör" kenar çubuğundan üst bara taşındı. Oturum/rozet mantığı, `COLLAPSE_SCRIPT`, `MobileNav`, `AdminAiFab` birebir korunur.

```tsx
import "../globals.css";
import "./admin.css";
import { Onest } from "next/font/google";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublicSettings } from "@/lib/settings";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { MobileNav } from "@/components/admin/mobile-nav";
import { AdminAiFab } from "@/components/admin/ai-fab";
import { CollapseToggle } from "@/components/admin/collapse-toggle";
import { TopBar } from "@/components/admin/top-bar";
import { Icon } from "@/components/admin/icons";
import { assistantAvailable } from "@/lib/ai/assistant";

const sans = Onest({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

// Kenar çubuğu daraltma durumunu boyamadan önce ayarla (titreme olmasın).
const COLLAPSE_SCRIPT = `try{if(localStorage.getItem('adm-collapsed')==='1')document.documentElement.setAttribute('data-adm-collapsed','1')}catch(e){}`;

export const metadata = { title: "Yönetim · Antalya Bridge", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Oturum koruması middleware'de; burada yalnızca chrome + rozet verisi.
  const session = await getSession();

  let inboxCount = 0;
  let siteUrl = "/";
  let aiAvailable = false;
  if (session) {
    try {
      [inboxCount, siteUrl, aiAvailable] = await Promise.all([
        prisma.lead.count({ where: { status: "NEW" } }),
        getPublicSettings().then((s) => s.url || "/"),
        assistantAvailable().catch(() => false),
      ]);
    } catch {
      /* DB yoksa (build) sessizce varsayılan */
    }
  }

  return (
    <html lang="tr" className={sans.variable}>
      <body className="adm-body min-h-screen antialiased">
        {session ? <script dangerouslySetInnerHTML={{ __html: COLLAPSE_SCRIPT }} /> : null}
        {session ? (
          <div>
            {/* Masaüstü: açık renkli kenar çubuğu (daraltılabilir) */}
            <aside className="adm-sidebar adm-sidebar-scroll fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col overflow-y-auto p-4 lg:flex">
              <div className="adm-brandrow mb-5 flex items-center justify-between gap-2">
                <span className="adm-brand flex items-center gap-2 text-[15px] font-semibold">
                  <span>🌊</span> <span className="adm-side-text">Antalya Bridge</span>
                </span>
                <CollapseToggle />
              </div>
              <SidebarNav inboxCount={inboxCount} />
              <form action="/api/admin/logout" method="post" className="mt-auto pt-4" style={{ borderTop: "1px solid rgb(var(--border))" }}>
                <button className="adm-side-btn" type="submit" title="Çıkış yap">
                  <Icon name="logout" size={18} /> <span className="adm-side-text">Çıkış yap</span>
                </button>
              </form>
            </aside>

            {/* Mobil: üst bar */}
            <header
              className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden"
              style={{ background: "rgb(var(--card) / 0.92)", backdropFilter: "blur(10px)", borderColor: "rgb(var(--border))" }}
            >
              <span className="adm-brand text-[15px] font-semibold" style={{ color: "rgb(var(--foreground))" }}>🌊 Antalya Bridge</span>
              <a href={siteUrl} target="_blank" rel="noopener" className="adm-btn adm-btn-ghost adm-btn-sm">
                <Icon name="external" size={16} /> Site
              </a>
            </header>

            {/* İçerik */}
            <div className="adm-main-wrap lg:pl-[248px]">
              <TopBar siteUrl={siteUrl} />
              <main className="mx-auto max-w-[1560px] px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-8 lg:pb-12">{children}</main>
            </div>

            <MobileNav inboxCount={inboxCount} siteUrl={siteUrl} />
            <AdminAiFab available={aiAvailable} />
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: temiz. Not: eski genişlik 264px'ti; yeni 248px hem `w-[248px]` hem `lg:pl-[248px]`te tutarlı, daraltılmış hâl (72px) Task 1 CSS'iyle eşleşir.

- [ ] **Step 4: Commit**

```bash
git add components/admin/top-bar.tsx app/admin/layout.tsx
git commit -m "feat(admin): açık kenar çubuğu + üst bar (Siteyi Gör, AI) + Onest fontu

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Mobil drawer'ın açık temaya uyumu

**Files:**
- Modify: `components/admin/mobile-nav.tsx` (tam içerik değişimi)

**Interfaces:**
- Consumes: `NAV_GROUPS`, `HOME_ITEM`, `MOBILE_TABS` (Task 2), `.adm-sidebar` artık açık tema (Task 1).
- Produces: aynı `MobileNav({ inboxCount, siteUrl })` API'si — değişmez.

- [ ] **Step 1: Dosyayı aşağıdaki içerikle değiştir**

Değişenler yalnız görsel: drawer artık açık zemin olduğundan `text-white` ve `border-white/10` kaldırıldı (açık zeminde görünmez/yanlış olurdu). Davranış birebir aynı.

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { NAV_GROUPS, HOME_ITEM, MOBILE_TABS } from "./nav-config";

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

/**
 * Mobil gezinme: alt sabit sekme çubuğu (4 hedef + "Daha fazla") + tam boy drawer.
 * Hamburger-yalnız yerine alt sekme → telefonda tek başparmakla erişim.
 */
export function MobileNav({ inboxCount = 0, siteUrl = "/" }: { inboxCount?: number; siteUrl?: string }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Alt sekme çubuğu */}
      <div className="adm-bottomnav fixed inset-x-0 bottom-0 z-40 flex lg:hidden">
        {MOBILE_TABS.map((t) => (
          <Link key={t.href} href={t.href} className="adm-tab" data-active={isActive(pathname, t.href)}>
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
            {t.badgeKey === "inbox" && inboxCount > 0 ? <span className="adm-tab-dot">{inboxCount > 9 ? "9+" : inboxCount}</span> : null}
          </Link>
        ))}
        <button type="button" onClick={() => setOpen(true)} className="adm-tab" aria-label="Daha fazla">
          <Icon name="menu" size={22} />
          <span>Daha fazla</span>
        </button>
      </div>

      {/* Drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Kapat" onClick={() => setOpen(false)} className="absolute inset-0" style={{ background: "rgb(26 32 38 / 0.45)" }} />
          <div className="adm-sidebar adm-sidebar-scroll absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="adm-brand text-[15px] font-semibold">🌊 Antalya Bridge</span>
              <button type="button" onClick={() => setOpen(false)} className="adm-side-btn" style={{ width: "auto", padding: 8 }} aria-label="Kapat">✕</button>
            </div>

            <a href={siteUrl} target="_blank" rel="noopener" className="adm-side-btn adm-side-cta mb-4">
              <Icon name="external" size={18} /> Siteyi Gör
            </a>

            <div className="space-y-5" onClick={() => setOpen(false)}>
              <Link href={HOME_ITEM.href} className="adm-nav-item" data-active={isActive(pathname, HOME_ITEM.href)}>
                <Icon name={HOME_ITEM.icon} size={19} /> <span>{HOME_ITEM.label}</span>
              </Link>
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="adm-group-label mb-1.5 px-3">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const badge = item.href === "/admin/leads" && inboxCount > 0 ? inboxCount : 0;
                      return (
                        <Link key={item.href} href={item.href} className="adm-nav-item" data-active={isActive(pathname, item.href)}>
                          <Icon name={item.icon} size={19} /> <span>{item.label}</span>
                          {badge ? <span className="adm-nav-badge">{badge > 99 ? "99+" : badge}</span> : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <form action="/api/admin/logout" method="post" className="mt-6 pt-4" style={{ borderTop: "1px solid rgb(var(--border))" }}>
              <button className="adm-side-btn" type="submit"><Icon name="logout" size={18} /> Çıkış yap</button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
```

- [ ] **Step 2: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: temiz.

- [ ] **Step 3: Commit**

```bash
git add components/admin/mobile-nav.tsx
git commit -m "fix(admin): mobil drawer açık temaya uyarlandı

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Görsel doğrulama turu (dev sunucusu)

**Files:**
- (kod değişikliği beklenmez; bulgu çıkarsa küçük CSS düzeltmeleri `app/admin/admin.css`)

**Interfaces:**
- Consumes: Task 1–4'ün tamamı.

- [ ] **Step 1: Dev sunucusunu başlat ve giriş yap**

Run: `npm run dev` (arka planda) → tarayıcıda `http://localhost:3000/admin`
Expected: giriş ekranı gelir; mevcut admin hesabıyla girilir. (Giriş bilgisi yoksa kullanıcıya sor — DB'de seed'li hesap var.)

- [ ] **Step 2: Masaüstü kontrol listesi (1280px+)**

- Sol menü AÇIK zemin, 4 grup: Sitem / Gelen Kutusu / Satış & Para / Yönetim; "Yardımcı" yok.
- "Site Editörü" ve "Özel Sayfalar" etiketleri görünür; aktif sayfa turkuaz tonlu.
- Üst bar sabit: solda sayfa adı (sayfa değişince değişir), sağda "Siteyi Gör" + "AI Asistan" (tıklayınca `/admin/ai` açılır).
- Daralt butonu çalışır (72px ikon modu), yenileyince hatırlanır (localStorage).
- Başlıklar SANS (serif kalmadı); butonlarda gradyan/gölge yok; kartlar ince çizgili beyaz.
- `/admin/leads` rozeti (varsa) turkuaz.

- [ ] **Step 3: Mobil kontrol listesi (390px viewport)**

- Alt sekme çubuğu: Panel · Sitem · Gelen · Satış · Daha fazla; aktif turkuaz.
- "Daha fazla" → drawer AÇIK zeminli, okunur; grup başlıkları ve çıkış çizgisi görünür.
- Üst mobil bar beyaz, "Site" butonu çalışır.
- Sağ altta AI balonu hâlâ duruyor (Faz 5'e kadar bilinçli).

- [ ] **Step 4: Bulgular varsa düzelt, tekrar kontrol et, commit**

```bash
git add -A
git commit -m "fix(admin): faz 1 görsel doğrulama düzeltmeleri

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
(Bulgu yoksa bu commit atlanır.)
