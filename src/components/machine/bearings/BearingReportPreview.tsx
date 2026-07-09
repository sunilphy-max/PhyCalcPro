"use client";

import type { ReportRow } from "@/lib/export/reportPayload";
import CalculatorExportButton from "@/components/calculator/CalculatorExportButton";

type Props = {
  inputRows: ReportRow[];
  hasResult: boolean;
};

const REPORT_SECTIONS = [
  "Project metadata and calculation standard",
  "Input summary (loads, speed, life target, lubrication)",
  "Catalog designation and geometry",
  "ISO 281 equivalent load P and static P₀",
  "Basic L10 and modified Lnm life with κ, eC, aISO",
  "Static safety, speed margin, and min-load checks",
  "Pass / marginal / fail summary",
  "Life vs load and sensitivity charts (when captured)",
  "Engineering assumptions and disclaimer",
];

export default function BearingReportPreview({ inputRows, hasResult }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Professional bearing report (PDF)</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Structured PDF export with inputs, equations, life calculations, safety checks, and charts.
        </p>
      </div>

      <ul className="list-inside list-disc space-y-1 text-xs text-slate-600 dark:text-slate-300">
        {REPORT_SECTIONS.map((section) => (
          <li key={section}>{section}</li>
        ))}
      </ul>

      {inputRows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 font-semibold">Parameter</th>
                <th className="px-3 py-2 font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {inputRows.slice(0, 12).map((row) => (
                <tr key={row.parameter} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400">{row.parameter}</td>
                  <td className="px-3 py-1.5 font-medium text-slate-900 dark:text-white">
                    {row.value}
                    {row.unit ? ` ${row.unit}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inputRows.length > 12 ? (
            <p className="px-3 py-2 text-xs text-slate-500">+ {inputRows.length - 12} more rows in PDF</p>
          ) : null}
        </div>
      ) : null}

      {hasResult ? (
        <CalculatorExportButton />
      ) : (
        <p className="text-xs text-slate-500">Run calculate to enable PDF export with full results.</p>
      )}
    </div>
  );
}
