import { moduleMetadata } from "@/lib/seo/moduleMetadata";

/** Keep metadata for crawlers that still hit /selection before redirect. */
export const metadata = moduleMetadata("/products/bearings/designer");

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
