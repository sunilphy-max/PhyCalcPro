export const plotTheme = {
  paperBg: "rgba(255,255,255,1)",
  plotBg: "rgba(248,250,252,1)",
  fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  fontColor: "#0f172a",
  gridColor: "#dbe3ee",
  zeroLineColor: "#94a3b8",
  lineColor: "#1d4ed8",
  lineWidth: 3,
  accentColor: "#0ea5e9",
  peakColor: "#ef4444",
  contourScale: "Turbo",
  /** Room for axis titles (bottom/left) */
  margins: { l: 72, r: 28, t: 24, b: 64 },
  /** Extra top space when a horizontal legend is shown */
  marginsWithLegend: { l: 72, r: 28, t: 88, b: 64 },
  plotHeight: 340,
  heatmapHeight: 360,
} as const;
