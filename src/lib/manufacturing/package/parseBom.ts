import type { BomRow } from "./types";

const HEADER_ALIASES: Record<keyof BomRow | "parent", string[]> = {
  level: ["level", "lvl", "bom level"],
  parentPartNumber: ["parent part", "parent part number", "parent", "parent pn", "parentpart"],
  partNumber: ["part number", "part", "pn", "partnumber", "item"],
  revision: ["revision", "rev", "drawing rev"],
  drawingFile: ["drawing", "drawing file", "drawingfile", "pdf", "filename", "file"],
  qty: ["qty", "quantity", "q"],
  description: ["description", "desc", "name", "title"],
  parent: [],
};

function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function mapHeaders(headers: string[]): Partial<Record<keyof BomRow, number>> {
  const map: Partial<Record<keyof BomRow, number>> = {};
  headers.forEach((h, i) => {
    const n = normHeader(h);
    (Object.keys(HEADER_ALIASES) as (keyof typeof HEADER_ALIASES)[]).forEach((key) => {
      if (key === "parent") return;
      if (HEADER_ALIASES[key].includes(n) && map[key as keyof BomRow] === undefined) {
        map[key as keyof BomRow] = i;
      }
    });
  });
  return map;
}

function cellString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return String(value).trim();
}

/**
 * Parse PhyCalcPro BOM.xlsx (first sheet) into rows.
 * Required columns: Level, Part Number, Drawing File (Parent optional at level 0).
 */
export async function parseBomXlsx(buffer: ArrayBuffer): Promise<{
  rows: BomRow[];
  warnings: string[];
}> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { rows: [], warnings: ["BOM.xlsx has no worksheets."] };
  }

  const headerRow = sheet.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, col) => {
    headers[col - 1] = cellString(cell.value);
  });
  const col = mapHeaders(headers);
  const warnings: string[] = [];

  if (col.partNumber === undefined) warnings.push("BOM missing Part Number column.");
  if (col.drawingFile === undefined) warnings.push("BOM missing Drawing File column.");
  if (col.level === undefined) warnings.push("BOM missing Level column.");

  if (col.partNumber === undefined || col.drawingFile === undefined || col.level === undefined) {
    return { rows: [], warnings };
  }

  const rows: BomRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const get = (idx: number | undefined) =>
      idx === undefined ? "" : cellString(row.getCell(idx + 1).value);
    const partNumber = get(col.partNumber);
    const drawingFile = get(col.drawingFile);
    if (!partNumber && !drawingFile) return;

    const level = Number(get(col.level));
    const parentRaw = get(col.parentPartNumber);
    const qtyRaw = get(col.qty);
    rows.push({
      level: Number.isFinite(level) ? level : 0,
      parentPartNumber: parentRaw || null,
      partNumber: partNumber || `UNKNOWN-${rowNumber}`,
      revision: get(col.revision) || "",
      drawingFile: drawingFile.replace(/\\/g, "/").split("/").pop() || drawingFile,
      qty: qtyRaw ? Number(qtyRaw) || 1 : 1,
      description: get(col.description),
    });
  });

  if (rows.length === 0) warnings.push("BOM.xlsx contained no data rows.");
  return { rows, warnings };
}

/** Minimal CSV fallback: Level,Parent Part,Part Number,Revision,Drawing,Qty,Description */
export function parseBomCsv(text: string): { rows: BomRow[]; warnings: string[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return { rows: [], warnings: ["BOM CSV is empty."] };
  const headers = lines[0]!.split(",").map((h) => h.trim());
  const col = mapHeaders(headers);
  const warnings: string[] = [];
  if (col.partNumber === undefined || col.drawingFile === undefined || col.level === undefined) {
    return { rows: [], warnings: ["BOM CSV missing required columns."] };
  }
  const rows: BomRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i]!.split(",").map((c) => c.trim());
    const partNumber = cells[col.partNumber!] ?? "";
    const drawingFile = cells[col.drawingFile!] ?? "";
    if (!partNumber && !drawingFile) continue;
    const parentRaw = col.parentPartNumber !== undefined ? cells[col.parentPartNumber] ?? "" : "";
    rows.push({
      level: Number(cells[col.level!] ?? 0) || 0,
      parentPartNumber: parentRaw || null,
      partNumber: partNumber || `UNKNOWN-${i}`,
      revision: col.revision !== undefined ? cells[col.revision] ?? "" : "",
      drawingFile: drawingFile.replace(/\\/g, "/").split("/").pop() || drawingFile,
      qty: col.qty !== undefined ? Number(cells[col.qty]) || 1 : 1,
      description: col.description !== undefined ? cells[col.description] ?? "" : "",
    });
  }
  return { rows, warnings };
}
