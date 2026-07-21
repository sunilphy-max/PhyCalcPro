"use client";

import ProductsCategoryBar from "@/components/ProductsCategoryBar";
import { DesignCodeProvider } from "@/contexts/DesignCodeContext";

export default function ProductsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesignCodeProvider>
      <div className="products-shell flex w-full min-w-0 flex-col items-stretch">
        <ProductsCategoryBar />
        <div className="products-module-main min-w-0 flex-1 overflow-x-clip">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
