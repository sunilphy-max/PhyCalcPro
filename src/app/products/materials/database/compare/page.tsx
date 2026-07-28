import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo/site";
import MaterialCompareClient from "./MaterialCompareClient";

export const metadata = buildPageMetadata({
  title: "Compare Materials",
  description:
    "Compare engineering material grades side-by-side — strength, density, specific properties, applications, and advantages.",
  path: "/products/materials/database/compare",
});

export default function MaterialComparePage() {
  return (
    <Suspense fallback={null}>
      <MaterialCompareClient />
    </Suspense>
  );
}
