"use client";

import { useCallback, useState } from "react";
import type { RefObject } from "react";
import { useEntitlement } from "@/contexts/EntitlementContext";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ReportMeta } from "@/lib/export/structuredReport";

type CSVRow = Record<string, string | number | null | undefined>;

export type CalculatorReportExportConfig = {
  reportRef: RefObject<HTMLElement | null>;
  fileName: string;
  title?: string;
  moduleTitle?: string;
  calculationSpec?: CalculationSpec | null;
  reportMeta?: ReportMeta;
  csvRows?: CSVRow[];
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

export function useCalculatorReportExport(config: CalculatorReportExportConfig | null) {
  const { canExportPdf } = useEntitlement();
  const pdfEnabled = canExportPdf();
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"error" | "success">("success");

  const exportPdf = useCallback(async () => {
    if (!pdfEnabled) {
      setStatusTone("error");
      setStatusMessage("PDF export requires a Pro license.");
      return;
    }
    if (!config?.reportRef.current) {
      setStatusTone("error");
      setStatusMessage("Nothing to export yet. Run the calculation first.");
      return;
    }

    setExporting(true);
    setStatusMessage(null);

    try {
      const { collectChartImages, preparePlotsForCapture } = await import("@/lib/export/plotCapture");
      const { generateStructuredReportPdf } = await import("@/lib/export/structuredReport");

      const restorePlots = await preparePlotsForCapture(config.reportRef.current);
      const chartImages = await collectChartImages(config.reportRef.current);
      restorePlots();

      await generateStructuredReportPdf({
        fileName: sanitizeFileName(config.fileName),
        moduleTitle: config.moduleTitle ?? config.title ?? "Calculation report",
        meta: config.reportMeta,
        spec: config.calculationSpec,
        resultRows: config.csvRows,
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
  }, [config, pdfEnabled]);

  const exportCsv = useCallback(() => {
    if (!config?.csvRows || config.csvRows.length === 0) {
      setStatusTone("error");
      setStatusMessage("No CSV data available for this module.");
      return;
    }
    setDownloading(true);
    try {
      downloadCsv(config.fileName, config.csvRows);
      setStatusTone("success");
      setStatusMessage("CSV downloaded.");
    } catch (error) {
      console.error("CSV export error:", error);
      setStatusTone("error");
      setStatusMessage("CSV export failed.");
    } finally {
      setDownloading(false);
    }
  }, [config]);

  const clearStatus = useCallback(() => setStatusMessage(null), []);

  return {
    pdfEnabled,
    exporting,
    downloading,
    statusMessage,
    statusTone,
    exportPdf,
    exportCsv,
    clearStatus,
  };
}
