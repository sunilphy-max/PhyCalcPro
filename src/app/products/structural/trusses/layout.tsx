import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/structural/trusses");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
