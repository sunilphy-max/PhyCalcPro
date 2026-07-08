import { moduleMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = moduleMetadata("/products/fasteners/bolts");

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
