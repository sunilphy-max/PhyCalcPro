"use client";

import Sidebar from "@/components/Sidebar";
import { DesignCodeProvider } from "@/contexts/DesignCodeContext";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesignCodeProvider>
      {/* Grid columns + minmax(0,1fr) keep wide charts from spilling over the sidebar. */}
      <div className="products-shell grid w-full min-w-0 grid-cols-[18rem_minmax(0,1fr)] items-start">
        <Sidebar />
        <div className="products-module-main min-w-0">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
