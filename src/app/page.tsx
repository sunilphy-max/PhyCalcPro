import Link from "next/link";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "2.5rem",
        fontFamily: "system-ui, sans-serif",
        background: "#0f172a", // dark SaaS style
        color: "white",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h1 style={{ fontSize: "2.8rem", fontWeight: "bold" }}>
          PhyCalcPro
        </h1>
        <p style={{ opacity: 0.7, marginTop: "0.5rem" }}>
          Engineering & Physics Calculation Dashboard
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* Active Calculator */}
        <Link href="/bolt-calculator" style={{ textDecoration: "none" }}>
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "12px",
              background: "#1e293b",
              border: "1px solid #334155",
              transition: "0.2s",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              ⚙️ Bolt Stress Calculator
            </h2>
            <p style={{ opacity: 0.7, marginTop: "0.5rem" }}>
              Compute stress from force and area
            </p>
          </div>
        </Link>

        {/* Coming Soon Cards */}
        <div style={cardStyle()}>
          <h2>🧱 Beam Bending</h2>
          <p style={{ opacity: 0.6 }}>Coming soon</p>
        </div>

        <div style={cardStyle()}>
          <h2>🌡 Thermal Expansion</h2>
          <p style={{ opacity: 0.6 }}>Coming soon</p>
        </div>

        <div style={cardStyle()}>
          <h2>📊 Material Properties</h2>
          <p style={{ opacity: 0.6 }}>Coming soon</p>
        </div>
      </div>
    </main>
  );
}

// helper style function
function cardStyle() {
  return {
    padding: "1.5rem",
    borderRadius: "12px",
    background: "#1e293b",
    border: "1px solid #334155",
    opacity: 0.8,
  };
}