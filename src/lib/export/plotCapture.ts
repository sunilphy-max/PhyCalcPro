type PlotlyModule = {
  toImage: (
    element: HTMLElement,
    options: { format: string; width: number; height: number }
  ) => Promise<string>;
};

type WindowWithPlotly = Window & { Plotly?: PlotlyModule };

/**
 * Browser-safe Plotly for PDF snapshots. Do not import full `plotly.js` here —
 * it pulls Node `buffer` and breaks Turbopack client builds on Vercel.
 */
async function getPlotly(): Promise<PlotlyModule | null> {
  if (typeof window === "undefined") return null;

  const win = window as WindowWithPlotly;
  if (typeof win.Plotly?.toImage === "function") return win.Plotly;

  try {
    const mod = await import("plotly.js-dist-min");
    const Plotly = (mod as { default?: PlotlyModule }).default ?? (mod as unknown as PlotlyModule);
    if (typeof Plotly.toImage === "function") {
      win.Plotly = Plotly;
      return Plotly;
    }
  } catch {
    return null;
  }

  return null;
}

export type CapturedChart = {
  dataUrl: string;
  widthPx: number;
  heightPx: number;
  caption?: string;
};

/**
 * Collect high-resolution snapshots of every plot ([data-export-plot]) and
 * diagram ([data-export-diagram]) inside the report for the structured PDF.
 * Plotly charts render via Plotly.toImage at 2x scale; other diagram nodes
 * (SVG previews etc.) fall back to html2canvas.
 */
export async function collectChartImages(container: HTMLElement): Promise<CapturedChart[]> {
  const images: CapturedChart[] = [];
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>("[data-export-plot], [data-export-diagram]")
  );
  if (nodes.length === 0) return images;

  const plotly = await getPlotly();

  for (const node of nodes) {
    const caption = node.getAttribute("data-export-caption") ?? undefined;
    const plotDiv =
      node.querySelector<HTMLElement>(".js-plotly-plot") ??
      (node.classList.contains("js-plotly-plot") ? node : null);

    if (plotDiv && plotly) {
      try {
        const width = Math.max(plotDiv.offsetWidth || 0, 400);
        const height = Math.max(plotDiv.offsetHeight || 0, 280);
        const dataUrl = await plotly.toImage(plotDiv, {
          format: "png",
          width: width * 2,
          height: height * 2,
        });
        images.push({ dataUrl, widthPx: width, heightPx: height, caption });
        continue;
      } catch {
        // fall through to html2canvas
      }
    }

    try {
      const { captureElementToCanvas } = await import("@/lib/export/reportCapture");
      const canvas = await captureElementToCanvas(node);
      images.push({
        dataUrl: canvas.toDataURL("image/png"),
        widthPx: canvas.width,
        heightPx: canvas.height,
        caption,
      });
    } catch {
      // Skip nodes that cannot be captured.
    }
  }

  return images;
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
