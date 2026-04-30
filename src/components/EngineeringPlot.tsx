"use client";

import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

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
  const maxVal = y?.length > 0 ? Math.max(...y.map(Math.abs)) : 0;
  const maxIndex = y?.length > 0 ? y.findIndex(v => Math.abs(v) === maxVal) : -1;

  const hasData = maxIndex >= 0 && y[maxIndex] !== undefined;

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>

      <Plot
        data={[
          {
            x,
            y,
            type: "scatter",
            mode: "lines",
            line: {
              width: 3,
              color: "#1d4ed8",
            },
            name: title,
          },
          ...(hasData ? [{
            x: [x[maxIndex]],
            y: [y[maxIndex]],
            type: "scatter",
            mode: "markers+text",
            marker: {
              size: 10,
              color: "red",
            },
            text: [`Max: ${y[maxIndex].toFixed(2)}`],
            textposition: "top center",
            name: "Maximum",
          }] : []),
        ]}
        layout={{
          autosize: true,
          margin: { l: 50, r: 20, t: 20, b: 40 },
          paper_bgcolor: "white",
          plot_bgcolor: "#f9fafb",
          xaxis: {
            title: "Beam Length",
            gridcolor: "#d1d5db",
            zerolinecolor: "#6b7280",
          },
          yaxis: {
            title: yLabel,
            gridcolor: "#d1d5db",
            zerolinecolor: "#6b7280",
          },
          showlegend: false,
        }}
        config={{
          responsive: true,
          displayModeBar: false,
        }}
        style={{ width: "100%", height: "300px" }}
      />
    </div>
  );
}