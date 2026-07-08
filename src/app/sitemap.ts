import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { collectSitemapRoutes, sitemapEntryForRoute } from "@/lib/seo/sitemapRoutes";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return collectSitemapRoutes().map((route) => {
    const entry = sitemapEntryForRoute(route, lastModified);
    return {
      url: route === "/" ? SITE_URL : `${SITE_URL}${route}`,
      lastModified: entry.lastModified,
      changeFrequency: entry.changeFrequency,
      priority: entry.priority,
    };
  });
}
