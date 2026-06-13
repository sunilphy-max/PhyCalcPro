import type { CalculationSpec, EngineeringCheckStatus } from "@/lib/standards/types";
import type { CsvRow } from "@/lib/export/csvRows";

export type ReportMeta = {
  project?: string;
  engineer?: string;
  revision?: string;
  notes?: string;
};

export type ReportChartImage = {
  dataUrl: string;
  widthPx: number;
  heightPx: number;
  caption?: string;
};

export type StructuredReportOptions = {
  fileName: string;
  moduleTitle: string;
  meta?: ReportMeta;
  spec?: CalculationSpec | null;
  /** Result rows (typically { metric, value } or richer objects) */
  resultRows?: CsvRow[];
  chartImages?: ReportChartImage[];
};

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - 2 * MARGIN;

const STATUS_LABEL: Record<EngineeringCheckStatus, string> = {
  pass: "PASS",
  warning: "WARNING",
  fail: "FAIL",
  not_available: "N/A",
  indicative: "INDICATIVE",
};

const STATUS_COLOR: Record<EngineeringCheckStatus, [number, number, number]> = {
  pass: [22, 130, 70],
  warning: [200, 130, 0],
  fail: [190, 30, 30],
  not_available: [120, 120, 120],
  indicative: [70, 100, 180],
};

function formatCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return String(value);
    const abs = Math.abs(value);
    if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) return value.toExponential(4);
    return Number(value.toPrecision(6)).toString();
  }
  return String(value);
}

type Doc = import("jspdf").jsPDF;

class ReportWriter {
  y = MARGIN;

  constructor(private doc: Doc) {}

  ensureSpace(height: number) {
    if (this.y + height > PAGE_H - MARGIN - 8) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  sectionTitle(text: string) {
    this.ensureSpace(12);
    this.y += 4;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(20, 20, 20);
    this.doc.text(text, MARGIN, this.y);
    this.y += 1.5;
    this.doc.setDrawColor(60, 60, 60);
    this.doc.setLineWidth(0.4);
    this.doc.line(MARGIN, this.y, MARGIN + CONTENT_W, this.y);
    this.y += 5;
  }

  paragraph(text: string, options?: { size?: number; color?: [number, number, number] }) {
    const size = options?.size ?? 9;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(size);
    const [r, g, b] = options?.color ?? [40, 40, 40];
    this.doc.setTextColor(r, g, b);
    const lines = this.doc.splitTextToSize(text, CONTENT_W) as string[];
    for (const line of lines) {
      this.ensureSpace(4.5);
      this.doc.text(line, MARGIN, this.y);
      this.y += 4.2;
    }
    this.y += 1;
  }

  bulletList(items: string[]) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(40, 40, 40);
    for (const item of items) {
      const lines = this.doc.splitTextToSize(item, CONTENT_W - 5) as string[];
      this.ensureSpace(lines.length * 4.2 + 1);
      this.doc.text("\u2022", MARGIN + 1, this.y);
      lines.forEach((line, idx) => {
        this.doc.text(line, MARGIN + 5, this.y);
        if (idx < lines.length - 1) this.y += 4.2;
      });
      this.y += 4.6;
    }
    this.y += 1;
  }

  table(headers: string[], rows: string[][], columnWidths?: number[], statusColumn?: number, statuses?: EngineeringCheckStatus[]) {
    const widths =
      columnWidths ?? headers.map(() => CONTENT_W / headers.length);
    const rowHeight = 6;

    const drawHeader = () => {
      this.ensureSpace(rowHeight + 2);
      this.doc.setFillColor(35, 45, 60);
      this.doc.rect(MARGIN, this.y - 4, CONTENT_W, rowHeight, "F");
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(8);
      this.doc.setTextColor(255, 255, 255);
      let x = MARGIN + 2;
      headers.forEach((h, i) => {
        this.doc.text(h, x, this.y);
        x += widths[i]!;
      });
      this.y += rowHeight;
    };

    drawHeader();
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);

    rows.forEach((row, rowIdx) => {
      // Measure wrapped height for the row
      const cellLines = row.map((cell, i) =>
        this.doc.splitTextToSize(cell, widths[i]! - 4) as string[]
      );
      const lineCount = Math.max(1, ...cellLines.map((l) => l.length));
      const h = lineCount * 3.8 + 2.2;

      if (this.y + h > PAGE_H - MARGIN - 8) {
        this.doc.addPage();
        this.y = MARGIN;
        drawHeader();
        this.doc.setFont("helvetica", "normal");
        this.doc.setFontSize(8);
      }

      if (rowIdx % 2 === 1) {
        this.doc.setFillColor(244, 246, 249);
        this.doc.rect(MARGIN, this.y - 4, CONTENT_W, h, "F");
      }

      let x = MARGIN + 2;
      cellLines.forEach((lines, i) => {
        if (statusColumn === i && statuses?.[rowIdx]) {
          const [r, g, b] = STATUS_COLOR[statuses[rowIdx]!];
          this.doc.setTextColor(r, g, b);
          this.doc.setFont("helvetica", "bold");
        } else {
          this.doc.setTextColor(40, 40, 40);
          this.doc.setFont("helvetica", "normal");
        }
        lines.forEach((line, li) => {
          this.doc.text(line, x, this.y + li * 3.8);
        });
        x += widths[i]!;
      });
      this.y += h;
    });
    this.y += 2;
  }

  image(img: ReportChartImage) {
    const drawW = CONTENT_W;
    const drawH = (img.heightPx / Math.max(img.widthPx, 1)) * drawW;
    this.ensureSpace(drawH + (img.caption ? 7 : 2));
    this.doc.addImage(img.dataUrl, "PNG", MARGIN, this.y - 3, drawW, drawH);
    this.y += drawH;
    if (img.caption) {
      this.doc.setFont("helvetica", "italic");
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(img.caption, MARGIN, this.y);
      this.y += 5;
    }
    this.y += 2;
  }
}

function drawTitleBlock(doc: Doc, writer: ReportWriter, options: StructuredReportOptions) {
  const { moduleTitle, meta, spec } = options;
  const boxH = 30;
  doc.setDrawColor(35, 45, 60);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN, writer.y - 4, CONTENT_W, boxH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(20, 20, 20);
  doc.text(moduleTitle, MARGIN + 4, writer.y + 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const left = [
    `Project: ${meta?.project ?? "—"}`,
    `Engineer: ${meta?.engineer ?? "—"}`,
    `Revision: ${meta?.revision ?? "A"}`,
  ];
  const right = [
    `Date: ${new Date().toISOString().slice(0, 10)}`,
    `Design code: ${spec?.designCode ?? "—"}`,
    `Engine: PhyCalcPro ${spec?.engineVersion ?? ""} (${spec?.validationStatus ?? "indicative"})`,
  ];
  left.forEach((line, i) => doc.text(line, MARGIN + 4, writer.y + 10 + i * 4.5));
  right.forEach((line, i) => doc.text(line, MARGIN + CONTENT_W / 2 + 4, writer.y + 10 + i * 4.5));

  writer.y += boxH + 4;
}

function addFooters(doc: Doc) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `Generated by PhyCalcPro — ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC`,
      MARGIN,
      PAGE_H - 7
    );
    doc.text(`Page ${i} of ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 7, { align: "right" });
  }
}

/**
 * Structured calculation report: title block, method, results tables,
 * pass/fail code checks with clause references, key formulas, assumptions
 * and vector-quality chart snapshots — replaces the screenshot pipeline.
 */
export async function generateStructuredReportPdf(options: StructuredReportOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const writer = new ReportWriter(doc);

  drawTitleBlock(doc, writer, options);

  const spec = options.spec ?? null;

  if (spec?.method) {
    writer.sectionTitle("Method");
    writer.paragraph(spec.method);
  }

  if (options.resultRows && options.resultRows.length > 0) {
    writer.sectionTitle("Results");
    const headers = Object.keys(options.resultRows[0]!);
    const rows = options.resultRows.map((row) => headers.map((h) => formatCell(row[h])));
    const firstColW = CONTENT_W * 0.45;
    const restW = (CONTENT_W - firstColW) / Math.max(headers.length - 1, 1);
    writer.table(
      headers.map((h) => h.charAt(0).toUpperCase() + h.slice(1)),
      rows,
      [firstColW, ...headers.slice(1).map(() => restW)]
    );
  }

  if (spec && spec.checks.length > 0) {
    writer.sectionTitle(`Engineering checks (${spec.designCode})`);
    const headers = ["Check", "Status", "Value", "Limit", "Unit", "Reference"];
    const widths = [
      CONTENT_W * 0.26,
      CONTENT_W * 0.13,
      CONTENT_W * 0.12,
      CONTENT_W * 0.12,
      CONTENT_W * 0.08,
      CONTENT_W * 0.29,
    ];
    const rows = spec.checks.map((check) => [
      check.label,
      STATUS_LABEL[check.status],
      check.value != null ? formatCell(check.value) : "—",
      check.limit != null ? formatCell(check.limit) : "—",
      check.unit ?? "",
      check.standardRef
        ? `${check.standardRef.document}${check.standardRef.clause ? ` ${check.standardRef.clause}` : ""}`
        : "—",
    ]);
    writer.table(headers, rows, widths, 1, spec.checks.map((c) => c.status));
  }

  if (spec && spec.equations.length > 0) {
    writer.sectionTitle("Key formulas");
    const rows = spec.equations.map((eq) => [eq.label, eq.expression, eq.description ?? ""]);
    writer.table(
      ["Quantity", "Expression", "Notes"],
      rows,
      [CONTENT_W * 0.25, CONTENT_W * 0.4, CONTENT_W * 0.35]
    );
  }

  if (spec && spec.standards.length > 0) {
    writer.sectionTitle("Standards basis");
    writer.bulletList(
      spec.standards.map(
        (s) =>
          `${s.body} ${s.document}${s.clause ? `, ${s.clause}` : ""}${s.edition ? ` (${s.edition})` : ""}${s.note ? ` — ${s.note}` : ""}`
      )
    );
  }

  if (options.chartImages && options.chartImages.length > 0) {
    writer.sectionTitle("Charts");
    for (const img of options.chartImages) {
      writer.image(img);
    }
  }

  if (spec && (spec.assumptions.length > 0 || spec.limitations.length > 0)) {
    if (spec.assumptions.length > 0) {
      writer.sectionTitle("Assumptions");
      writer.bulletList(spec.assumptions);
    }
    if (spec.limitations.length > 0) {
      writer.sectionTitle("Limitations");
      writer.bulletList(spec.limitations);
    }
  }

  addFooters(doc);

  const safeName =
    options.fileName.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "report";
  doc.save(`${safeName}.pdf`);
}
