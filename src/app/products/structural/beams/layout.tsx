import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/structural/beams");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
