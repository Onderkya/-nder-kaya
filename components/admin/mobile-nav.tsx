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
          <button type="button" aria-label="Kapat" onClick={() => setOpen(false)} className="absolute inset-0" style={{ background: "rgb(7 26 33 / 0.55)" }} />
          <div className="adm-sidebar adm-sidebar-scroll absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="adm-brand text-xl font-semibold text-white">🌊 Antalya Bridge</span>
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

            <form action="/api/admin/logout" method="post" className="mt-6 border-t border-white/10 pt-4">
              <button className="adm-side-btn" type="submit"><Icon name="logout" size={18} /> Çıkış yap</button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
