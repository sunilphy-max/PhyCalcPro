import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/power-transmission/roller-chains");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
