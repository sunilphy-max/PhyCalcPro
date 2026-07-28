import { notFound } from "next/navigation";
import MaterialDatasheetPage from "@/components/materials/MaterialDatasheetPage";
import { getMaterialPage, listMaterialIds } from "@/lib/materials/materialPage";
import { buildPageMetadata } from "@/lib/seo/site";
import { materialCategoryLabels } from "@/data/materials";
import JsonLd from "@/components/seo/JsonLd";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return listMaterialIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const page = getMaterialPage(id);
  if (!page) {
    return buildPageMetadata({
      title: "Material not found",
      description: "Material grade not found in the PhyCalcPro catalog.",
      path: `/products/materials/database/${id}`,
      robots: { index: false, follow: true },
    });
  }
  const { material } = page;
  const family = materialCategoryLabels[material.category];
  const description =
    page.summary ??
    `${material.name} (${family}) — E, yield, density, and related engineering properties for PhyCalcPro calculators.`;
  return buildPageMetadata({
    title: { absolute: `${material.name} Material Datasheet — PhyCalcPro` },
    description: description.slice(0, 160),
    path: `/products/materials/database/${material.id}`,
  });
}

export default async function MaterialGradePage({ params }: Props) {
  const { id } = await params;
  const page = getMaterialPage(decodeURIComponent(id));
  if (!page) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${page.material.name} material datasheet`,
    description: page.summary ?? page.material.name,
    about: page.material.name,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <MaterialDatasheetPage page={page} />
    </>
  );
}
