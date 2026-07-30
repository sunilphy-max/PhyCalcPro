import { createCanvas } from "@napi-rs/canvas";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

const MAX_PAGES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const RENDER_SCALE = 1.5;

/** Node canvas factory for pdf.js page rendering. */
const nodeCanvasFactory = {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    return {
      canvas,
      context: canvas.getContext("2d"),
    };
  },
  reset(
    canvasAndContext: { canvas: ReturnType<typeof createCanvas>; context: unknown },
    width: number,
    height: number
  ) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },
  destroy(canvasAndContext: { canvas: ReturnType<typeof createCanvas> }) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
  },
};

export type RasterPage = {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
};

export type PdfRasterResult = {
  pages: RasterPage[];
  textByPage: string[];
  pageCount: number;
  warnings: string[];
};

/**
 * Rasterize the first pages of a PDF to PNG data URLs and extract text.
 */
export async function rasterizePdf(buffer: Buffer): Promise<PdfRasterResult> {
  const warnings: string[] = [];
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`PDF exceeds ${MAX_BYTES / (1024 * 1024)} MB limit`);
  }

  // Disable worker in Node — run on main thread.
  GlobalWorkerOptions.workerSrc = "";

  let doc;
  try {
    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      // @ts-expect-error canvasFactory is supported in Node builds
      canvasFactory: nodeCanvasFactory,
      disableWorker: true,
    });
    doc = await loadingTask.promise;
  } catch (err) {
    throw new Error(
      `Failed to open PDF: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const pageCount = doc.numPages;
  const limit = Math.min(pageCount, MAX_PAGES);
  if (pageCount > MAX_PAGES) {
    warnings.push(`Only the first ${MAX_PAGES} of ${pageCount} pages were processed.`);
  }

  const pages: RasterPage[] = [];
  const textByPage: string[] = [];

  for (let pageNumber = 1; pageNumber <= limit; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d");

    try {
      await page.render({
        canvasContext: context as unknown as CanvasRenderingContext2D,
        viewport,
        // @ts-expect-error canvasFactory for Node
        canvasFactory: nodeCanvasFactory,
      }).promise;
      const dataUrl = canvas.toDataURL("image/png");
      pages.push({
        pageNumber,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
      });
    } catch (err) {
      warnings.push(
        `Page ${pageNumber} raster failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    try {
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item) => ("str" in item ? String(item.str) : ""))
        .filter(Boolean)
        .join(" ");
      textByPage.push(text);
    } catch {
      textByPage.push("");
    }
  }

  const cleanup = doc as { cleanup?: () => void; destroy?: () => Promise<void> };
  try {
    if (typeof cleanup.destroy === "function") await cleanup.destroy();
    else cleanup.cleanup?.();
  } catch {
    // ignore cleanup errors
  }

  return { pages, textByPage, pageCount, warnings };
}
