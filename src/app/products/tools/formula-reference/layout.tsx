import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/tools/formula-reference");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
