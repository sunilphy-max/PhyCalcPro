import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/machine/internal-gears-rack");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
