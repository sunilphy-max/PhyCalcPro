"use client";

import dynamic from "next/dynamic";
import { plotTheme } from "@/components/shared/plotTheme";
import { formatAxisTitle } from "@/lib/display/formatEngineering";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center text-sm text-slate-500">
      Loading chart…
    </div>
  ),
});

type Props = {
  title: string;
  x: number[];
  y: number[];
  z: number[][];
  xUnit?: string;
  yUnit?: string;
  zUnit?: string;
};

export default function PlateHeatmap({
  title,
  x,
  y,
  z,
  xUnit = "m",
  yUnit = "m",
  zUnit = "m",
}: Props) {
  const cleanZ = z.map((row) => row.map((value) => (Number.isFinite(value) ? value : 0)));

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      data-export-plot="true"
    >
      <div className="mb-3 text-sm font-semibold text-slate-900">{title}</div>
      <Plot
        data={[
          {
            x,
            y,
            z: cleanZ,
            type: "heatmap",
            colorscale: "Viridis",
            reversescale: true,
            colorbar: {
              title: { text: formatAxisTitle("Deflection", zUnit), side: "right" },
              thickness: 18,
              len: 0.9,
              tickfont: { size: 11 },
              titlefont: { size: 12 },
            },
            hovertemplate:
              `${formatAxisTitle("Length", xUnit)}: %{x:.3f}<br>` +
              `${formatAxisTitle("Width", yUnit)}: %{y:.3f}<br>` +
              `Deflection: %{z:.4f} ${zUnit}<extra></extra>`,
          },
        ]}
        layout={{
          autosize: true,
          height: plotTheme.heatmapHeight,
          margin: { l: 72, r: 88, t: 16, b: 64 },
          paper_bgcolor: plotTheme.paperBg,
          plot_bgcolor: plotTheme.plotBg,
          font: {
            color: plotTheme.fontColor,
            family: plotTheme.fontFamily,
            size: 12,
          },
          xaxis: {
            title: { text: formatAxisTitle("Length", xUnit), standoff: 12 },
            tickfont: { size: 11 },
          },
          yaxis: {
            title: { text: formatAxisTitle("Width", yUnit), standoff: 12 },
            tickfont: { size: 11 },
          },
        }}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: "100%", minHeight: plotTheme.heatmapHeight }}
        useResizeHandler
      />
    </div>
  );
}
