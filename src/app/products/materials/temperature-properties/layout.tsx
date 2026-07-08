import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/materials/temperature-properties");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
