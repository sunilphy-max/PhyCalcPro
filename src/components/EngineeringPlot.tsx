"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { plotTheme } from "@/components/shared/plotTheme";
import {
  formatAxisTitle,
  formatEngineeringValue,
} from "@/lib/display/formatEngineering";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[340px] items-center justify-center text-sm text-slate-500">
      Loading chart…
    </div>
  ),
});

type Props = {
  title: string;
  x: number[];
  y: number[];
  /** Short quantity name for axis and legend (e.g. "Shear force") */
  yLabel: string;
  probeX?: number | null;
  /** X-axis quantity label (e.g. "Position along beam") */
  xLabel?: string;
  /** Unit for x-axis values (e.g. "m", "deg") */
  xUnit?: string;
  /** Unit for y-axis values (e.g. "N", "Pa") — shown on axis, legend, and peak callout */
  unitLabel?: string;
  color?: string;
  /** Hide peak marker when not needed */
  showPeak?: boolean;
};

export default function EngineeringPlot({
  title,
  x,
  y,
  yLabel,
  probeX,
  xLabel = "Position",
  xUnit,
  unitLabel,
  color,
  showPeak = true,
}: Props) {
  const cleanY = y.map((v) => (Number.isFinite(v) ? v : 0));

  const peakIndex = useMemo(() => {
    if (!showPeak || cleanY.length === 0) return -1;
    return cleanY.findIndex(
      (v) => Math.abs(v) === Math.max(...cleanY.map(Math.abs))
    );
  }, [cleanY, showPeak]);

  const peakValue = peakIndex >= 0 ? cleanY[peakIndex] : null;
  const peakX = peakIndex >= 0 ? x[peakIndex] : null;

  const probeIndex = useMemo(() => {
    if (typeof probeX !== "number" || !x.length) return -1;
    return x.reduce((best, value, index) => {
      const bestDistance = Math.abs(x[best] - probeX);
      const distance = Math.abs(value - probeX);
      return distance < bestDistance ? index : best;
    }, 0);
  }, [probeX, x]);

  const yAxisTitle = formatAxisTitle(yLabel, unitLabel);
  const xAxisTitle = formatAxisTitle(xLabel, xUnit);
  const seriesName = unitLabel ? `${yLabel} (${unitLabel})` : yLabel;

  const peakLegendLabel =
    peakValue !== null
      ? `Peak |value| = ${formatEngineeringValue(peakValue, unitLabel ?? "", {
          useExponential: Math.abs(peakValue) < 1e-3 || Math.abs(peakValue) >= 1e5,
        })}`
      : "Peak |value|";

  const traceCount =
    1 +
    (peakIndex >= 0 ? 1 : 0) +
    (probeIndex >= 0 ? 1 : 0);
  const showLegend = traceCount > 1;

  const hoverYUnit = unitLabel ? ` ${unitLabel}` : "";
  const hoverXUnit = xUnit ? ` ${xUnit}` : "";

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      data-export-plot="true"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {peakValue !== null ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800">
            Peak: {formatEngineeringValue(peakValue, unitLabel ?? "", {
              useExponential:
                Math.abs(peakValue) < 1e-3 || Math.abs(peakValue) >= 1e5,
            })}
            {peakX !== null && xUnit ? (
              <span className="text-red-600/80">
                {" "}
                @ {formatEngineeringValue(peakX, xUnit, { digits: 3 })}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
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
            name: seriesName,
            hovertemplate:
              `${xLabel}: %{x:.4f}${hoverXUnit}<br>` +
              `${yLabel}: %{y:.4f}${hoverYUnit}<extra></extra>`,
          },
          ...(peakIndex >= 0
            ? [
                {
                  x: [x[peakIndex]],
                  y: [cleanY[peakIndex]],
                  type: "scatter" as const,
                  mode: "markers" as const,
                  marker: {
                    size: 11,
                    color: plotTheme.peakColor,
                    symbol: "diamond",
                    line: { color: "#fff", width: 1 },
                  },
                  name: peakLegendLabel,
                  hovertemplate:
                    `${xLabel}: %{x:.4f}${hoverXUnit}<br>` +
                    `Peak: %{y:.4f}${hoverYUnit}<extra></extra>`,
                },
              ]
            : []),
          ...(probeIndex >= 0
            ? [
                {
                  x: [x[probeIndex]],
                  y: [cleanY[probeIndex]],
                  type: "scatter" as const,
                  mode: "markers" as const,
                  marker: {
                    size: 10,
                    color: plotTheme.accentColor,
                    line: { color: "#0f172a", width: 1 },
                  },
                  name: "Probe",
                  hovertemplate:
                    `${xLabel}: %{x:.4f}${hoverXUnit}<br>` +
                    `Probe: %{y:.4f}${hoverYUnit}<extra></extra>`,
                },
              ]
            : []),
        ]}
        layout={{
          autosize: true,
          height: plotTheme.plotHeight,
          margin: showLegend ? plotTheme.marginsWithLegend : plotTheme.margins,
          paper_bgcolor: plotTheme.paperBg,
          plot_bgcolor: plotTheme.plotBg,
          font: {
            color: plotTheme.fontColor,
            family: plotTheme.fontFamily,
            size: 12,
          },
          xaxis: {
            title: { text: xAxisTitle, standoff: 12 },
            gridcolor: plotTheme.gridColor,
            zerolinecolor: plotTheme.zeroLineColor,
            zerolinewidth: 1,
            showgrid: true,
            ticks: "outside",
            tickfont: { size: 11 },
            titlefont: { size: 12 },
          },
          yaxis: {
            title: { text: yAxisTitle, standoff: 14 },
            gridcolor: plotTheme.gridColor,
            zerolinecolor: plotTheme.zeroLineColor,
            zerolinewidth: 1,
            showgrid: true,
            ticks: "outside",
            tickfont: { size: 11 },
            titlefont: { size: 12 },
            automargin: true,
          },
          hovermode: "x unified",
          legend: showLegend
            ? {
                orientation: "h",
                x: 0,
                xanchor: "left",
                y: 1.14,
                yanchor: "bottom",
                bgcolor: "rgba(255,255,255,0.92)",
                bordercolor: "#e2e8f0",
                borderwidth: 1,
                font: { size: 11 },
              }
            : undefined,
          showlegend: showLegend,
        }}
        config={{
          responsive: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["lasso2d", "select2d"],
        }}
        style={{ width: "100%", minHeight: plotTheme.plotHeight }}
        useResizeHandler
      />
    </div>
  );
}
