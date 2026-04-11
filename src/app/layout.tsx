import "../styles/globals.css";

export const metadata = {
  title: "PhyCalcPro",
  description: "Engineering Calculation Suite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={body}>
        {/* HEADER BAR */}
        <header style={header}>
          <div style={logo}>PhyCalcPro</div>

          <nav style={nav}>
            <a href="/" style={link}>Home</a>
            <a href="/products/beams" style={link}>Beams</a>
          </nav>
        </header>

        {/* PAGE CONTENT */}
        <main style={main}>{children}</main>
      </body>
    </html>
  );
}

/* ================= STYLES ================= */

const body: any = {
  margin: 0,
  background: "#f5f7fb",
  fontFamily: "system-ui",
  color: "#111827",
};

const header: any = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 24px",
  borderBottom: "1px solid #e5e7eb",
  background: "white",
};

const logo: any = {
  fontWeight: "bold",
  fontSize: "18px",
};

const nav: any = {
  display: "flex",
  gap: "15px",
};

const link: any = {
  textDecoration: "none",
  color: "#374151",
};

const main: any = {
  padding: "20px",
};