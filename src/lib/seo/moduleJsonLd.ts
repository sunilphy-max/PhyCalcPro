import { categories, getModuleByRoute } from "@/data/modules";
import { SITE_NAME, SITE_URL } from "./site";
import type { FaqItem } from "@/lib/documentation/parseFrontmatter";

export type ModuleJsonLdOptions = {
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
  faq?: FaqItem[];
};

/**
 * Structured data for a calculator route: BreadcrumbList, SoftwareApplication,
 * and optional FAQPage when module guide FAQs are provided.
 */
export function moduleJsonLd(
  route: string,
  options: ModuleJsonLdOptions = {}
): Record<string, unknown>[] {
  const mod = getModuleByRoute(route);
  if (!mod) return [];

  const category = categories.find((c) => c.id === mod.category);
  const url = `${SITE_URL}${route}`;
  const name = options.seoTitle ?? `${mod.title} Calculator`;
  const description =
    options.seoDescription ??
    `${mod.description}. Professional ${mod.title.toLowerCase()} with document-ready results, design-code checks, and engineering plots.`;

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

  const software: Record<string, unknown> = {
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

  if (options.keywords?.length) {
    software.keywords = options.keywords.join(", ");
  }

  const schemas: Record<string, unknown>[] = [breadcrumb, software];

  if (options.faq && options.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: options.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return schemas;
}
