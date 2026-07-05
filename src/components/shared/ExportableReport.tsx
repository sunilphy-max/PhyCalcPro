"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useCalculatorReportOptional } from "@/contexts/CalculatorReportContext";
import EngineeringChecksPanel from "@/components/shared/EngineeringChecksPanel";
import CalculationBasisPanel from "@/components/shared/CalculationBasisPanel";
import { buildCsvRowsFromResult, mergeCsvRows, type CsvRow } from "@/lib/export/csvRows";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ModuleQualityChecklist } from "@/lib/calculation/qualityChecklist";
import type { ReportMeta } from "@/lib/export/structuredReport";
import type { ReportRow } from "@/lib/export/reportPayload";

type Props = {
  fileName: string;
  /** When set, enables standard quality checklist and default CSV rows from result. */
  moduleId?: string;
  title?: string;
  description?: string;
  csvRows?: CsvRow[];
  inputRows?: ReportRow[];
  calculationSpec?: CalculationSpec | null;
  result?: Record<string, unknown> | null;
  qualityOverrides?: Partial<ModuleQualityChecklist>;
  showQualityChecklist?: boolean;
  /** Title block metadata (project, engineer, revision) for the PDF report */
  reportMeta?: ReportMeta;
  children: ReactNode;
  className?: string;
};

export default function ExportableReport({
  fileName,
  moduleId,
  title,
  description,
  csvRows,
  inputRows,
  calculationSpec,
  result,
  qualityOverrides,
  showQualityChecklist = true,
  reportMeta,
  children,
  className = "space-y-6",
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const reportContext = useCalculatorReportOptional();
  const registerReport = reportContext?.registerReport;
  const unregisterReport = reportContext?.unregisterReport;
  const mergedCsv = useMemo(
    () => mergeCsvRows(buildCsvRowsFromResult(result ?? undefined), csvRows),
    [result, csvRows]
  );
  const mergedCsvKey = useMemo(() => JSON.stringify(mergedCsv), [mergedCsv]);
  const calculationSpecKey = useMemo(
    () => JSON.stringify(calculationSpec ?? null),
    [calculationSpec]
  );
  const qualityOverridesKey = useMemo(
    () => JSON.stringify(qualityOverrides ?? null),
    [qualityOverrides]
  );
  const reportMetaKey = useMemo(
    () => JSON.stringify(reportMeta ?? null),
    [reportMeta]
  );
  const inputRowsKey = useMemo(
    () => JSON.stringify(inputRows ?? null),
    [inputRows]
  );

  useEffect(() => {
    if (!registerReport || !moduleId) return;

    registerReport({
      reportRef,
      fileName,
      title,
      description,
      csvRows: mergedCsv,
      inputRows,
      calculationSpec,
      reportMeta,
      qualityOverrides,
      showQualityChecklist,
    });

    return () => unregisterReport?.();
  }, [
    registerReport,
    unregisterReport,
    moduleId,
    fileName,
    title,
    description,
    mergedCsvKey,
    inputRowsKey,
    calculationSpecKey,
    reportMetaKey,
    qualityOverridesKey,
    showQualityChecklist,
  ]);

  return (
    <div className={`min-w-0 ${className}`.trim()}>
      <div ref={reportRef} className="min-w-0 space-y-6 export-report-content">
        {calculationSpec ? (
          <>
            <EngineeringChecksPanel spec={calculationSpec} />
            <CalculationBasisPanel spec={calculationSpec} />
          </>
        ) : null}
        {children}
      </div>
    </div>
  );
}
