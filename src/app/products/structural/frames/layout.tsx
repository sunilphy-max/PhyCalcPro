import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/structural/frames");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
