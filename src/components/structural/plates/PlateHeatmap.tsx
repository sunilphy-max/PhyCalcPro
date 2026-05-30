"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type Props = {
  title: string;
  x: number[];
  y: number[];
  z: number[][];
};

export default function PlateHeatmap({ title, x, y, z }: Props) {
  const cleanZ = z.map((row) => row.map((value) => (Number.isFinite(value) ? value : 0)));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" data-export-plot="true">
      <div className="font-semibold text-sm mb-3">{title}</div>
      <Plot
        data={[
          {
            x,
            y,
            z: cleanZ,
            type: "heatmap",
            colorscale: "Viridis",
            reversescale: true,
          },
        ]}
        layout={{
          autosize: true,
          height: 320,
          margin: { l: 50, r: 20, t: 30, b: 40 },
          xaxis: { title: "Length (x)" },
          yaxis: { title: "Width (y)" },
        }}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
