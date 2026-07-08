import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/structural/load-case-manager");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
