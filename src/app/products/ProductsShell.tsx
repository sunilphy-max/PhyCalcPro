"use client";

import Sidebar from "@/components/Sidebar";
import { DesignCodeProvider } from "@/contexts/DesignCodeContext";

export default function ProductsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesignCodeProvider>
      <div className="products-shell flex w-full min-w-0 flex-col items-stretch">
        <Sidebar />
        <div className="products-module-main min-w-0 flex-1 overflow-x-clip">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
