import Link from "next/link";

export default function DashboardLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={layout}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <h2 style={logo}>PhyCalcPro</h2>

        <div style={sectionTitle}>Modules</div>

        <nav style={nav}>
          <Link href="/products/beams" style={link}>Beams</Link>
          <Link href="/products/shafts" style={link}>Shafts</Link>
          <Link href="/products/buckling" style={link}>Buckling</Link>
          <Link href="/products/materials" style={link}>Materials</Link>
        </nav>
      </aside>

      {/* Main */}
      <main style={main}>
        <div style={header}>
          <h1>{title}</h1>
        </div>

        <div style={content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const layout: any = {
  display: "flex",
  minHeight: "100vh",
  background: "#f4f6fa",
};

const sidebar: any = {
  width: "240px",
  background: "#111827",
  color: "white",
  padding: "20px",
};

const logo: any = {
  marginBottom: "30px",
};

const sectionTitle: any = {
  marginBottom: "10px",
  opacity: 0.7,
};

const nav: any = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const link: any = {
  color: "white",
  textDecoration: "none",
  padding: "10px",
  borderRadius: "6px",
  background: "#1f2937",
};

const main: any = {
  flex: 1,
  padding: "20px",
};

const header: any = {
  marginBottom: "20px",
};

const content: any = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
};