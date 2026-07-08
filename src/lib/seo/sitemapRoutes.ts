import { allModules } from "@/data/modules";
import { getAllModuleIdsForDocs } from "@/lib/documentation/loadReference";

const CATEGORY_IDS = new Set([
  "structural",
  "power-transmission",
  "machine",
  "springs",
  "fasteners",
  "materials",
  "pressure",
  "dynamics",
  "manufacturing",
  "advanced-systems",
  "tools",
]);

/**
 * Marketing and utility routes not covered by module catalog alone.
 * Low-value routes (account, billing, projects, copilot) are intentionally
 * excluded to focus crawl budget on indexable content.
 */
const STATIC_ROUTES = [
  "/",
  "/documentation",
  "/documentation/modules",
  "/documentation/reference",
  "/documentation/supabase",
  "/legal/privacy",
  "/legal/terms",
  "/pricing",
  "/products",
  "/status",
  "/support",
  "/trust",
] as const;

function priorityFor(route: string): number {
  if (route === "/") return 1.0;
  if (route === "/products") return 0.9;
  if (route.startsWith("/products/")) return 0.8;
  if (route.startsWith("/documentation/modules/")) return 0.6;
  if (route.startsWith("/documentation")) return 0.7;
  if (route.startsWith("/legal/")) return 0.4;
  if (route.startsWith("/billing/")) return 0.3;
  return 0.5;
}

function changeFrequencyFor(
  route: string
): "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" {
  if (route === "/" || route === "/products" || route === "/status") return "weekly";
  if (route.startsWith("/products/")) return "monthly";
  if (route.startsWith("/documentation")) return "monthly";
  if (route.startsWith("/legal/")) return "yearly";
  return "monthly";
}

export function collectSitemapRoutes(): string[] {
  const moduleRoutes = allModules
    .map((module) => module.route)
    .filter((route) => route.startsWith("/products/"));

  const docRoutes = getAllModuleIdsForDocs()
    .filter((id) => !CATEGORY_IDS.has(id))
    .map((id) => `/documentation/modules/${id}`);

  if (!docRoutes.includes("/documentation/modules/profiles")) {
    docRoutes.push("/documentation/modules/profiles");
  }

  return [...new Set([...STATIC_ROUTES, ...moduleRoutes, ...docRoutes])].sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });
}

export function sitemapEntryForRoute(route: string, lastModified = new Date()) {
  return {
    url: route === "/" ? undefined : route,
    lastModified,
    changeFrequency: changeFrequencyFor(route),
    priority: priorityFor(route),
  };
}
