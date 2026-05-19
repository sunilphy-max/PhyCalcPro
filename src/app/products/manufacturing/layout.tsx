import Sidebar from "@/components/Sidebar";

export default function ManufacturingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Scoped sidebar (ONLY manufacturing tools) */}
      <Sidebar activeCategoryId="manufacturing" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>

    </div>
  );
}