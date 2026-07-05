import type { EngineeringCheckStatus } from "@/lib/standards/types";
import {
  formatCheckSummaryText,
  formatReportValue,
  type PlotDataExport,
  type ReportPayload,
  type ReportRow,
  sanitizeReportFileName,
} from "@/lib/export/reportPayload";
import { formatReportFooterLeft } from "@/lib/site/reportBrand";

const STATUS_LABEL: Record<EngineeringCheckStatus, string> = {
  pass: "PASS",
  warning: "WARNING",
  fail: "FAIL",
  not_available: "N/A",
  indicative: "INDICATIVE",
};

const HEADER_FILL: import("exceljs").Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF232D3C" },
};

const HEADER_FONT: Partial<import("exceljs").Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
};

type Worksheet = import("exceljs").Worksheet;
type Workbook = import("exceljs").Workbook;

function styleHeaderRow(sheet: Worksheet, rowNumber: number, columnCount: number) {
  for (let col = 1; col <= columnCount; col += 1) {
    const cell = sheet.getRow(rowNumber).getCell(col);
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: "middle", wrapText: true };
  }
  sheet.getRow(rowNumber).height = 22;
}

function writeDataTable(sheet: Worksheet, startRow: number, rows: ReportRow[]): number {
  const headers = ["Parameter", "Value", "Unit", "Notes"];
  sheet.getRow(startRow).values = headers;
  styleHeaderRow(sheet, startRow, headers.length);

  rows.forEach((row, idx) => {
    const r = startRow + 1 + idx;
    sheet.getRow(r).values = [row.parameter, row.value, row.unit ?? "", row.notes ?? ""];
    if (idx % 2 === 1) {
      for (let col = 1; col <= 4; col += 1) {
        sheet.getRow(r).getCell(col).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF4F6F9" },
        };
      }
    }
  });

  sheet.columns = [
    { width: 32 },
    { width: 22 },
    { width: 12 },
    { width: 28 },
  ];
  sheet.views = [{ state: "frozen", ySplit: startRow }];

  return startRow + rows.length;
}

function addBrandedFooter(sheet: Worksheet, row: number, payload: ReportPayload) {
  sheet.mergeCells(row, 1, row, 4);
  const cell = sheet.getCell(row, 1);
  cell.value = `${formatReportFooterLeft(payload.siteUrl)} · Generated ${payload.generatedAt.local}`;
  cell.font = { size: 9, color: { argb: "FF808080" }, italic: true };
}

function buildReportSheet(workbook: Workbook, payload: ReportPayload) {
  const sheet = workbook.addWorksheet("Report", {
    views: [{ showGridLines: false }],
  });

  let row = 1;
  sheet.getCell(row, 1).value = payload.moduleTitle;
  sheet.getCell(row, 1).font = { bold: true, size: 16 };
  row += 1;

  sheet.getCell(row, 1).value = `${payload.productName} — ${payload.tagline}`;
  sheet.getCell(row, 1).font = { size: 11, color: { argb: "FF505050" } };
  row += 1;

  sheet.getCell(row, 1).value = payload.siteUrl;
  sheet.getCell(row, 1).font = { size: 10, color: { argb: "FF0066CC" }, underline: true };
  row += 2;

  const metaRows: [string, string][] = [
    ["Project", payload.meta.project ?? "—"],
    ["Engineer", payload.meta.engineer ?? "—"],
    ["Revision", payload.meta.revision ?? "A"],
    ["Date", `${payload.generatedAt.isoDate} (${payload.generatedAt.local})`],
    ["Design code", payload.spec?.designCode ?? "—"],
    ["Validation", payload.spec?.validationStatus ?? "indicative"],
    ["Engine version", payload.spec?.engineVersion ?? "—"],
    ["Support", payload.supportEmail],
  ];

  metaRows.forEach(([label, value]) => {
    sheet.getCell(row, 1).value = label;
    sheet.getCell(row, 1).font = { bold: true, size: 10 };
    sheet.getCell(row, 2).value = value;
    sheet.getCell(row, 2).font = { size: 10 };
    row += 1;
  });

  row += 1;
  sheet.mergeCells(row, 1, row + 2, 2);
  sheet.getCell(row, 1).value = payload.disclaimer;
  sheet.getCell(row, 1).font = { size: 9, color: { argb: "FF666666" }, italic: true };
  sheet.getCell(row, 1).alignment = { wrapText: true, vertical: "top" };

  sheet.columns = [{ width: 22 }, { width: 48 }];
  addBrandedFooter(sheet, row + 4, payload);
}

function buildSimpleListSheet(
  workbook: Workbook,
  name: string,
  title: string,
  items: string[],
  payload: ReportPayload
) {
  const sheet = workbook.addWorksheet(name);
  sheet.getCell(1, 1).value = title;
  sheet.getCell(1, 1).font = { bold: true, size: 12 };
  items.forEach((item, idx) => {
    sheet.getCell(idx + 2, 1).value = item;
    sheet.getCell(idx + 2, 1).alignment = { wrapText: true };
  });
  sheet.getColumn(1).width = 80;
  addBrandedFooter(sheet, items.length + 3, payload);
}

function buildChecksSheet(workbook: Workbook, payload: ReportPayload) {
  const spec = payload.spec;
  if (!spec?.checks.length) return;

  const sheet = workbook.addWorksheet("Checks");
  if (payload.checkSummary) {
    sheet.getCell(1, 1).value = formatCheckSummaryText(payload.checkSummary);
    sheet.getCell(1, 1).font = { bold: true, size: 11 };
  }

  const startRow = payload.checkSummary ? 3 : 1;
  const headers = ["Check", "Status", "Value", "Limit", "Unit", "Reference"];
  sheet.getRow(startRow).values = headers;
  styleHeaderRow(sheet, startRow, headers.length);

  spec.checks.forEach((check, idx) => {
    const r = startRow + 1 + idx;
    sheet.getRow(r).values = [
      check.label,
      STATUS_LABEL[check.status],
      check.value != null ? formatReportValue(check.value) : "—",
      check.limit != null ? formatReportValue(check.limit) : "—",
      check.unit ?? "",
      check.standardRef
        ? `${check.standardRef.document}${check.standardRef.clause ? ` ${check.standardRef.clause}` : ""}`
        : "—",
    ];
  });

  sheet.columns = [
    { width: 34 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 10 },
    { width: 36 },
  ];
  sheet.views = [{ state: "frozen", ySplit: startRow }];
  addBrandedFooter(sheet, startRow + spec.checks.length + 2, payload);
}

function buildFormulasSheet(workbook: Workbook, payload: ReportPayload) {
  const equations = payload.spec?.equations ?? [];
  if (!equations.length) return;

  const sheet = workbook.addWorksheet("Formulas");
  const headers = ["Quantity", "Expression", "Notes"];
  sheet.getRow(1).values = headers;
  styleHeaderRow(sheet, 1, headers.length);

  equations.forEach((eq, idx) => {
    sheet.getRow(idx + 2).values = [eq.label, eq.expression, eq.description ?? ""];
  });

  sheet.columns = [{ width: 28 }, { width: 40 }, { width: 36 }];
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  addBrandedFooter(sheet, equations.length + 3, payload);
}

function buildChartDataSheet(workbook: Workbook, payload: ReportPayload) {
  if (!payload.plotData.length) return;

  const sheet = workbook.addWorksheet("Chart data");
  let row = 1;

  payload.plotData.forEach((plot, plotIdx) => {
    if (plotIdx > 0) row += 2;
    sheet.getCell(row, 1).value = plot.title ?? `Chart ${plotIdx + 1}`;
    sheet.getCell(row, 1).font = { bold: true, size: 12 };
    row += 1;

    row = writePlotTable(sheet, row, plot);
  });

  addBrandedFooter(sheet, row + 1, payload);
}

function writePlotTable(sheet: Worksheet, startRow: number, plot: PlotDataExport): number {
  const xHeader =
    plot.xLabel && plot.xUnit
      ? `${plot.xLabel} (${plot.xUnit})`
      : plot.xLabel ?? "x";

  const headers = [xHeader, ...plot.series.map((s) =>
    s.unitLabel ? `${s.label} (${s.unitLabel})` : s.label
  )];

  sheet.getRow(startRow).values = headers;
  styleHeaderRow(sheet, startRow, headers.length);

  const rowCount = Math.max(plot.x.length, ...plot.series.map((s) => s.y.length));
  for (let i = 0; i < rowCount; i += 1) {
    const values: (string | number)[] = [
      plot.x[i] != null ? formatReportValue(plot.x[i]) : "",
      ...plot.series.map((s) =>
        s.y[i] != null ? formatReportValue(s.y[i]) : ""
      ),
    ];
    sheet.getRow(startRow + 1 + i).values = values;
  }

  headers.forEach((_, idx) => {
    sheet.getColumn(idx + 1).width = 18;
  });

  return startRow + rowCount;
}

function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

async function buildChartsSheet(workbook: Workbook, payload: ReportPayload) {
  if (!payload.chartImages.length) return;

  const sheet = workbook.addWorksheet("Charts");
  let row = 1;

  for (const [idx, img] of payload.chartImages.entries()) {
    if (idx > 0) row += 2;
    if (img.caption) {
      sheet.getCell(row, 1).value = img.caption;
      sheet.getCell(row, 1).font = { bold: true, size: 11 };
      row += 1;
    }

    const imageId = workbook.addImage({
      base64: dataUrlToBase64(img.dataUrl),
      extension: "png",
    });

    const displayWidth = 520;
    const displayHeight = Math.round(
      (img.heightPx / Math.max(img.widthPx, 1)) * displayWidth
    );

    sheet.addImage(imageId, {
      tl: { col: 0, row: row - 1 },
      ext: { width: displayWidth, height: displayHeight },
    });

    row += Math.ceil(displayHeight / 18) + 1;
  }

  sheet.getColumn(1).width = 80;
  addBrandedFooter(sheet, row + 1, payload);
}

export async function generateStructuredReportExcel(payload: ReportPayload): Promise<void> {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = payload.productName;
  workbook.created = new Date();

  buildReportSheet(workbook, payload);

  if (payload.inputRows.length > 0) {
    const sheet = workbook.addWorksheet("Inputs");
    writeDataTable(sheet, 1, payload.inputRows);
    addBrandedFooter(sheet, payload.inputRows.length + 3, payload);
  }

  if (payload.resultRows.length > 0) {
    const sheet = workbook.addWorksheet("Results");
    writeDataTable(sheet, 1, payload.resultRows);
    addBrandedFooter(sheet, payload.resultRows.length + 3, payload);
  }

  if (payload.spec?.method) {
    const sheet = workbook.addWorksheet("Method");
    sheet.getCell(1, 1).value = "Calculation method";
    sheet.getCell(1, 1).font = { bold: true, size: 12 };
    sheet.getCell(2, 1).value = payload.spec.method;
    sheet.getCell(2, 1).alignment = { wrapText: true };
    sheet.getColumn(1).width = 90;
    addBrandedFooter(sheet, 4, payload);
  }

  buildChecksSheet(workbook, payload);
  buildFormulasSheet(workbook, payload);

  const standards = payload.spec?.standards ?? [];
  if (standards.length) {
    buildSimpleListSheet(
      workbook,
      "Standards",
      "Standards basis",
      standards.map(
        (s) =>
          `${s.body} ${s.document}${s.clause ? `, ${s.clause}` : ""}${s.edition ? ` (${s.edition})` : ""}${s.note ? ` — ${s.note}` : ""}`
      ),
      payload
    );
  }

  buildChartDataSheet(workbook, payload);
  await buildChartsSheet(workbook, payload);

  const assumptions = payload.spec?.assumptions ?? [];
  if (assumptions.length) {
    buildSimpleListSheet(workbook, "Assumptions", "Assumptions", assumptions, payload);
  }

  const limitations = payload.spec?.limitations ?? [];
  if (limitations.length) {
    buildSimpleListSheet(workbook, "Limitations", "Limitations", limitations, payload);
  }

  if (payload.meta.notes?.trim()) {
    buildSimpleListSheet(workbook, "Notes", "Report notes", [payload.meta.notes.trim()], payload);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeReportFileName(payload.fileName)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
