import { getModuleByRoute } from "@/data/modules";
import { buildPageMetadata, defaultDescription } from "./site";

export function moduleMetadata(route: string) {
  const mod = getModuleByRoute(route);
  const title = mod ? `${mod.title} Calculator` : "Engineering Calculator";
  const description = mod
    ? `${mod.description}. Professional ${mod.title.toLowerCase()} with document-ready results, design-code checks, and engineering plots.`
    : defaultDescription;

  return buildPageMetadata({
    title,
    description,
    path: route,
    robots: mod?.comingSoon ? { index: false, follow: true } : { index: true, follow: true },
  });
}

export function productsIndexMetadata() {
  return buildPageMetadata({
    title: "Engineering Calculators",
    description:
      "Browse professional engineering calculators for structural analysis, machine design, power transmission, materials, pressure systems, and advanced engineering workflows.",
    path: "/products",
  });
}
