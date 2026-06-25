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
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden bg-slate-50">{children}</div>
      </div>
    </DesignCodeProvider>
  );
}
