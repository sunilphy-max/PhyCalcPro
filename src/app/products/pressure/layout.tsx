import Sidebar from "@/components/Sidebar";

export default function PressureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Scoped sidebar (ONLY pressure tools) */}
      <Sidebar activeCategoryId="pressure" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>
    </div>
  );
}