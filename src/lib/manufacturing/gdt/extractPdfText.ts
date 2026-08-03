/**
 * Lightweight embedded-text scrape for PDF buffers (no pdfjs / DOMMatrix / worker).
 * Good enough for vector drawings with text operators (e.g. jsPDF demos) and many
 * CAD exports. Scans and image-only PDFs return empty — client page images + vision
 * cover those.
 */

const MAX_PAGES_HINT = 5;

function decodePdfString(raw: string): string {
  // PDF literal strings: \( \) \\ and octal escapes
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, oct: string) =>
      String.fromCharCode(Number.parseInt(oct, 8))
    )
    .replace(/\\(.)/g, "$1");
}

function stringsFromContent(content: string): string[] {
  const out: string[] = [];
  // (Hello) Tj
  const tj = /\(((?:\\.|[^\\()])*)\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = tj.exec(content))) {
    const s = decodePdfString(m[1] ?? "").trim();
    if (s) out.push(s);
  }
  // [(Hello) -10 (World)] TJ
  const tjArray = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\s*TJ/g;
  while ((m = tjArray.exec(content))) {
    const inner = m[1] ?? "";
    const parts = /\(((?:\\.|[^\\()])*)\)/g;
    let p: RegExpExecArray | null;
    const chunk: string[] = [];
    while ((p = parts.exec(inner))) {
      const s = decodePdfString(p[1] ?? "");
      if (s) chunk.push(s);
    }
    if (chunk.length) out.push(chunk.join(""));
  }
  return out;
}

/**
 * Returns up to N page text blobs. When page boundaries are unclear, returns a
 * single combined page of extracted strings.
 */
export function extractPdfTextFallback(buffer: Buffer): {
  textByPage: string[];
  pageCount: number;
  warnings: string[];
} {
  const warnings: string[] = [];
  const raw = buffer.toString("latin1");

  // Count page objects as a rough pageCount
  const pageMatches = raw.match(/\/Type\s*\/Page(?![s])/g);
  const pageCount = Math.max(1, Math.min(pageMatches?.length ?? 1, MAX_PAGES_HINT));

  // Prefer stream contents
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  const pageTexts: string[] = [];
  let sm: RegExpExecArray | null;
  while ((sm = streamRe.exec(raw))) {
    const strings = stringsFromContent(sm[1] ?? "");
    if (strings.length) pageTexts.push(strings.join(" "));
    if (pageTexts.length >= MAX_PAGES_HINT) break;
  }

  if (pageTexts.length === 0) {
    // Whole-file scrape as last resort
    const all = stringsFromContent(raw);
    if (all.length) {
      pageTexts.push(all.join(" "));
    } else {
      warnings.push(
        "No embedded text operators found in the PDF (likely a scan). Client page images are required for vision extract."
      );
    }
  }

  return {
    textByPage: pageTexts.length ? pageTexts : [""],
    pageCount: Math.max(pageCount, pageTexts.length || 1),
    warnings,
  };
}
