import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/advanced-systems/precision-motion");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
