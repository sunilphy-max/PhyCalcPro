/**
 * Named report sections for engineer-ready PDF / Excel packages.
 * Backward compatible: modules can still pass flat resultRows only.
 */

import type { ReportRow } from "@/lib/export/reportPayload";
import type { CsvRow } from "@/lib/export/csvRows";

export type ReportSectionId =
  | "design_summary"
  | "catalog"
  | "domain_factors"
  | "arrangement"
  | "recommendation"
  | "results"
  | "auxiliaries";

export type ReportSection = {
  id: ReportSectionId | string;
  title: string;
  rows?: ReportRow[];
  narrative?: string;
  bullets?: string[];
};

export function reportRowsToCsv(rows: ReportRow[], prefix?: string): CsvRow[] {
  return rows.map((row) => ({
    metric: prefix ? `${prefix}.${row.parameter}` : row.parameter,
    value: row.unit ? `${row.value} ${row.unit}` : row.value,
    notes: row.notes ?? "",
  }));
}

export function flattenReportSectionsToCsv(sections: ReportSection[]): CsvRow[] {
  const rows: CsvRow[] = [];
  for (const section of sections) {
    if (section.narrative) {
      rows.push({ metric: `${section.id}.narrative`, value: section.narrative });
    }
    if (section.bullets?.length) {
      rows.push({ metric: `${section.id}.reasons`, value: section.bullets.join(" | ") });
    }
    if (section.rows?.length) {
      rows.push(...reportRowsToCsv(section.rows, section.id));
    }
  }
  return rows;
}

export function sectionRowsAsReportRows(sections: ReportSection[]): ReportRow[] {
  const rows: ReportRow[] = [];
  for (const section of sections) {
    if (section.rows) rows.push(...section.rows);
  }
  return rows;
}

/** Curated export bundle: inputs + named result sections (+ optional CSV flatten). */
export function buildModuleReportBundles(params: {
  inputRows: ReportRow[];
  sections: ReportSection[];
}): {
  inputRows: ReportRow[];
  sections: ReportSection[];
  resultRows: ReportRow[];
  csvRows: CsvRow[];
} {
  const { inputRows, sections } = params;
  return {
    inputRows,
    sections,
    resultRows: sectionRowsAsReportRows(sections),
    csvRows: [...reportRowsToCsv(inputRows, "input"), ...flattenReportSectionsToCsv(sections)],
  };
}
