import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/advanced-systems/superconducting-systems");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
