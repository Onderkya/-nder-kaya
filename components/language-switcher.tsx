"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const change = (l: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: l });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="surface-muted inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:brightness-95"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          className="card absolute right-0 z-50 mt-2 w-44 overflow-hidden p-1"
          role="listbox"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => change(l)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:surface-muted ${
                  l === locale ? "font-semibold" : ""
                }`}
              >
                <span>{localeFlags[l]}</span>
                <span>{localeNames[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
