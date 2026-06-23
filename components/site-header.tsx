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

  // Mobil menü açıkken gövde kaymasını kilitle.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
    <>
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        solid && !open ? "glass border-b shadow-sm" : "border-b border-transparent"
      }`}
      style={solid && !open ? { borderColor: "rgb(var(--border))", backgroundColor: "rgb(var(--background) / 0.82)" } : undefined}
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

    </header>

    {/* Mobil tam-ekran menü — header DIŞINDA (backdrop-filter kapsayıcı-blok tuzağı yok) */}
    {open && (
      <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto lg:hidden" style={{ backgroundColor: "#06222c" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgb(var(--accent) / 0.18)" }} />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgb(var(--lagoon) / 0.16)" }} />

        <div className="container-wide relative flex h-16 shrink-0 items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)} aria-label="Antalya Bridge"><Logo on="hero" /></Link>
          <button type="button" onClick={() => setOpen(false)} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="container-wide relative flex flex-1 flex-col justify-center gap-1 py-8">
          {links.map((l, i) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="animate-fade-up group flex items-center gap-4 border-b py-4"
                style={{ animationDelay: `${i * 50}ms`, borderColor: "rgb(255 255 255 / 0.09)" }}
              >
                <span className="font-display w-7 text-sm tabular-nums" style={{ color: "rgb(var(--gold))" }}>0{i + 1}</span>
                <span className="font-display flex-1 font-semibold leading-none tracking-[-0.02em] transition-transform group-hover:translate-x-1.5" style={{ color: active ? "rgb(var(--accent2))" : "#fff", fontSize: "clamp(1.85rem, 8vw, 2.4rem)" }}>
                  {l.label}
                </span>
                {active && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "rgb(var(--accent2))" }} />}
              </Link>
            );
          })}
        </nav>

        <div className="container-wide relative flex shrink-0 items-center justify-between gap-3 pb-10 pt-2">
          <div className="flex items-center gap-2"><LanguageSwitcher /><ThemeToggle /></div>
          <Link href="/contact" onClick={() => setOpen(false)} className="btn-accent">{t("contact")}</Link>
        </div>
      </div>
    )}
    </>
  );
}
