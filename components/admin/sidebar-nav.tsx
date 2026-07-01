"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icons";
import { NAV_GROUPS, HOME_ITEM } from "./nav-config";

const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

/** Masaüstü kenar çubuğu nav listesi (gruplu, aktif durum vurgulu). */
export function SidebarNav({ inboxCount = 0 }: { inboxCount?: number }) {
  const pathname = usePathname() || "";
  return (
    <nav className="space-y-5">
      <Link href={HOME_ITEM.href} className="adm-nav-item" data-active={isActive(pathname, HOME_ITEM.href)} title={HOME_ITEM.label}>
        <Icon name={HOME_ITEM.icon} size={19} />
        <span className="adm-side-text">{HOME_ITEM.label}</span>
      </Link>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="adm-group-label adm-side-text mb-1.5 px-3">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const badge = item.href === "/admin/leads" && inboxCount > 0 ? inboxCount : 0;
              return (
                <Link key={item.href} href={item.href} className="adm-nav-item" data-active={active} title={item.label}>
                  <Icon name={item.icon} size={19} />
                  <span className="adm-side-text">{item.label}</span>
                  {badge ? <span className="adm-nav-badge">{badge > 99 ? "99+" : badge}</span> : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
