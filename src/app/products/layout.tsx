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
      <div className="flex w-full min-w-0 items-start">
        <Sidebar />
        <div className="relative z-0 min-w-0 flex-1 overflow-x-clip bg-slate-50">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
