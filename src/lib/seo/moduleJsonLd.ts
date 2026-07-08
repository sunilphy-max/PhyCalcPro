import { categories, getModuleByRoute } from "@/data/modules";
import { SITE_NAME, SITE_URL } from "./site";

/**
 * Structured data for a calculator route: a BreadcrumbList and a
 * SoftwareApplication describing the individual tool.
 */
export function moduleJsonLd(route: string): Record<string, unknown>[] {
  const mod = getModuleByRoute(route);
  if (!mod) return [];

  const category = categories.find((c) => c.id === mod.category);
  const url = `${SITE_URL}${route}`;
  const name = `${mod.title} Calculator`;
  const description = `${mod.description}. Professional ${mod.title.toLowerCase()} with document-ready results, design-code checks, and engineering plots.`;

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Engineering Calculators",
      item: `${SITE_URL}/products`,
    },
  ];

  breadcrumbItems.push({
    "@type": "ListItem",
    position: breadcrumbItems.length + 1,
    name: category ? `${category.title} — ${name}` : name,
    item: url,
  });

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "EngineeringApplication",
    operatingSystem: "Web",
    url,
    description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return [breadcrumb, software];
}
