import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/dynamics/impact");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
