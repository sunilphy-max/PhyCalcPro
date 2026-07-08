import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/advanced-systems/thermal-management");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
