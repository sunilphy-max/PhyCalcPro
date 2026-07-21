import { getCategoryById, getModuleByRoute } from "@/data/modules";
import { buildPageMetadata, defaultDescription, SITE_NAME } from "./site";

/**
 * Calculator layouts live below `products/layout`, so the root title template
 * does not reach them. Build an absolute (brand-complete) title instead.
 */
function absoluteTitle(name: string) {
  return `${name} — ${SITE_NAME}`;
}

export function moduleMetadata(route: string) {
  const mod = getModuleByRoute(route);
  const name = mod ? `${mod.title} Calculator` : "Engineering Calculator";
  const description = mod
    ? `${mod.description}. Professional ${mod.title.toLowerCase()} with document-ready results, design-code checks, and engineering plots.`
    : defaultDescription;

  return buildPageMetadata({
    title: { absolute: absoluteTitle(name) },
    description,
    path: route,
    robots: mod?.comingSoon ? { index: false, follow: true } : { index: true, follow: true },
  });
}

export function categoryMetadata(categoryId: string) {
  const category = getCategoryById(categoryId);
  const name = category ? category.title : "Engineering Category";
  const description = category
    ? `${category.description} Browse ${category.modules.length} engineering calculators in ${category.title}.`
    : defaultDescription;

  return buildPageMetadata({
    title: { absolute: absoluteTitle(name) },
    description,
    path: `/products/${categoryId}`,
  });
}

export function productsIndexMetadata() {
  return buildPageMetadata({
    title: { absolute: absoluteTitle("Engineering Calculators") },
    description:
      "Browse professional engineering calculators for structural analysis, machine design, power transmission, materials, pressure systems, and advanced engineering workflows.",
    path: "/products",
  });
}
