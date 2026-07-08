import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/machine/worm-gears");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
