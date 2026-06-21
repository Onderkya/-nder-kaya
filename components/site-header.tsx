"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/antalya", label: t("antalya") },
    { href: "/lessons", label: t("lessons") },
    { href: "/education", label: t("education") },
    { href: "/about", label: t("about") },
    { href: "/faq", label: t("faq") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="glass sticky top-0 z-40 border-b" style={{ borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--background) / 0.75)" }}>
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Antalya Bridge" className="transition hover:opacity-90">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition hover:surface-muted ${
                  active ? "surface-muted" : ""
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            type="button"
            className="surface-muted inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="container-page flex flex-col gap-1 pb-4 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium transition hover:surface-muted"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
