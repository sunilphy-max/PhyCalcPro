"use client";

import { useState } from "react";
import type { RefObject } from "react";
import Link from "next/link";
import { useEntitlement } from "@/contexts/EntitlementContext";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ReportMeta } from "@/lib/export/structuredReport";

type CSVRow = Record<string, string | number | null | undefined>;

type Props = {
  reportRef: RefObject<HTMLElement | null>;
  fileName: string;
  title?: string;
  description?: string;
  csvRows?: CSVRow[];
  /** Module title shown in the report title block */
  moduleTitle?: string;
  calculationSpec?: CalculationSpec | null;
  reportMeta?: ReportMeta;
};

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "report";
}

function downloadCsv(fileName: string, rows: CSVRow[]) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")].concat(
    rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const formatted = value != null ? String(value) : "";
          return `"${formatted.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
  ).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFileName(fileName)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ResultExportControls({
  reportRef,
  fileName,
  title = "Export summary",
  description,
  csvRows,
  moduleTitle,
  calculationSpec,
  reportMeta,
}: Props) {
  const { canExportPdf, unlockAllFeatures, isMonetizationEnabled } = useEntitlement();
  const pdfEnabled = canExportPdf();
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"error" | "success">("success");

  const exportPdf = async () => {
    if (!pdfEnabled) {
      setStatusTone("error");
      setStatusMessage("PDF export requires a Pro license.");
      return;
    }
    if (!reportRef.current) {
      setStatusTone("error");
      setStatusMessage("Nothing to export yet. Run the calculation first.");
      return;
    }

    setExporting(true);
    setStatusMessage(null);

    try {
      const { collectChartImages, preparePlotsForCapture } = await import("@/lib/export/plotCapture");
      const { generateStructuredReportPdf } = await import("@/lib/export/structuredReport");

      const restorePlots = await preparePlotsForCapture(reportRef.current);
      const chartImages = await collectChartImages(reportRef.current);
      restorePlots();

      await generateStructuredReportPdf({
        fileName: sanitizeFileName(fileName),
        moduleTitle: moduleTitle ?? title ?? "Calculation report",
        meta: reportMeta,
        spec: calculationSpec,
        resultRows: csvRows,
        chartImages,
      });

      setStatusTone("success");
      setStatusMessage("PDF report exported.");
    } catch (error) {
      console.error("PDF export error:", error);
      setStatusTone("error");
      setStatusMessage(
        error instanceof Error ? error.message : "PDF export failed. Try again."
      );
    } finally {
      setExporting(false);
    }
  };

  const exportCsv = () => {
    if (!csvRows || csvRows.length === 0) {
      setStatusTone("error");
      setStatusMessage("No CSV data available for this module.");
      return;
    }
    setDownloading(true);
    try {
      downloadCsv(fileName, csvRows);
      setStatusTone("success");
      setStatusMessage("CSV downloaded.");
    } catch (error) {
      console.error("CSV export error:", error);
      setStatusTone("error");
      setStatusMessage("CSV export failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportPdf}
            disabled={exporting || !pdfEnabled}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting ? "Exporting PDF…" : pdfEnabled ? "Export PDF" : "PDF (Pro)"}
          </button>
          {csvRows && csvRows.length > 0 ? (
            <button
              type="button"
              onClick={exportCsv}
              disabled={downloading}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? "Downloading…" : "Download CSV"}
            </button>
          ) : null}
        </div>
      </div>
      {isMonetizationEnabled && !pdfEnabled ? (
        <div className="mt-3 space-y-2 text-xs text-slate-600">
          <p>
            PDF reports with engineering checks are included in{" "}
            <Link href="/pricing" className="font-semibold underline">
              Pro
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={unlockAllFeatures}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          >
            Unlock PDF for validation (this browser)
          </button>
        </div>
      ) : null}
      {statusMessage ? (
        <p
          className={`mt-3 text-xs ${
            statusTone === "error" ? "text-red-600" : "text-emerald-700"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
