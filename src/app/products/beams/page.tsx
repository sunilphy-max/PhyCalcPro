"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { solveBeam } from "@/lib/beamEngine";

// 👇 Fix Plotly SSR issue
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Page() {
  // =============================
  // STATE
  // =============================
  const [length, setLength] = useState(5);
  const [force, setForce] = useState(1000);
  const [support, setSupport] = useState<
  "simply_supported" | "cantilever" | "fixed_fixed"
>("simply_supported");
  const [result, setResult] = useState<any>(null);

  // =============================
  // CALCULATION
  // =============================
  const calculate = () => {
    const res = solveBeam({
      length,
      E: 210e9,
      I: 1e-6,
      support,
      loads: [
        {
          type: "point",
          value: force,
          position: length / 2,
        },
        {
          type: "udl",
          value: 200,
          start: 1,
          end: 4,
        },
      ],
    });

    setResult(res);
  };

  // =============================
  // UI
  // =============================
  return (
    <div style={page}>
      <h1>Beam Analysis Module</h1>

      {/* INPUT PANEL */}
      <div style={card}>
        <label>Length (m)</label>
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(+e.target.value)}
        />

        <label>Point Load (N)</label>
        <input
          type="number"
          value={force}
          onChange={(e) => setForce(+e.target.value)}
        />

        <label>Support Type</label>
        <select
          value={support}
          onChange={(e) => setSupport(e.target.value as "simply_supported" | "cantilever" | "fixed_fixed")}
        >
          <option value="simply_supported">Simply Supported</option>
          <option value="cantilever">Cantilever</option>
          <option value="fixed_fixed">Fixed-Fixed</option>
        </select>

        <button onClick={calculate} style={button}>
          Solve Beam
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <div style={grid}>
          {/* SHEAR */}
          <Plot
            data={[
              {
                x: result.x,
                y: result.shear,
                type: "scatter",
                mode: "lines",
                name: "Shear",
              },
            ]}
            layout={{ title: "Shear Force Diagram" }}
            style={{ width: "100%", height: "300px" }}
          />

          {/* MOMENT */}
          <Plot
            data={[
              {
                x: result.x,
                y: result.moment,
                type: "scatter",
                mode: "lines",
                name: "Moment",
              },
            ]}
            layout={{ title: "Bending Moment Diagram" }}
            style={{ width: "100%", height: "300px" }}
          />

          {/* DEFLECTION */}
          <Plot
            data={[
              {
                x: result.x,
                y: result.deflection,
                type: "scatter",
                mode: "lines",
                name: "Deflection",
              },
            ]}
            layout={{ title: "Deflection Curve" }}
            style={{ width: "100%", height: "300px" }}
          />
        </div>
      )}
    </div>
  );
}

// =============================
// STYLES
// =============================

const page: any = {
  padding: "20px",
  background: "#f5f7fb",
  minHeight: "100vh",
  fontFamily: "system-ui",
};

const card: any = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  maxWidth: "400px",
};

const grid: any = {
  display: "grid",
  gap: "20px",
};

const button: any = {
  padding: "10px",
  background: "#111827",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer",
};