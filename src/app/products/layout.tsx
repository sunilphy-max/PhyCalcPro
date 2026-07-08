import ProductsShell from "./ProductsShell";
import { productsIndexMetadata } from "@/lib/seo/moduleMetadata";

export const metadata = productsIndexMetadata();

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProductsShell>{children}</ProductsShell>;
}
