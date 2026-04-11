"use client";

import { useState } from "react";
import Link from "next/link";

export default function BoltCalculator() {
  const [force, setForce] = useState(0);
  const [area, setArea] = useState(1);
  const [stress, setStress] = useState<number | null>(null);

  const calculate = () => {
    if (area <= 0) {
      alert("Area must be greater than zero");
      return;
    }

    setStress(force / area);
  };

  return (
    <div style={container}>
      
      {/* BACK NAV */}
      <Link href="/" style={{ color: "#60a5fa" }}>
        ← Back to Products
      </Link>

      {/* TITLE */}
      <h1 style={{ marginTop: 20 }}>Bolt Stress Calculator</h1>

      <p style={{ opacity: 0.7 }}>
        Stress = Force / Area (Engineering units: N/mm²)
      </p>

      {/* CARD */}
      <div style={card}>
        
        <label>Force (N)</label>
        <input
          type="number"
          value={force}
          onChange={(e) => setForce(Number(e.target.value))}
          style={input}
        />

        <label>Area (mm²)</label>
        <input
          type="number"
          value={area}
          onChange={(e) => setArea(Number(e.target.value))}
          style={input}
        />

        <button onClick={calculate} style={button}>
          Calculate Stress
        </button>

        {stress !== null && (
          <div style={result}>
            Stress: <b>{stress.toFixed(2)} N/mm²</b>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========== STYLES ========== */

const container: any = {
  minHeight: "100vh",
  padding: "30px",
  background: "#0b1220",
  color: "white",
  fontFamily: "system-ui",
};

const card: any = {
  marginTop: 20,
  padding: 20,
  background: "#111827",
  borderRadius: 12,
  border: "1px solid #1f2937",
  maxWidth: 420,
};

const input: any = {
  width: "100%",
  padding: 10,
  marginTop: 5,
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
};

const button: any = {
  width: "100%",
  padding: 10,
  background: "#2563eb",
  color: "white",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};

const result: any = {
  marginTop: 15,
  padding: 10,
  background: "#1e293b",
  borderRadius: 8,
};