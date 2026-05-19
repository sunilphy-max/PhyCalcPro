import Sidebar from "@/components/Sidebar";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Full catalog sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 bg-slate-900">
        {children}
      </main>
    </div>
  );
}