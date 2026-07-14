"use client";

import { useCallback, useMemo, useState } from "react";
import type { RefObject } from "react";
import { useDesignWorkflow } from "@/contexts/DesignWorkflowContext";
import { useEntitlement } from "@/contexts/EntitlementContext";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { CalculationSpec } from "@/lib/standards/types";
import type { CsvRow } from "@/lib/export/csvRows";
import {
  buildReportPayload,
  sanitizeReportFileName,
  type ReportRow,
} from "@/lib/export/reportPayload";
import type { ReportMeta } from "@/lib/export/structuredReport";

export type CalculatorReportExportConfig = {
  reportRef: RefObject<HTMLElement | null>;
  fileName: string;
  title?: string;
  moduleTitle?: string;
  calculationSpec?: CalculationSpec | null;
  reportMeta?: ReportMeta;
  csvRows?: CsvRow[];
  inputRows?: ReportRow[];
  reportSections?: import("@/lib/export/reportSections").ReportSection[];
};

function downloadCsv(fileName: string, rows: CsvRow[]) {
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
  link.download = `${sanitizeReportFileName(fileName)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function collectExportPayload(
  config: CalculatorReportExportConfig,
  userInputs: ModuleUserInputs
) {
  const container = config.reportRef.current;
  if (!container) throw new Error("Nothing to export yet. Run the calculation first.");

  const { collectChartImages, collectPlotSeriesData, preparePlotsForCapture } =
    await import("@/lib/export/plotCapture");

  const restorePlots = await preparePlotsForCapture(container);
  const chartImages = await collectChartImages(container);
  const plotData = collectPlotSeriesData(container);
  restorePlots();

  return buildReportPayload({
    fileName: sanitizeReportFileName(config.fileName),
    moduleTitle: config.moduleTitle ?? config.title ?? "Calculation report",
    meta: config.reportMeta,
    spec: config.calculationSpec,
    resultRows: config.csvRows,
    inputRows: config.inputRows,
    sections: config.reportSections,
    userInputs,
    chartImages,
    plotData,
  });
}

export function useCalculatorReportExport(config: CalculatorReportExportConfig | null) {
  const { canExportPdf } = useEntitlement();
  const reportEnabled = canExportPdf();
  const { userInputs, designTargets } = useDesignWorkflow();
  const mergedUserInputs = useMemo(
    () => ({ ...userInputs, ...designTargets }),
    [userInputs, designTargets]
  );

  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"error" | "success">("success");

  const exporting = exportingPdf || exportingExcel;

  const exportPdf = useCallback(async () => {
    if (!reportEnabled) {
      setStatusTone("error");
      setStatusMessage("PDF export requires a Pro license.");
      return;
    }
    if (!config?.reportRef.current) {
      setStatusTone("error");
      setStatusMessage("Nothing to export yet. Run the calculation first.");
      return;
    }

    setExportingPdf(true);
    setStatusMessage(null);

    try {
      const payload = await collectExportPayload(config, mergedUserInputs);
      const { generateStructuredReportPdf } = await import("@/lib/export/structuredReport");
      await generateStructuredReportPdf(payload);
      setStatusTone("success");
      setStatusMessage("PDF report exported.");
    } catch (error) {
      console.error("PDF export error:", error);
      setStatusTone("error");
      setStatusMessage(
        error instanceof Error ? error.message : "PDF export failed. Try again."
      );
    } finally {
      setExportingPdf(false);
    }
  }, [config, mergedUserInputs, reportEnabled]);

  const exportExcel = useCallback(async () => {
    if (!reportEnabled) {
      setStatusTone("error");
      setStatusMessage("Excel export requires a Pro license.");
      return;
    }
    if (!config?.reportRef.current) {
      setStatusTone("error");
      setStatusMessage("Nothing to export yet. Run the calculation first.");
      return;
    }

    setExportingExcel(true);
    setStatusMessage(null);

    try {
      const payload = await collectExportPayload(config, mergedUserInputs);
      const { generateStructuredReportExcel } = await import("@/lib/export/structuredReportExcel");
      await generateStructuredReportExcel(payload);
      setStatusTone("success");
      setStatusMessage("Excel report exported.");
    } catch (error) {
      console.error("Excel export error:", error);
      setStatusTone("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Excel export failed. Try again."
      );
    } finally {
      setExportingExcel(false);
    }
  }, [config, mergedUserInputs, reportEnabled]);

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

  return useMemo(
    () => ({
      reportEnabled,
      pdfEnabled: reportEnabled,
      exporting,
      exportingPdf,
      exportingExcel,
      downloading,
      statusMessage,
      statusTone,
      exportPdf,
      exportExcel,
      exportCsv,
      clearStatus,
    }),
    [
      reportEnabled,
      exporting,
      exportingPdf,
      exportingExcel,
      downloading,
      statusMessage,
      statusTone,
      exportPdf,
      exportExcel,
      exportCsv,
      clearStatus,
    ]
  );
}
