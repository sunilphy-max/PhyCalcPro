"use client";

import type { ReportRow } from "@/lib/export/reportPayload";
import CalculatorExportButton from "@/components/calculator/CalculatorExportButton";

type Props = {
  title: string;
  description: string;
  sections: string[];
  inputRows: ReportRow[];
  hasResult: boolean;
};

export default function ModuleReportPreview({
  title,
  description,
  sections,
  inputRows,
  hasResult,
}: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      <ul className="list-inside list-disc space-y-1 text-xs text-slate-600 dark:text-slate-300">
        {sections.map((section) => (
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
