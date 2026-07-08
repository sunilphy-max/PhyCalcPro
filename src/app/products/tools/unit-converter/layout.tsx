import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/tools/unit-converter");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
