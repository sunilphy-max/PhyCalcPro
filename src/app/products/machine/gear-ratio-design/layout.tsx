import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/machine/gear-ratio-design");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
