import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

export default function HomePage() {
  return (
    <DashboardLayout title="Engineering Calculation Suite">
      <h2>Welcome to PhyCalcPro</h2>
      <p>Select a module to begin calculations.</p>

      <div style={grid}>
        <Link href="/products/beams" style={card}>
          <h3>Beams</h3>
          <p>Deflection, stress, bending moment</p>
        </Link>

        <div style={card}>
          <h3>Shafts</h3>
          <p>Coming soon</p>
        </div>

        <div style={card}>
          <h3>Buckling</h3>
          <p>Coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

const grid: any = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "20px",
};

const card: any = {
  display: "block",
  textDecoration: "none",
  color: "#111827",
  background: "#f9fafb",
  padding: "20px",
  borderRadius: "10px",
  border: "1px solid #ddd",
};