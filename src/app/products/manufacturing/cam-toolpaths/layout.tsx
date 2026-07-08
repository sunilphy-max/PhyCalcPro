import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/manufacturing/cam-toolpaths");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
