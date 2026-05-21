"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segments = useSelectedLayoutSegments();
  const showSidebar = segments.length === 0;

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}

      {/* Main content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>
    </div>
  );
}