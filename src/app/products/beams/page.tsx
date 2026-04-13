"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { solveBeam } from "@/lib/beamEngine";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Page() {
  const [length, setLength] = useState(5);
  const [force, setForce] = useState(1000);
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const res = solveBeam({
      length,
      E: 210e9,
      I: 1e-6,
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

  return (
    <div style={{ padding: 20, background: "#f5f7fb", minHeight: "100vh" }}>
      <h1>Beam Analysis (Step 1)</h1>

      {/* INPUTS */}
      <div style={{ background: "white", padding: 10, marginBottom: 10 }}>
        <label>Length (m)</label>
        <input
          value={length}
          onChange={(e) => setLength(+e.target.value)}
        />

        <label>Point Load (N)</label>
        <input
          value={force}
          onChange={(e) => setForce(+e.target.value)}
        />

        <button onClick={calculate} style={{ marginTop: 10 }}>
          Solve Beam
        </button>
      </div>

      {/* OUTPUTS */}
      {result && (
        <div style={{ display: "grid", gap: 20 }}>
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
          />

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
          />

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
          />
        </div>
      )}
    </div>
  );
}