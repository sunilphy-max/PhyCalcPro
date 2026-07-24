import { SITE_NAME, SITE_URL } from "@/lib/seo/site";
import type { FaqItem } from "@/lib/documentation/parseFrontmatter";

type DocumentationJsonLdOptions = {
  moduleId: string;
  title: string;
  description: string;
  calculatorRoute?: string;
  categoryTitle?: string;
  faq: FaqItem[];
  keywords?: string[];
};

export function documentationModuleJsonLd({
  moduleId,
  title,
  description,
  calculatorRoute,
  categoryTitle,
  faq,
  keywords,
}: DocumentationJsonLdOptions): Record<string, unknown>[] {
  const url = `${SITE_URL}/documentation/modules/${moduleId}`;

  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Documentation",
      item: `${SITE_URL}/documentation`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Modules",
      item: `${SITE_URL}/documentation/modules`,
    },
    {
      "@type": "ListItem",
      position: 4,
      name: title,
      item: url,
    },
  ];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  if (categoryTitle) {
    article.about = categoryTitle;
  }
  if (keywords?.length) {
    article.keywords = keywords.join(", ");
  }
  if (calculatorRoute) {
    article.significantLink = `${SITE_URL}${calculatorRoute}`;
  }

  const schemas: Record<string, unknown>[] = [breadcrumb, article];

  if (faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
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
