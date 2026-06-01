import { categories } from "@/data/modules";

/**
 * 🧭 SIDEBAR BUILDER
 * Converts module registry into navigation structure
 */

export function getSidebarNavigation() {
  return categories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    modules: category.modules.map((module) => ({
      id: module.id,
      title: module.title,
      route: module.route,
      comingSoon: module.comingSoon,
    })),
  }));
}
export function getFlatNavigation() {
  return categories.flatMap((cat) =>
    cat.modules.map((mod) => ({
      ...mod,
      category: cat.title,
    }))
  );
}