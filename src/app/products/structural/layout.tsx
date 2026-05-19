import Sidebar from "@/components/Sidebar";

export const __isModule = true;

export default function StructuralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      
      {/* Scoped sidebar (ONLY structural tools) */}
      <Sidebar activeCategoryId="structural" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>

    </div>
  );
}