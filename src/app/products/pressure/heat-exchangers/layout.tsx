import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/pressure/heat-exchangers");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
