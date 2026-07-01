import "../globals.css";
import "./admin.css";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublicSettings } from "@/lib/settings";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { MobileNav } from "@/components/admin/mobile-nav";
import { AdminAiFab } from "@/components/admin/ai-fab";
import { CollapseToggle } from "@/components/admin/collapse-toggle";
import { Icon } from "@/components/admin/icons";
import { assistantAvailable } from "@/lib/ai/assistant";

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
    <html lang="tr">
      <body className="adm-body min-h-screen antialiased">
        {session ? <script dangerouslySetInnerHTML={{ __html: COLLAPSE_SCRIPT }} /> : null}
        {session ? (
          <div>
            {/* Masaüstü: sabit koyu-deniz kenar çubuğu (daraltılabilir) */}
            <aside className="adm-sidebar adm-sidebar-scroll fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col overflow-y-auto p-5 lg:flex">
              <div className="adm-brand mb-6 flex items-center gap-2 text-[1.35rem] font-semibold text-white">
                <span>🌊</span> <span className="adm-side-text">Antalya Bridge</span>
              </div>
              <a href={siteUrl} target="_blank" rel="noopener" className="adm-side-btn adm-side-cta mb-5" title="Siteyi Gör">
                <Icon name="external" size={18} /> <span className="adm-side-text">Siteyi Gör</span>
              </a>
              <SidebarNav inboxCount={inboxCount} />
              <div className="mt-auto border-t border-white/10 pt-4">
                <CollapseToggle />
                <form action="/api/admin/logout" method="post">
                  <button className="adm-side-btn" type="submit" title="Çıkış yap">
                    <Icon name="logout" size={18} /> <span className="adm-side-text">Çıkış yap</span>
                  </button>
                </form>
              </div>
            </aside>

            {/* Mobil: üst bar */}
            <header
              className="sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 lg:hidden"
              style={{ background: "rgb(var(--card) / 0.92)", backdropFilter: "blur(10px)", borderColor: "rgb(var(--border))" }}
            >
              <span className="adm-brand text-[1.2rem] font-semibold" style={{ color: "rgb(var(--foreground))" }}>🌊 Antalya Bridge</span>
              <a href={siteUrl} target="_blank" rel="noopener" className="adm-btn adm-btn-ghost adm-btn-sm">
                <Icon name="external" size={16} /> Site
              </a>
            </header>

            {/* İçerik */}
            <div className="adm-main-wrap lg:pl-[264px]">
              <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-10 lg:pb-12">{children}</main>
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
