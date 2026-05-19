import Sidebar from "@/components/Sidebar";

export default function FastenersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Scoped sidebar (ONLY fasteners tools) */}
      <Sidebar activeCategoryId="fasteners" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>

    </div>
  );
}