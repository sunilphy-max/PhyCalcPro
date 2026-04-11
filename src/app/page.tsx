import Link from "next/link";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Title */}
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
        PhyCalcPro
      </h1>

      {/* Subtitle */}
      <p style={{ marginTop: "0.5rem", fontSize: "1.2rem", opacity: 0.7 }}>
        Physics Calculator Platform MVP
      </p>

      {/* Button-style link */}
      <Link
        href="/bolt-calculator"
        style={{
          marginTop: "2rem",
          padding: "12px 20px",
          backgroundColor: "#2563eb",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Go to Bolt Calculator →
      </Link>
    </main>
  );
}