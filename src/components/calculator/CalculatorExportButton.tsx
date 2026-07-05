"use client";

import Link from "next/link";
import { useEntitlement } from "@/contexts/EntitlementContext";
import { useCalculatorReportOptional } from "@/contexts/CalculatorReportContext";
import { calculatorSecondaryButtonClass } from "./styles";

type Props = {
  className?: string;
};

/** Compact PDF and Excel export — sits beside the calculate action in the input column. */
export default function CalculatorExportButton({ className }: Props) {
  const report = useCalculatorReportOptional();
  const { unlockAllFeatures, isMonetizationEnabled } = useEntitlement();

  if (!report?.registered) return null;

  const {
    exportPdf,
    exportExcel,
    reportEnabled,
    exporting,
    exportingPdf,
    exportingExcel,
    statusMessage,
    statusTone,
  } = report;

  return (
    <div className={className}>
      <div className="flex flex-wrap items-start gap-2">
        <button
          type="button"
          onClick={() => void exportPdf()}
          disabled={exporting || !reportEnabled}
          title={
            reportEnabled
              ? "Export structured calculation report as PDF"
              : "PDF export requires a Pro license"
          }
          className={`${calculatorSecondaryButtonClass} shrink-0 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {exportingPdf ? "Exporting PDF…" : reportEnabled ? "Export PDF" : "PDF (Pro)"}
        </button>
        <button
          type="button"
          onClick={() => void exportExcel()}
          disabled={exporting || !reportEnabled}
          title={
            reportEnabled
              ? "Export structured calculation report as Excel (.xlsx)"
              : "Excel export requires a Pro license"
          }
          className={`${calculatorSecondaryButtonClass} shrink-0 px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {exportingExcel ? "Exporting Excel…" : reportEnabled ? "Export Excel" : "Excel (Pro)"}
        </button>
      </div>
      {isMonetizationEnabled && !reportEnabled ? (
        <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
          <p>
            PDF and Excel reports with engineering checks and charts are included in{" "}
            <Link href="/pricing" className="font-semibold underline">
              Pro
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={unlockAllFeatures}
            className="rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          >
            Unlock for validation
          </button>
        </div>
      ) : null}
      {statusMessage ? (
        <p
          className={`mt-1.5 text-xs ${
            statusTone === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
