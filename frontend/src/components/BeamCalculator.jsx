import React, { useState } from "react";
import Plot from "react-plotly.js";

function BeamCalculator() {
  const [form, setForm] = useState({
    L: 1000,
    P: 1000,
    a: 500,
    E: 210000,
    I: 8.33e6,
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const solve = async () => {
    const res = await fetch("/api/beam/simply-supported-point", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Simply Supported Beam – Point Load</h2>

      {Object.keys(form).map((key) => (
        <div key={key}>
          <label>{key}</label>
          <input
            type="number"
            name={key}
            value={form[key]}
            onChange={handleChange}
          />
        </div>
      ))}

      <button onClick={solve}>Solve</button>

      {result && (
        <>
          <h3>Results</h3>
          <p>RA: {result.RA.toFixed(2)} N</p>
          <p>RB: {result.RB.toFixed(2)} N</p>
          <p>Max Moment: {result.max_moment.toFixed(2)} N·mm</p>
          <p>Max Deflection: {result.max_deflection.toExponential(4)} mm</p>

          <Plot
            data={[
              {
                x: result.x,
                y: result.shear,
                type: "scatter",
                name: "Shear Force",
              },
              {
                x: result.x,
                y: result.moment,
                type: "scatter",
                name: "Bending Moment",
              },
              {
                x: result.x,
                y: result.deflection,
                type: "scatter",
                name: "Deflection",
              },
            ]}
            layout={{
              width: 900,
              height: 600,
              title: "Beam Diagrams",
            }}
          />
        </>
      )}
    </div>
  );
}

export default BeamCalculator;