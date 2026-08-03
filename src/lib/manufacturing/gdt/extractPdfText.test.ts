import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { extractPdfTextFallback } from "./extractPdfText";

describe("extractPdfTextFallback", () => {
  it("reads text operators from the demo shaft PDF", () => {
    const buf = readFileSync(
      path.join(process.cwd(), "public/samples/SHA-100.pdf")
    );
    const { textByPage, pageCount, warnings } = extractPdfTextFallback(buf);
    expect(pageCount).toBeGreaterThanOrEqual(1);
    const joined = textByPage.join(" ");
    expect(joined).toMatch(/SHA-100|Shaft|Axial|DEMO/i);
    expect(warnings.some((w) => /No embedded text/i.test(w))).toBe(false);
  });
});
