import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";

const paths = ["", "/antalya", "/lessons", "/education", "/about", "/faq", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const p of paths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteConfig.url}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: p === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteConfig.url}/${l}${p}`])
          ),
        },
      });
    }
  }
  return entries;
}
