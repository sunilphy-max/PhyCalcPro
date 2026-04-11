import Link from "next/link";

export default function Page() {
  return (
    <div style={page}>
      
      {/* HEADER */}
      <div style={header}>
        <h1>PhyCalcPro</h1>
        <p>Engineering Calculation Suite</p>
      </div>

      {/* MODULE GRID */}
      <div style={grid}>
        
        {/* BEAMS */}
        <Link href="/products/beams" style={card}>
          <h2>Beams, Shafts, Profiles</h2>
          <p>Straight beam bending, shear & deflection analysis</p>
        </Link>

        {/* SHAFTS (placeholder) */}
        <div style={cardDisabled}>
          <h2>Shaft Design</h2>
          <p>Torque, stress & deformation analysis</p>
        </div>

        {/* BUCKLING */}
        <div style={cardDisabled}>
          <h2>Column Buckling</h2>
          <p>Slender strut stability analysis</p>
        </div>

        {/* PROFILES */}
        <div style={cardDisabled}>
          <h2>Profiles & Properties</h2>
          <p>Area, inertia & section properties</p>
        </div>

        {/* SCREWS */}
        <div style={cardDisabled}>
          <h2>Power Screws</h2>
          <p>Lead screw & ball screw design tools</p>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page: any = {
  minHeight: "100vh",
  background: "#f5f7fb",
  fontFamily: "system-ui",
  padding: "30px",
  color: "#111827",
};

const header: any = {
  marginBottom: 30,
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: 10,
};

const grid: any = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 20,
};

const card: any = {
  padding: 20,
  borderRadius: 10,
  background: "white",
  border: "1px solid #e5e7eb",
  textDecoration: "none",
  color: "#111827",
  cursor: "pointer",
  transition: "0.2s",
};

const cardDisabled: any = {
  padding: 20,
  borderRadius: 10,
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  color: "#6b7280",
};