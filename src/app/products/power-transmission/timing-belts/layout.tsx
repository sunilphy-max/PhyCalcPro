import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/power-transmission/timing-belts");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
