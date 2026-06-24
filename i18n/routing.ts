import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const locales = ["tr", "en", "ru", "kk"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ru: "Русский",
  kk: "Қазақша",
  // uz: "Oʻzbekcha",
};

export const localeFlags: Record<Locale, string> = {
  tr: "🇹🇷",
  en: "🇬🇧",
  ru: "🇷🇺",
  kk: "🇰🇿",
  // uz: "🇺🇿",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "always",
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
