"use client";

/**
 * Browser-side PDF page rasterization (no native Node canvas).
 * Used so the parse API can receive page images on Vercel without @napi-rs/canvas.
 */

const MAX_PAGES = 5;
const RENDER_SCALE = 1.25;

export type ClientRasterPage = {
  pageNumber: number;
  dataUrl: string;
};

export async function rasterizePdfInBrowser(file: File): Promise<{
  pages: ClientRasterPage[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // Worker from the same package; Next/Turbopack serves it as a static asset URL.
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();

    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await pdfjs.getDocument({ data }).promise;
    const limit = Math.min(doc.numPages, MAX_PAGES);
    if (doc.numPages > MAX_PAGES) {
      warnings.push(`Only the first ${MAX_PAGES} of ${doc.numPages} pages were rasterized.`);
    }

    const pages: ClientRasterPage[] = [];
    for (let pageNumber = 1; pageNumber <= limit; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: RENDER_SCALE });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext("2d");
      if (!context) {
        warnings.push(`Page ${pageNumber}: 2D canvas unavailable.`);
        continue;
      }
      await page.render({ canvasContext: context, canvas, viewport }).promise;
      pages.push({ pageNumber, dataUrl: canvas.toDataURL("image/png") });
    }

    try {
      await (doc as { destroy?: () => Promise<void> }).destroy?.();
    } catch {
      // ignore
    }

    return { pages, warnings };
  } catch (err) {
    warnings.push(
      `Client rasterization failed: ${err instanceof Error ? err.message : String(err)}`
    );
    return { pages: [], warnings };
  }
}
