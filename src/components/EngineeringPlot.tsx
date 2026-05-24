"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});

type Props = {
  title: string;
  x: number[];
  y: number[];
  yLabel: string;
};

export default function EngineeringPlot({
  title,
  x,
  y,
  yLabel,
}: Props) {
  const cleanY = y.map((v) => (Number.isFinite(v) ? v : 0));

  const peakIndex =
    cleanY.length > 0
      ? cleanY.findIndex(
          (v) => Math.abs(v) === Math.max(...cleanY.map(Math.abs))
        )
      : -1;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-sm p-4">
      <div className="text-sm font-semibold text-slate-900 mb-3">{title}</div>
      <Plot
        data={[
          {
            x,
            y: cleanY,
            type: "scatter",
            mode: "lines",
            line: {
              color: "#0f172a",
              width: 3,
              shape: "spline",
            },
            fill: "tozeroy",
            fillcolor: "rgba(15,23,42,0.08)",
            name: yLabel,
          },
          ...(peakIndex >= 0
            ? [
                {
                  x: [x[peakIndex]],
                  y: [cleanY[peakIndex]],
                  type: "scatter",
                  mode: "markers",
                  marker: {
                    size: 10,
                    color: "#ef4444",
                    symbol: "diamond",
                  },
                  name: "Peak",
                },
              ]
            : []),
        ]}
        layout={{
          autosize: true,
          height: 300,
          margin: { l: 48, r: 24, t: 24, b: 42 },
          paper_bgcolor: "rgba(255,255,255,1)",
          plot_bgcolor: "rgba(248,250,252,1)",
          font: { color: "#0f172a", family: "Inter, system-ui, sans-serif" },
          xaxis: {
            title: "Position",
            gridcolor: "#e2e8f0",
            zerolinecolor: "#cbd5e1",
            zerolinewidth: 1,
            showgrid: true,
          },
          yaxis: {
            title: yLabel,
            gridcolor: "#e2e8f0",
            zerolinecolor: "#cbd5e1",
            zerolinewidth: 1,
            showgrid: true,
          },
          hovermode: "x unified",
          showlegend: false,
        }}
        config={{
          responsive: true,
          displaylogo: false,
        }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
