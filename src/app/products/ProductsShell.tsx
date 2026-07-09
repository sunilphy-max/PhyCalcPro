"use client";

import Sidebar from "@/components/Sidebar";
import { DesignCodeProvider } from "@/contexts/DesignCodeContext";
import { useProductsSidebarCollapsed } from "@/hooks/useProductsSidebarCollapsed";

export default function ProductsShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { collapsed, toggle, hydrated } = useProductsSidebarCollapsed();

  return (
    <DesignCodeProvider>
      <div
        className={`products-shell flex w-full min-w-0 flex-col items-stretch lg:flex-row lg:items-start ${
          hydrated ? "products-shell--hydrated" : ""
        } ${collapsed ? "products-shell--collapsed" : "products-shell--expanded"}`}
      >
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <div className="products-module-main min-w-0 flex-1 overflow-x-clip">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
