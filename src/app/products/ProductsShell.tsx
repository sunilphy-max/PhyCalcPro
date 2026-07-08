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
      {/* Stack on narrow viewports; minmax(0,1fr) keeps charts from spilling over the sidebar. */}
      <div className="products-shell grid w-full min-w-0 grid-cols-1 items-start lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Sidebar />
        <div className="products-module-main min-w-0 overflow-x-clip">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
