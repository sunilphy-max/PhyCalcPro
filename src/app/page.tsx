import Link from "next/link";

export default function Page() {
  return (
    <div style={containerStyle}>
      {/* LEFT SIDEBAR */}
      <aside style={sidebarStyle}>
        <h2 style={{ marginBottom: "1rem" }}>PhyCalcPro</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <SidebarLink name="Bolt Stress" href="/bolt-calculator" />
          <SidebarLink name="Beam Bending" href="#" />
          <SidebarLink name="Thermal Expansion" href="#" />
          <SidebarLink name="Material Props" href="#" />
          <SidebarLink name="Fatigue Analysis" href="#" />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={mainStyle}>
        {/* HEADER */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "bold" }}>
            Engineering Calculation Suite
          </h1>
          <p style={{ opacity: 0.7 }}>
            Professional tools for mechanical & structural engineering analysis
          </p>
        </div>

        {/* FEATURED PANEL */}
        <div style={heroCardStyle}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
              ⚙️ Bolt Stress Calculator
            </h2>
            <p style={{ marginTop: "0.5rem", opacity: 0.8 }}>
              Compute mechanical stress using force and cross-sectional area.
              Designed for structural and mechanical engineering workflows.
            </p>

            <Link href="/bolt-calculator" style={buttonStyle}>
              Launch Calculator →
            </Link>
          </div>

          {/* AI-style placeholder image */}
          <div style={imageStyle}>
            🧠 AI Engineering Diagram
          </div>
        </div>

        {/* TOOL GRID */}
        <h3 style={{ marginTop: "2rem" }}>Available Modules</h3>

        <div style={gridStyle}>
          <ToolCard title="Bolt Analysis" desc="Stress & load calculations" active />
          <ToolCard title="Beam Bending" desc="Deflection & stress analysis" />
          <ToolCard title="Thermal Expansion" desc="Material expansion modeling" />
          <ToolCard title="Material Database" desc="Engineering properties library" />
          <ToolCard title="Fatigue Life" desc="Cyclic load estimation" />
          <ToolCard title="Pressure Vessels" desc="Wall stress analysis" />
        </div>
      </main>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function SidebarLink({ name, href }: { name: string; href: string }) {
  return (
    <Link href={href} style={sidebarLinkStyle}>
      {name}
    </Link>
  );
}

function ToolCard({ title, desc, active = false }: any) {
  return (
    <div
      style={{
        padding: "1rem",
        borderRadius: "10px",
        background: active ? "#1d4ed8" : "#1e293b",
        border: "1px solid #334155",
      }}
    >
      <h4 style={{ fontWeight: "bold" }}>{title}</h4>
      <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>{desc}</p>
    </div>
  );
}

/* ---------- STYLES ---------- */

const containerStyle: any = {
  display: "flex",
  minHeight: "100vh",
  background: "#0b1220",
  color: "white",
  fontFamily: "system-ui",
};

const sidebarStyle: any = {
  width: "220px",
  padding: "1.5rem",
  borderRight: "1px solid #1f2937",
};

const mainStyle: any = {
  flex: 1,
  padding: "2rem",
};

const sidebarLinkStyle: any = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: "0.95rem",
};

const heroCardStyle: any = {
  display: "flex",
  gap: "1.5rem",
  padding: "1.5rem",
  borderRadius: "12px",
  background: "#111827",
  border: "1px solid #1f2937",
  alignItems: "center",
};

const imageStyle: any = {
  width: "180px",
  height: "120px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #1e3a8a, #0f172a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.9rem",
  opacity: 0.8,
};
const gridStyle: any = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1rem",
  marginTop: "1rem",
};
const buttonStyle: any = {
  display: "inline-block",
  marginTop: "1rem",
  padding: "10px 14px",
  background: "#2563eb",
  color: "white",
  borderRadius: "8px",
  textDecoration: "none",
};