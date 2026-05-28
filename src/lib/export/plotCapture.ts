type PlotlyModule = {
  toImage: (
    element: HTMLElement,
    options: { format: string; width: number; height: number }
  ) => Promise<string>;
};

async function getPlotly(): Promise<PlotlyModule | null> {
  if (typeof window === "undefined") return null;

  try {
    // Browser bundle only — full plotly.js pulls Node buffer/glslify into Turbopack.
    const mod = await import("plotly.js-dist-min");
    return (mod.default ?? mod) as PlotlyModule;
  } catch {
    return null;
  }
}

export async function preparePlotsForCapture(container: HTMLElement): Promise<() => void> {
  const plotly = await getPlotly();
  if (!plotly) return () => undefined;

  const plotNodes = Array.from(
    container.querySelectorAll<HTMLElement>("[data-export-plot]")
  );
  const restores: Array<() => void> = [];

  for (const node of plotNodes) {
    const plotDiv =
      node.querySelector<HTMLElement>(".js-plotly-plot") ??
      (node.classList.contains("js-plotly-plot") ? node : null);
    if (!plotDiv) continue;

    try {
      const dataUrl = await plotly.toImage(plotDiv, {
        format: "png",
        width: plotDiv.offsetWidth || 800,
        height: plotDiv.offsetHeight || 400,
      });
      const img = document.createElement("img");
      img.src = dataUrl;
      img.style.width = "100%";
      img.style.height = "auto";
      img.className = "export-plot-snapshot";
      const previousDisplay = plotDiv.style.display;
      plotDiv.style.display = "none";
      plotDiv.parentElement?.appendChild(img);
      restores.push(() => {
        img.remove();
        plotDiv.style.display = previousDisplay;
      });
    } catch {
      // Keep original plot if snapshot fails.
    }
  }

  return () => restores.forEach((restore) => restore());
}
