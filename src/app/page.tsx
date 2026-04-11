import Link from "next/link";

export default function Page() {
  return (
    <div style={container}>
      
      {/* SIDEBAR */}
      <aside style={sidebar}>
        <h2 style={{ marginBottom: 20 }}>PhyCalcPro</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={sectionTitle}>Beams, Shafts, Profiles</div>

          <Link style={link} href="/bolt-calculator">
            ⚙ Bolt Stress Calculator
          </Link>

          <div style={disabled}>🧱 Beam Bending (coming soon)</div>
          <div style={disabled}>🌡 Thermal Expansion</div>
          <div style={disabled}>📊 Material Properties</div>
        </nav>
      </aside>

      {/* MAIN */}
      <main style={main}>
        <h1>Engineering Calculation Suite</h1>

        <p style={{ opacity: 0.7 }}>
          MITCalc-style engineering tools for mechanical design
        </p>

        <div style={card}>
          <h2>Welcome</h2>
          <p>
            Select a module from the left panel to start calculations.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ===== styles ===== */

const container: any = {
  display: "flex",
  minHeight: "100vh",
  background: "#0b1220",
  color: "white",
  fontFamily: "system-ui",
};

const sidebar: any = {
  width: "260px",
  padding: "20px",
  borderRight: "1px solid #1f2937",
};

const main: any = {
  flex: 1,
  padding: "30px",
};

const sectionTitle: any = {
  fontSize: "12px",
  opacity: 0.6,
  marginTop: 10,
};

const link: any = {
  color: "#60a5fa",
  textDecoration: "none",
  padding: "6px 0",
};

const disabled: any = {
  opacity: 0.4,
  padding: "6px 0",
};

const card: any = {
  marginTop: 20,
  padding: 20,
  background: "#111827",
  borderRadius: 10,
  border: "1px solid #1f2937",
};