import Sidebar from "@/components/Sidebar";

export default function ProfilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Scoped sidebar (ONLY profiles tools) */}
      <Sidebar activeCategoryId="profiles" />

      {/* Page content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>

    </div>
  );
}