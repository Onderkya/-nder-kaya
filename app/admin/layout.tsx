import "../globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Admin · Antalya Bridge", robots: { index: false } };

const navItems = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/content", label: "Site İçeriği" },
  { href: "/admin/media", label: "Medya" },
  { href: "/admin/leads", label: "Talepler" },
  { href: "/admin/booking", label: "Rezervasyon" },
  { href: "/admin/conversations", label: "Sohbetler" },
  { href: "/admin/promos", label: "İndirim Kodları" },
  { href: "/admin/payments", label: "Ödeme Yöntemleri" },
  { href: "/admin/ai", label: "AI Asistan" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Oturum koruması middleware'de yapılır; burada yalnızca chrome seçilir.
  // Oturum varsa kenar çubuğu, yoksa (login) sade düzen gösterilir.
  const session = await getSession();

  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-100 text-slate-900">
        {session ? (
          <div className="flex min-h-screen">
            <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-4">
              <div className="mb-6 flex items-center gap-2 font-bold">
                <span>🌊</span> <span>Antalya Bridge</span>
              </div>
              <nav className="space-y-1">
                {navItems.map((i) => (
                  <Link key={i.href} href={i.href} className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100">
                    {i.label}
                  </Link>
                ))}
              </nav>
              <form action="/api/admin/logout" method="post" className="mt-6">
                <button className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  Çıkış yap
                </button>
              </form>
            </aside>
            <main className="flex-1 p-8">{children}</main>
          </div>
        ) : (
          <main>{children}</main>
        )}
      </body>
    </html>
  );
}
