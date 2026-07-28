import JsonLd from "@/components/seo/JsonLd";
import { moduleMetadata } from "@/lib/seo/moduleMetadata";
import { moduleJsonLd } from "@/lib/seo/moduleJsonLd";

export function bearingToolLayout(route: string) {
  const metadata = moduleMetadata(route);
  function Layout({ children }: { children: React.ReactNode }) {
    return (
      <>
        <JsonLd data={moduleJsonLd(route)} />
        {children}
      </>
    );
  }
  return { metadata, Layout };
}
