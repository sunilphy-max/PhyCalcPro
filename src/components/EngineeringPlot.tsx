"use client";

import dynamic from "next/dynamic";
import { plotTheme } from "@/components/shared/plotTheme";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
      Loading chart…
    </div>
  ),
});

type Props = {
  title: string;
  x: number[];
  y: number[];
  yLabel: string;
  probeX?: number | null;
  peakValue?: number;
  xLabel?: string;
  unitLabel?: string;
  color?: string;
};

export default function EngineeringPlot({
  title,
  x,
  y,
  yLabel,
  probeX,
  xLabel = "Position",
  unitLabel,
  color,
}: Props) {
  const cleanY = y.map((v) => (Number.isFinite(v) ? v : 0));

  const peakIndex =
    cleanY.length > 0
      ? cleanY.findIndex(
          (v) => Math.abs(v) === Math.max(...cleanY.map(Math.abs))
        )
      : -1;

  const probeIndex =
    typeof probeX === "number" && x.length
      ? x.reduce((best, value, index) => {
          const bestDistance = Math.abs(x[best] - probeX);
          const distance = Math.abs(value - probeX);
          return distance < bestDistance ? index : best;
        }, 0)
      : -1;

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4"
      data-export-plot="true"
    >
      <div className="text-sm font-semibold text-slate-900 mb-3">{title}</div>
      <Plot
        data={[
          {
            x,
            y: cleanY,
            type: "scatter",
            mode: "lines",
            line: {
              color: color ?? plotTheme.lineColor,
              width: plotTheme.lineWidth,
              shape: "spline",
            },
            fill: "tozeroy",
            fillcolor: "rgba(29,78,216,0.08)",
            name: yLabel,
            hovertemplate: `%{x:.4f}<br>${yLabel}: %{y:.4f}${unitLabel ? ` ${unitLabel}` : ""}<extra></extra>`,
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
                    color: plotTheme.peakColor,
                    symbol: "diamond",
                  },
                  name: "Max |value|",
                },
              ]
            : []),
          ...(probeIndex >= 0
            ? [
                {
                  x: [x[probeIndex]],
                  y: [cleanY[probeIndex]],
                  type: "scatter",
                  mode: "markers",
                  marker: {
                    size: 9,
                    color: plotTheme.accentColor,
                    line: { color: "#0f172a", width: 1 },
                  },
                  name: "Probe",
                },
              ]
            : []),
        ]}
        layout={{
          autosize: true,
          height: 320,
          margin: plotTheme.margins,
          paper_bgcolor: plotTheme.paperBg,
          plot_bgcolor: plotTheme.plotBg,
          font: { color: plotTheme.fontColor, family: plotTheme.fontFamily, size: 12 },
          xaxis: {
            title: xLabel,
            gridcolor: plotTheme.gridColor,
            zerolinecolor: plotTheme.zeroLineColor,
            zerolinewidth: 1,
            showgrid: true,
            ticks: "outside",
          },
          yaxis: {
            title: unitLabel ? `${yLabel} (${unitLabel})` : yLabel,
            gridcolor: plotTheme.gridColor,
            zerolinecolor: plotTheme.zeroLineColor,
            zerolinewidth: 1,
            showgrid: true,
            ticks: "outside",
          },
          hovermode: "x unified",
          legend: {
            orientation: "h",
            x: 0,
            y: 1.2,
          },
          showlegend: true,
        }}
        config={{
          responsive: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["lasso2d", "select2d"],
        }}
        style={{ width: "100%" }}
      />
    </div>
  );
}
