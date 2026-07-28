import { moduleMetadata } from "@/lib/seo/moduleMetadata";
import { moduleJsonLd } from "@/lib/seo/moduleJsonLd";
import JsonLd from "@/components/seo/JsonLd";
import ModuleSupportingContent from "@/components/calculator/ModuleSupportingContent";
import { getModuleDoc } from "@/lib/documentation/loadReference";

const ROUTE = "/products/structural/beams";

export const metadata = moduleMetadata(ROUTE);

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const doc = getModuleDoc("beams");
  const jsonLd = moduleJsonLd(ROUTE, {
    seoTitle: doc?.frontmatter.seoTitle,
    seoDescription: doc?.frontmatter.seoDescription,
    keywords: doc?.frontmatter.keywords,
    faq: doc?.faq ?? [],
  });

  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
      <ModuleSupportingContent moduleId="beams" calculatorRoute={ROUTE} />
    </>
  );
}
