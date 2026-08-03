import "server-only";

import { ensurePdfJsDomPolyfills } from "./domMatrixPolyfill";
import { extractPdfTextFallback } from "./extractPdfText";

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
 *
 * Uses a lightweight text scrape by default (no pdfjs worker / DOMMatrix).
 * Optionally tries pdfjs when `PHYCALCPRO_PDFJS_TEXT=1` is set — disabled by
 * default because Turbopack rewrites the worker import path (`[project]/...`).
 *
 * Vision still receives optional client-supplied page images via parseDrawingPdf.
 */
export async function rasterizePdf(buffer: Buffer): Promise<PdfRasterResult> {
  const warnings: string[] = [];
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`PDF exceeds ${MAX_BYTES / (1024 * 1024)} MB limit`);
  }

  const fallback = extractPdfTextFallback(buffer);
  warnings.push(...fallback.warnings);

  if (process.env.PHYCALCPRO_PDFJS_TEXT === "1") {
    try {
      const viaPdfJs = await tryPdfJsText(buffer);
      if (viaPdfJs.textByPage.some((t) => t.trim())) {
        return {
          pages: [],
          textByPage: viaPdfJs.textByPage,
          pageCount: viaPdfJs.pageCount,
          warnings: [...warnings, ...viaPdfJs.warnings],
        };
      }
    } catch (err) {
      warnings.push(
        `pdfjs text extract skipped: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return {
    pages: [],
    textByPage: fallback.textByPage,
    pageCount: fallback.pageCount,
    warnings,
  };
}

async function tryPdfJsText(buffer: Buffer): Promise<{
  textByPage: string[];
  pageCount: number;
  warnings: string[];
}> {
  ensurePdfJsDomPolyfills();
  const { existsSync } = await import("node:fs");
  const path = await import("node:path");
  const { pathToFileURL } = await import("node:url");
  const { getDocument, GlobalWorkerOptions } = await import(
    "pdfjs-dist/legacy/build/pdf.mjs"
  );

  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs"
  );
  if (!existsSync(workerPath)) {
    throw new Error("pdf.worker.min.mjs not found");
  }
  GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

  const data = Uint8Array.from(buffer);
  const doc = await getDocument({
    data,
    useSystemFonts: true,
    useWorkerFetch: false,
    useWasm: false,
  }).promise;

  const limit = Math.min(doc.numPages, 5);
  const textByPage: string[] = [];
  const warnings: string[] = [];
  for (let pageNumber = 1; pageNumber <= limit; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    try {
      const textContent = await page.getTextContent();
      textByPage.push(
        textContent.items
          .map((item: unknown) =>
            item && typeof item === "object" && "str" in item
              ? String((item as { str: string }).str)
              : ""
          )
          .filter(Boolean)
          .join(" ")
      );
    } catch {
      textByPage.push("");
      warnings.push(`Page ${pageNumber} text extraction failed.`);
    }
  }

  try {
    await (doc as { destroy?: () => Promise<void> }).destroy?.();
  } catch {
    // ignore
  }

  return { textByPage, pageCount: doc.numPages, warnings };
}
