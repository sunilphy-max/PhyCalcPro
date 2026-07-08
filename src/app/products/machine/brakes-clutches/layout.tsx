import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/machine/brakes-clutches");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
