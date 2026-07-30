import "server-only";

import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

const MAX_PAGES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

export type RasterPage = {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
};

export type PdfRasterResult = {
  /** Page images when provided by the client; server path is text-only (no native canvas). */
  pages: RasterPage[];
  textByPage: string[];
  pageCount: number;
  warnings: string[];
};

/**
 * Extract embedded text from the first PDF pages.
 * Native canvas rasterization is intentionally omitted so Vercel/Turbopack builds
 * do not pull @napi-rs/canvas into any bundle. Vision still receives text (+ optional
 * client-supplied page images via parseDrawingPdf options).
 */
export async function rasterizePdf(buffer: Buffer): Promise<PdfRasterResult> {
  const warnings: string[] = [];
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`PDF exceeds ${MAX_BYTES / (1024 * 1024)} MB limit`);
  }

  GlobalWorkerOptions.workerSrc = "";

  let doc;
  try {
    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
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

  const textByPage: string[] = [];

  for (let pageNumber = 1; pageNumber <= limit; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    try {
      const textContent = await page.getTextContent();
      const text = textContent.items
        .map((item: unknown) =>
          item && typeof item === "object" && "str" in item
            ? String((item as { str: string }).str)
            : ""
        )
        .filter(Boolean)
        .join(" ");
      textByPage.push(text);
    } catch {
      textByPage.push("");
      warnings.push(`Page ${pageNumber} text extraction failed.`);
    }
  }

  if (textByPage.every((t) => !t.trim())) {
    warnings.push(
      "No embedded text found in the PDF (likely a scan). Extraction quality may be limited without page images."
    );
  }

  const cleanup = doc as { cleanup?: () => void; destroy?: () => Promise<void> };
  try {
    if (typeof cleanup.destroy === "function") await cleanup.destroy();
    else cleanup.cleanup?.();
  } catch {
    // ignore
  }

  return { pages: [], textByPage, pageCount, warnings };
}
