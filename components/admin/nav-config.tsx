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
