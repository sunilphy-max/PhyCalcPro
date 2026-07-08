import { moduleMetadata } from "@/lib/seo/moduleMetadata";
import { moduleJsonLd } from "@/lib/seo/moduleJsonLd";
import JsonLd from "@/components/seo/JsonLd";

export const metadata = moduleMetadata("/products/advanced-systems/hydrogen-systems");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={moduleJsonLd("/products/advanced-systems/hydrogen-systems")} />
      {children}
    </>
  );
}
