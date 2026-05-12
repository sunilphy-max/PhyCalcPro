import { searchIndex } from "@/data/searchIndex";

export function searchModules(query: string) {
  const q = query.toLowerCase().trim();

  if (!q) return [];

  return searchIndex
    .filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    })
    .slice(0, 10); // limit results
}