import Sidebar from "@/components/Sidebar";

export default function MachineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Scoped sidebar (ONLY machine design tools) */}
      <Sidebar activeCategoryId="machine" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>

    </div>
  );
}