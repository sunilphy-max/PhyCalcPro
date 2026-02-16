"use client";

import Plot from "react-plotly.js";

export default function BeamPlot({ x, moment }) {
  return (
    <Plot
      data={[
        {
          x: x,
          y: moment,
          type: "scatter",
          mode: "lines",
          name: "Moment"
        }
      ]}
      layout={{
        title: "Bending Moment Diagram",
        xaxis: { title: "Length (m)" },
        yaxis: { title: "Moment (Nm)" }
      }}
    />
  );
}
