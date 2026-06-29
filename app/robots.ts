import type { MetadataRoute } from "next";
import { getPublicSettings } from "@/lib/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { url } = await getPublicSettings();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${url}/sitemap.xml`,
  };
}
