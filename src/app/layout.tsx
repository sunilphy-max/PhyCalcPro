import "../styles/globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "PhyCalcPro",
  description: "Engineering Calculation & Design Platform",
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
        <Navbar />
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