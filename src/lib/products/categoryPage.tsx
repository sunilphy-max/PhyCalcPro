import { notFound } from "next/navigation";
import CategoryLanding from "@/components/products/CategoryLanding";
import { getCategoryById } from "@/data/modules";
import { categoryMetadata } from "@/lib/seo/moduleMetadata";

/** Shared category landing page factory for `/products/{categoryId}`. */
export function categoryPageExports(categoryId: string) {
  return {
    metadata: categoryMetadata(categoryId),
    Page() {
      if (!getCategoryById(categoryId)) notFound();
      // Pass only a string — Lucide icons on the category object are not serializable
      // from Server Components into Client Components.
      return <CategoryLanding categoryId={categoryId} />;
    },
  };
}
