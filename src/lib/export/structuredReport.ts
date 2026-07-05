import type { EngineeringCheckStatus } from "@/lib/standards/types";
import {
  formatCheckSummaryText,
  formatReportValue,
  type ReportPayload,
  type ReportRow,
  sanitizeReportFileName,
} from "@/lib/export/reportPayload";
import {
  formatReportFooterLeft,
  formatReportFooterRight,
} from "@/lib/site/reportBrand";
import type { ReportChartImage } from "@/lib/export/structuredReportTypes";

export type { ReportChartImage, ReportMeta } from "@/lib/export/structuredReportTypes";

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 15;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const FOOTER_Y = PAGE_H - 7;

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

type Doc = import("jspdf").jsPDF;

class ReportWriter {
  y = MARGIN;
  sectionNumber = 0;

  constructor(private doc: Doc) {}

  ensureSpace(height: number) {
    if (this.y + height > PAGE_H - MARGIN - 12) {
      this.doc.addPage();
      this.y = MARGIN;
    }
  }

  sectionTitle(text: string) {
    this.sectionNumber += 1;
    const title = `${this.sectionNumber}. ${text}`;
    this.ensureSpace(12);
    this.y += 4;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(20, 20, 20);
    this.doc.text(title, MARGIN, this.y);
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

  dataTable(rows: ReportRow[]) {
    this.table(
      ["Parameter", "Value", "Unit", "Notes"],
      rows.map((row) => [row.parameter, row.value, row.unit ?? "", row.notes ?? ""]),
      [CONTENT_W * 0.35, CONTENT_W * 0.3, CONTENT_W * 0.12, CONTENT_W * 0.23]
    );
  }

  table(
    headers: string[],
    rows: string[][],
    columnWidths?: number[],
    statusColumn?: number,
    statuses?: EngineeringCheckStatus[]
  ) {
    const widths = columnWidths ?? headers.map(() => CONTENT_W / headers.length);
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
      const cellLines = row.map((cell, i) =>
        this.doc.splitTextToSize(cell, widths[i]! - 4) as string[]
      );
      const lineCount = Math.max(1, ...cellLines.map((l) => l.length));
      const h = lineCount * 3.8 + 2.2;

      if (this.y + h > PAGE_H - MARGIN - 12) {
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

async function loadLogoDataUrl(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const response = await fetch("/phycalcpro-logo.png");
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawTitleBlock(
  doc: Doc,
  writer: ReportWriter,
  payload: ReportPayload,
  logoDataUrl: string | null
) {
  const { moduleTitle, meta, spec, productName, tagline, siteUrl, generatedAt } = payload;
  const boxH = logoDataUrl ? 38 : 32;

  doc.setDrawColor(35, 45, 60);
  doc.setLineWidth(0.5);
  doc.rect(MARGIN, writer.y - 4, CONTENT_W, boxH);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", MARGIN + 3, writer.y - 1, 14, 14);
  }

  const titleX = logoDataUrl ? MARGIN + 20 : MARGIN + 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(moduleTitle, titleX, writer.y + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text(`${productName} — ${tagline}`, titleX, writer.y + 9);
  doc.text(siteUrl, titleX, writer.y + 13);

  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const left = [
    `Project: ${meta.project ?? "—"}`,
    `Engineer: ${meta.engineer ?? "—"}`,
    `Revision: ${meta.revision ?? "A"}`,
  ];
  const right = [
    `Date: ${generatedAt.isoDate} (${generatedAt.local})`,
    `Design code: ${spec?.designCode ?? "—"}`,
    `Engine: ${productName} ${spec?.engineVersion ?? ""} (${spec?.validationStatus ?? "indicative"})`,
  ];
  left.forEach((line, i) => doc.text(line, MARGIN + 4, writer.y + 19 + i * 4.5));
  right.forEach((line, i) =>
    doc.text(line, MARGIN + CONTENT_W / 2 + 4, writer.y + 19 + i * 4.5)
  );

  writer.y += boxH + 3;
  writer.paragraph(payload.disclaimer, { size: 7.5, color: [110, 110, 110] });
  writer.y += 1;
}

function addFooters(doc: Doc, payload: ReportPayload) {
  const pageCount = doc.getNumberOfPages();
  const footerLeft = formatReportFooterLeft(payload.siteUrl);
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    const leftLines = doc.splitTextToSize(footerLeft, CONTENT_W * 0.62) as string[];
    leftLines.forEach((line, idx) => {
      doc.text(line, MARGIN, FOOTER_Y - (leftLines.length - 1 - idx) * 3.2);
    });
    doc.text(formatReportFooterRight(i, pageCount), PAGE_W - MARGIN, FOOTER_Y, { align: "right" });
  }
}

/**
 * Structured calculation report: title block, inputs, method, results,
 * engineering checks, formulas, standards, charts, assumptions/limitations.
 */
export async function generateStructuredReportPdf(payload: ReportPayload): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const writer = new ReportWriter(doc);
  const logoDataUrl = await loadLogoDataUrl();

  drawTitleBlock(doc, writer, payload, logoDataUrl);

  const spec = payload.spec;

  if (payload.inputRows.length > 0) {
    writer.sectionTitle("Input parameters");
    writer.dataTable(payload.inputRows);
  }

  if (spec?.method) {
    writer.sectionTitle("Method");
    writer.paragraph(spec.method);
  }

  if (payload.resultRows.length > 0) {
    writer.sectionTitle("Results");
    writer.dataTable(payload.resultRows);
  }

  if (spec && spec.checks.length > 0) {
    writer.sectionTitle(`Engineering checks (${spec.designCode})`);
    if (payload.checkSummary) {
      writer.paragraph(formatCheckSummaryText(payload.checkSummary), {
        size: 8.5,
        color: [60, 60, 60],
      });
    }
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
      check.value != null ? formatReportValue(check.value) : "—",
      check.limit != null ? formatReportValue(check.limit) : "—",
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

  if (payload.chartImages.length > 0) {
    writer.sectionTitle("Charts & diagrams");
    for (const img of payload.chartImages) {
      writer.image(img);
    }
  }

  if (spec && spec.assumptions.length > 0) {
    writer.sectionTitle("Assumptions");
    writer.bulletList(spec.assumptions);
  }

  if (spec && spec.limitations.length > 0) {
    writer.sectionTitle("Limitations");
    writer.bulletList(spec.limitations);
  }

  if (metaNotes(payload)) {
    writer.sectionTitle("Report notes");
    writer.paragraph(metaNotes(payload)!);
  }

  addFooters(doc, payload);

  doc.save(`${sanitizeReportFileName(payload.fileName)}.pdf`);
}

function metaNotes(payload: ReportPayload): string | null {
  const notes = payload.meta.notes?.trim();
  return notes || null;
}
