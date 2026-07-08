import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/fasteners/keys-splines");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
