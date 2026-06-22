"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hero üzerinde şeffaf (beyaz yazı); sayfa kayınca cam zemin + tema rengi.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/", label: t("home") },
    { href: "/antalya", label: t("antalya") },
    { href: "/lessons", label: t("lessons") },
    { href: "/education", label: t("education") },
    { href: "/about", label: t("about") },
    { href: "/faq", label: t("faq") },
    { href: "/contact", label: t("contact") },
  ];

  const solid = scrolled || open;

  return (
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        solid ? "glass border-b shadow-sm" : "border-b border-transparent"
      }`}
      style={solid ? { borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--background) / 0.82)" } : undefined}
    >
      <div className="container-wide flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Antalya Bridge"
          className={`transition ${solid ? "" : "text-white drop-shadow"} hover:opacity-90`}
        >
          <Logo on={solid ? "surface" : "hero"} />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  solid
                    ? active
                      ? "surface-muted"
                      : "hover:surface-muted"
                    : active
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:bg-white/10"
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
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full lg:hidden ${
              solid ? "surface-muted" : "bg-white/15 text-white"
            }`}
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
        <nav className="glass container-wide flex flex-col gap-1 pb-4 lg:hidden" style={{ backgroundColor: "rgb(var(--background) / 0.95)" }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium transition hover:surface-muted"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
