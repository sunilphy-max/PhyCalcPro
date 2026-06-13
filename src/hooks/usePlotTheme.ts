"use client";

import { useEffect, useState } from "react";
import { plotTheme as lightPlotTheme } from "@/components/shared/plotTheme";

const darkPlotTheme = {
  paperBg: "rgba(15,23,42,1)",
  plotBg: "rgba(30,41,59,1)",
  fontFamily: lightPlotTheme.fontFamily,
  fontColor: "#e2e8f0",
  gridColor: "#334155",
  zeroLineColor: "#64748b",
  lineColor: "#60a5fa",
  lineWidth: lightPlotTheme.lineWidth,
  accentColor: "#38bdf8",
  peakColor: "#f87171",
  contourScale: "Turbo",
  margins: lightPlotTheme.margins,
  marginsWithLegend: lightPlotTheme.marginsWithLegend,
  plotHeight: lightPlotTheme.plotHeight,
  heatmapHeight: lightPlotTheme.heatmapHeight,
} as const;

export type ActivePlotTheme = typeof lightPlotTheme | typeof darkPlotTheme;

export function usePlotTheme(): ActivePlotTheme {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return dark ? darkPlotTheme : lightPlotTheme;
}
