import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/advanced-systems/cryogenic-engineering");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
