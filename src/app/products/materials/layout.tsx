import Sidebar from "@/components/Sidebar";

export default function MaterialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Scoped sidebar (ONLY materials tools) */}
      <Sidebar activeCategoryId="materials" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>

    </div>
  );
}