"use client";

import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { NAV_GROUPS, HOME_ITEM } from "./nav-config";
import { useAiPanel } from "./ai-panel-context";

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
  const { open } = useAiPanel();
  return (
    <header className="adm-topbar">
      <span className="adm-topbar-title">{titleFor(pathname)}</span>
      <span className="ml-auto flex items-center gap-2">
        <a href={siteUrl} target="_blank" rel="noopener" className="adm-btn adm-btn-ghost adm-btn-sm">
          <Icon name="external" size={15} /> Siteyi Gör
        </a>
        <button type="button" onClick={open} className="adm-btn adm-btn-sm adm-btn-ai" title="AI Asistan">
          <Icon name="bolt" size={15} /> AI Asistan
        </button>
      </span>
    </header>
  );
}
