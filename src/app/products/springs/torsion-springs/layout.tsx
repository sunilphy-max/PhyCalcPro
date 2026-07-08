import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/springs/torsion-springs");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
