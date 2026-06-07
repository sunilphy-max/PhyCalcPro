import { allModules } from "./modules";

/**
 * 🧠 Flattened search index for fast lookup
 */
export const searchIndex = allModules.map((m) => ({
  id: m.id,
  title: m.title,
  description: m.description,
  route: m.route,
  category: m.category,
  comingSoon: m.comingSoon,
  keywords: [
    m.title.toLowerCase(),
    m.id.toLowerCase(),
    m.category.toLowerCase(),
  ],
}));