import Sidebar from "@/components/Sidebar";

export default function DynamicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Scoped sidebar (ONLY dynamics tools) */}
      <Sidebar activeCategoryId="dynamics" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>

    </div>
  );
}