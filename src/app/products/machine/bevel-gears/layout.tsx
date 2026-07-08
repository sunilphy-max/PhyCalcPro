import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/machine/bevel-gears");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
