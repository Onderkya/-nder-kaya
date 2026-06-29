import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPublicSettings } from "@/lib/settings";

const paths = ["", "/antalya", "/lessons", "/education", "/about", "/faq", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { url: siteUrl } = await getPublicSettings();
  const entries: MetadataRoute.Sitemap = [];
  for (const p of paths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: p === "" ? 1 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteUrl}/${l}${p}`])
          ),
        },
      });
    }
  }
  return entries;
}
