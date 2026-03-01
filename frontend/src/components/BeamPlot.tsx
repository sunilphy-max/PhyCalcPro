"use client";

import dynamic from "next/dynamic";
import { Layout } from "plotly.js";

type BeamPlotProps = {
  x: number[];
  moment: number[];
};

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

export default function BeamPlot({ x, moment }: BeamPlotProps) {
  const layout: Partial<Layout> = {
    title: { text: "Bending Moment Diagram" },
    xaxis: { title: { text: "Length (m)" } },
    yaxis: { title: { text: "Moment (Nm)" } },
  };

  return (
    <Plot
      data={[
        {
          x,
          y: moment,
          type: "scatter",
          mode: "lines",
        },
      ]}
      layout={layout}
    />
  );
}