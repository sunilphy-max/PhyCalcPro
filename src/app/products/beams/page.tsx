"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { solveBeam } from "@/lib/beamEngine";

// Prevent SSR issues with Plotly
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

  const [I, setI] = useState(1e-6);
  const [c, setC] = useState(0.05);

  const [result, setResult] = useState<any>(null);

  // =============================
  // CALCULATION
  // =============================
  const calculate = () => {
    const res = solveBeam({
      length,
      E: 210e9,
      I,
      c,
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

        <label>Moment of Inertia I (m⁴)</label>
        <input
          type="number"
          value={I}
          onChange={(e) => setI(+e.target.value)}
        />

        <label>Outer Fiber Distance c (m)</label>
        <input
          type="number"
          value={c}
          onChange={(e) => setC(+e.target.value)}
        />

        <label>Support Type</label>
        <select
          value={support}
          onChange={(e) =>
            setSupport(
              e.target.value as
                | "simply_supported"
                | "cantilever"
                | "fixed_fixed"
            )
          }
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
        <>
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

            {/* STRESS */}
            <Plot
              data={[
                {
                  x: result.x,
                  y: result.stress,
                  type: "scatter",
                  mode: "lines",
                  name: "Stress",
                },
              ]}
              layout={{ title: "Bending Stress Distribution" }}
              style={{ width: "100%", height: "300px" }}
            />
          </div>

          {/* SUMMARY */}
          <div style={resultCard}>
            <h3>Results</h3>

            <p>
              <strong>Max Stress:</strong>{" "}
              {result.maxStress.toExponential(3)} Pa
            </p>

            <p>
              <strong>Max Deflection:</strong>{" "}
              {result.maxDeflection.toExponential(3)} m
            </p>
          </div>
        </>
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
  maxWidth: "420px",
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

const resultCard: any = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "20px",
  maxWidth: "420px",
};