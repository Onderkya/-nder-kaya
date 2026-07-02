import "../globals.css";
import "./admin.css";
import { Onest } from "next/font/google";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublicSettings } from "@/lib/settings";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { MobileNav } from "@/components/admin/mobile-nav";
import { AiPanelProvider } from "@/components/admin/ai-panel-context";
import { AiPanel, AiPanelMobileButton } from "@/components/admin/ai-panel";
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
          <AiPanelProvider available={aiAvailable}>
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
              <span className="flex items-center gap-2">
                <a href={siteUrl} target="_blank" rel="noopener" className="adm-btn adm-btn-ghost adm-btn-sm">
                  <Icon name="external" size={16} /> Site
                </a>
                <AiPanelMobileButton />
              </span>
            </header>

            {/* İçerik */}
            <div className="adm-main-wrap lg:pl-[248px]">
              <TopBar siteUrl={siteUrl} />
              <main className="mx-auto max-w-[1560px] px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-8 lg:pb-12">{children}</main>
            </div>

            <MobileNav inboxCount={inboxCount} siteUrl={siteUrl} />
            <AiPanel />
          </div>
          </AiPanelProvider>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
