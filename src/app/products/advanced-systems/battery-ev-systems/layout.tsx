import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/advanced-systems/battery-ev-systems");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
