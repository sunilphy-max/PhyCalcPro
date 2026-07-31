import JSZip from "jszip";
import { parseBomCsv, parseBomXlsx } from "./parseBom";
import { buildAssemblyTree, validateDrawingPackage } from "./validatePackage";
import type { DrawingFileEntry, DrawingPackage } from "./types";

function basename(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts[parts.length - 1] || path;
}

/**
 * Unpack a ZIP drawing package. Requires BOM.xlsx (or BOM.csv) plus PDF drawings.
 */
export async function unpackDrawingZip(file: File): Promise<DrawingPackage> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const drawings: DrawingFileEntry[] = [];
  let bomBuffer: ArrayBuffer | null = null;
  let bomCsv: string | null = null;
  const warnings: string[] = [];

  const entries = Object.keys(zip.files);
  for (const path of entries) {
    const entry = zip.files[path]!;
    if (entry.dir) continue;
    const name = basename(path);
    const lower = name.toLowerCase();
    if (lower === "bom.xlsx" || lower.endsWith(".xlsx") && lower.includes("bom")) {
      bomBuffer = await entry.async("arraybuffer");
      continue;
    }
    if (lower === "bom.csv") {
      bomCsv = await entry.async("string");
      continue;
    }
    if (lower.endsWith(".pdf")) {
      const bytes = await entry.async("uint8array");
      drawings.push({ fileName: name, path, bytes });
    }
  }

  let rows: Awaited<ReturnType<typeof parseBomXlsx>>["rows"] = [];
  if (bomBuffer) {
    const parsed = await parseBomXlsx(bomBuffer);
    rows = parsed.rows;
    warnings.push(...parsed.warnings);
  } else if (bomCsv) {
    const parsed = parseBomCsv(bomCsv);
    rows = parsed.rows;
    warnings.push(...parsed.warnings);
  } else {
    warnings.push("BOM.xlsx (required) was not found in the ZIP.");
  }

  const issues = validateDrawingPackage(rows, drawings);
  for (const w of warnings) {
    issues.push({ severity: "warning", code: "bom_parse", message: w });
  }
  if (!bomBuffer && !bomCsv) {
    issues.push({
      severity: "error",
      code: "bom_required",
      message: "ZIP packages require BOM.xlsx (PhyCalcPro BOM template).",
    });
  }

  return {
    bomRows: rows,
    tree: buildAssemblyTree(rows),
    drawings,
    issues,
    hasBom: Boolean(bomBuffer || bomCsv) && rows.length > 0,
  };
}

/** Single-PDF package (no BOM) — one synthetic component node. */
export function singlePdfPackage(file: File, bytes: Uint8Array): DrawingPackage {
  const fileName = file.name;
  const pn = fileName.replace(/\.pdf$/i, "") || "DRAWING-1";
  const rows = [
    {
      level: 0,
      parentPartNumber: null,
      partNumber: pn,
      revision: "",
      drawingFile: fileName,
      qty: 1,
      description: pn,
    },
  ];
  const drawings: DrawingFileEntry[] = [{ fileName, path: fileName, bytes }];
  return {
    bomRows: rows,
    tree: buildAssemblyTree(rows),
    drawings,
    issues: [],
    hasBom: false,
  };
}
