import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/materials/rolled-sections");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
