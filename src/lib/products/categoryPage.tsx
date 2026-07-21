import { notFound } from "next/navigation";
import CategoryLanding from "@/components/products/CategoryLanding";
import { getCategoryById } from "@/data/modules";
import { categoryMetadata } from "@/lib/seo/moduleMetadata";

/** Shared category landing page factory for `/products/{categoryId}`. */
export function categoryPageExports(categoryId: string) {
  return {
    metadata: categoryMetadata(categoryId),
    Page() {
      const category = getCategoryById(categoryId);
      if (!category) notFound();
      return <CategoryLanding category={category} />;
    },
  };
}
