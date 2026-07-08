import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/** Routes with no search value that should not consume crawl budget. */
export const DISALLOWED_ROUTES = [
  "/account",
  "/billing/",
  "/projects",
  "/copilot",
  "/api/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: DISALLOWED_ROUTES,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
