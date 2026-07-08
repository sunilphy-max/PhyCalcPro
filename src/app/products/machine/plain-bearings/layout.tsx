import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/machine/plain-bearings");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
