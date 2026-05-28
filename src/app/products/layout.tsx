"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { DesignCodeProvider } from "@/contexts/DesignCodeContext";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segments = useSelectedLayoutSegments();
  const showSidebar = segments.length === 0;

  return (
    <DesignCodeProvider>
    <div className="flex min-h-screen bg-slate-50 text-slate-950">
      {showSidebar && <Sidebar />}

      <main className="flex-1 relative overflow-hidden bg-slate-50">
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-64 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.08),_transparent_60%)] md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-72 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.06),_transparent_60%)] md:block" />
        <div className="relative min-h-screen">{children}</div>
      </main>
    </div>
    </DesignCodeProvider>
  );
}
