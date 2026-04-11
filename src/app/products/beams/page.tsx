"use client";

import { useState } from "react";
import Plot from "@/components/PlotClient"

export default function Page() {
  const [force, setForce] = useState(1000);
  const [length, setLength] = useState(5);
  const [moment, setMoment] = useState<number | null>(null);

  const calculate = () => {
    const m = (force * length) / 4; // simplified beam model
    setMoment(m);
  };

  // Beam discretization
  const x = Array.from({ length: 50 }, (_, i) => (i / 49) * length);

  // Bending moment diagram (simply supported approximation)
  const bendingMoment = x.map(
    (xi) => (force * xi * (length - xi)) / (length * length)
  );

  // Deflection curve (scaled simplified model)
  const deflection = x.map(
    (xi) =>
      (-force *
        xi *
        (length ** 3 - 2 * length * xi ** 2 + xi ** 3)) /
      (24 * length)
  );

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <h1 style={{ color: "#111827" }}>Straight Beam Analysis</h1>
        <p style={{ color: "#374151" }}>
          Simply supported beam — bending moment & deflection diagrams
        </p>
      </div>

      {/* GRID */}
      <div style={grid}>
        {/* INPUT PANEL */}
        <div style={card}>
          <h2 style={title}>Inputs</h2>

          <label>Force (N)</label>
          <input
            type="number"
            value={force}
            onChange={(e) => setForce(Number(e.target.value))}
            style={input}
          />

          <label>Length (m)</label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            style={input}
          />

          <button onClick={calculate} style={button}>
            Calculate Beam
          </button>
        </div>

        {/* RESULTS + PLOTS */}
        <div style={card}>
          <h2 style={title}>Results</h2>

          {moment !== null && (
            <p>
              Max Moment: <b>{moment.toFixed(2)} Nm</b>
            </p>
          )}

          {/* BENDING MOMENT */}
          <div style={{ marginTop: 20 }}>
            <Plot
              data={[
                {
                  x,
                  y: bendingMoment,
                  type: "scatter",
                  mode: "lines",
                  name: "Bending Moment",
                },
              ]}
              layout={{
                title: "Bending Moment Diagram",
                margin: { t: 40 },
                paper_bgcolor: "white",
                plot_bgcolor: "white",
              }}
              style={{ width: "100%", height: "300px" }}
            />
          </div>

          {/* DEFLECTION */}
          <div style={{ marginTop: 20 }}>
            <Plot
              data={[
                {
                  x,
                  y: deflection,
                  type: "scatter",
                  mode: "lines",
                  name: "Deflection",
                },
              ]}
              layout={{
                title: "Deflection Curve",
                margin: { t: 40 },
                paper_bgcolor: "white",
                plot_bgcolor: "white",
              }}
              style={{ width: "100%", height: "300px" }}
            />
          </div>
        </div>
      </div>

      {/* THEORY SECTION */}
      <div style={cardFull}>
        <h2 style={title}>Engineering Notes</h2>
        <p>
          This model assumes a simply supported beam under point load approximation.
          Future upgrades will include real structural analysis:
        </p>

        <ul>
          <li>Uniformly distributed loads (UDL)</li>
          <li>Cantilever beams</li>
          <li>Multiple point loads</li>
          <li>Material stiffness (EI)</li>
        </ul>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const page: any = {
  minHeight: "100vh",
  background: "#f5f7fb",
  padding: "30px",
  fontFamily: "system-ui",
};

const header: any = {
  marginBottom: 20,
  borderBottom: "1px solid #d1d5db",
  paddingBottom: 10,
};

const grid: any = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
};

const card: any = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 20,
};

const cardFull: any = {
  marginTop: 20,
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 20,
};

const title: any = {
  color: "#111827",
};

const input: any = {
  width: "100%",
  padding: 8,
  marginTop: 5,
  marginBottom: 15,
  borderRadius: 6,
  border: "1px solid #d1d5db",
};

const button: any = {
  width: "100%",
  padding: 10,
  background: "#111827",
  color: "white",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
};