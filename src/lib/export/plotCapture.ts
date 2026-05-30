type PlotlyModule = {
  toImage: (
    element: HTMLElement,
    options: { format: string; width: number; height: number }
  ) => Promise<string>;
};

type WindowWithPlotly = Window & { Plotly?: PlotlyModule };

async function getPlotly(): Promise<PlotlyModule | null> {
  if (typeof window === "undefined") return null;

  const win = window as WindowWithPlotly;
  if (typeof win.Plotly?.toImage === "function") return win.Plotly;

  const attach = (Plotly: PlotlyModule) => {
    if (typeof Plotly.toImage !== "function") return null;
    win.Plotly = Plotly;
    return Plotly;
  };

  try {
    // Match react-plotly.js (uses full plotly.js, not dist-min only).
    const mod = await import("plotly.js");
    const Plotly = (mod as { default?: PlotlyModule }).default ?? (mod as unknown as PlotlyModule);
    const loaded = attach(Plotly);
    if (loaded) return loaded;
  } catch {
    // Fall back to browser bundle if full package fails to load in Turbopack.
  }

  try {
    const mod = await import("plotly.js-dist-min");
    const Plotly = (mod as { default?: PlotlyModule }).default ?? (mod as unknown as PlotlyModule);
    return attach(Plotly);
  } catch {
    return null;
  }
}

export async function preparePlotsForCapture(container: HTMLElement): Promise<() => void> {
  const plotly = await getPlotly();
  if (!plotly) return () => undefined;

  const plotNodes = Array.from(
    container.querySelectorAll<HTMLElement>("[data-export-plot], [data-export-diagram]")
  );
  const restores: Array<() => void> = [];

  for (const node of plotNodes) {
    const plotDiv =
      node.querySelector<HTMLElement>(".js-plotly-plot") ??
      (node.classList.contains("js-plotly-plot") ? node : null);
    if (!plotDiv) continue;

    try {
      const width = Math.max(plotDiv.offsetWidth || 0, 400);
      const height = Math.max(plotDiv.offsetHeight || 0, 280);
      const dataUrl = await plotly.toImage(plotDiv, {
        format: "png",
        width,
        height,
      });
      const img = document.createElement("img");
      img.src = dataUrl;
      img.alt = "Chart snapshot";
      img.style.width = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.className = "export-plot-snapshot";
      const previousDisplay = plotDiv.style.display;
      plotDiv.style.display = "none";
      plotDiv.setAttribute("data-html2canvas-ignore", "true");
      node.appendChild(img);
      restores.push(() => {
        img.remove();
        plotDiv.style.display = previousDisplay;
        plotDiv.removeAttribute("data-html2canvas-ignore");
      });
    } catch {
      // Keep original plot; html2canvas may still capture after CSS sanitization.
    }
  }

  return () => restores.forEach((restore) => restore());
}
