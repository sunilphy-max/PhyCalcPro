import JsonLd from "@/components/seo/JsonLd";
import { moduleMetadata } from "@/lib/seo/moduleMetadata";
import { moduleJsonLd } from "@/lib/seo/moduleJsonLd";

export const metadata = moduleMetadata("/products/bearings/designer");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={moduleJsonLd("/products/bearings/designer")} />
      {children}
    </>
  );
}
