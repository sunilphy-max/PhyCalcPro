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
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full min-w-0">
        <Sidebar />

        {/* min-w-0 prevents wide module content from overflowing onto the sidebar */}
        <div className="relative min-w-0 flex-1 bg-slate-50">
          <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-64 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.08),_transparent_60%)] md:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-72 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.06),_transparent_60%)] md:block" />
          <div className="relative min-h-full">{children}</div>
        </div>
      </div>
    </DesignCodeProvider>
  );
}
