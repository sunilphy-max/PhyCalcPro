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
      {/* Grid keeps sidebar and module content in separate columns — no flex overlap. */}
      <div className="products-shell grid w-full min-w-0 grid-cols-[18rem_minmax(0,1fr)]">
        <Sidebar />
        <div className="products-module-main min-w-0">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
