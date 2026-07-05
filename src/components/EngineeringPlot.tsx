"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { usePlotTheme } from "@/hooks/usePlotTheme";
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

export type PlotSeries = {
  y: number[];
  /** Legend label (e.g. "Bending moment") */
  label: string;
  /** Unit shown in legend/hover; falls back to the primary unitLabel */
  unitLabel?: string;
  color?: string;
  /** Plot against the secondary (right) axis when units differ */
  secondaryAxis?: boolean;
};

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
  /** Additional overlay series sharing the same x values (e.g. moment over shear) */
  series?: PlotSeries[];
  /** Right-axis title when any overlay series uses secondaryAxis */
  secondaryYLabel?: string;
  secondaryUnitLabel?: string;
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
  series = [],
  secondaryYLabel,
  secondaryUnitLabel,
}: Props) {
  const plotTheme = usePlotTheme();
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
    series.length +
    (peakIndex >= 0 ? 1 : 0) +
    (probeIndex >= 0 ? 1 : 0);
  const showLegend = traceCount > 1;
  const hasSecondaryAxis = series.some((s) => s.secondaryAxis);

  const overlayPalette = ["#9333ea", "#0d9488", "#ea580c", "#be185d"];

  const hoverYUnit = unitLabel ? ` ${unitLabel}` : "";
  const hoverXUnit = xUnit ? ` ${xUnit}` : "";

  const plotExportData = useMemo(
    () =>
      JSON.stringify({
        title,
        x,
        xLabel,
        xUnit,
        yLabel,
        unitLabel,
        series: [
          { label: yLabel, y: cleanY, unitLabel },
          ...series.map((s) => ({
            label: s.label,
            y: s.y,
            unitLabel: s.unitLabel,
          })),
        ],
      }),
    [title, x, xLabel, xUnit, yLabel, unitLabel, cleanY, series]
  );

  return (
    <div
      className="relative max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      data-export-plot="true"
      data-export-caption={title}
      data-export-plot-data={plotExportData}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
        {peakValue !== null ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
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
          ...series.map((overlay, idx) => {
            const overlayUnit = overlay.unitLabel ?? unitLabel;
            const overlayName = overlayUnit
              ? `${overlay.label} (${overlayUnit})`
              : overlay.label;
            return {
              x,
              y: overlay.y.map((v) => (Number.isFinite(v) ? v : 0)),
              type: "scatter" as const,
              mode: "lines" as const,
              line: {
                color: overlay.color ?? overlayPalette[idx % overlayPalette.length],
                width: plotTheme.lineWidth,
                shape: "spline" as const,
                dash: idx % 2 === 1 ? ("dot" as const) : undefined,
              },
              name: overlayName,
              yaxis: overlay.secondaryAxis ? ("y2" as const) : undefined,
              hovertemplate:
                `${xLabel}: %{x:.4f}${hoverXUnit}<br>` +
                `${overlay.label}: %{y:.4f}${overlayUnit ? ` ${overlayUnit}` : ""}<extra></extra>`,
            };
          }),
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
          ...(hasSecondaryAxis
            ? {
                yaxis2: {
                  title: {
                    text: formatAxisTitle(
                      secondaryYLabel ?? series.find((s) => s.secondaryAxis)?.label ?? "",
                      secondaryUnitLabel ?? series.find((s) => s.secondaryAxis)?.unitLabel
                    ),
                    standoff: 14,
                  },
                  overlaying: "y" as const,
                  side: "right" as const,
                  showgrid: false,
                  ticks: "outside" as const,
                  tickfont: { size: 11 },
                  automargin: true,
                },
              }
            : {}),
          hovermode: "x unified",
          legend: showLegend
            ? {
                orientation: "h",
                x: 0,
                xanchor: "left",
                y: 1.14,
                yanchor: "bottom",
                bgcolor: plotTheme.paperBg.replace("1)", "0.92)"),
                bordercolor: plotTheme.gridColor,
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
