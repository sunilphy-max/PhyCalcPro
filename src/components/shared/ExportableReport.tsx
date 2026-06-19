"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useCalculatorReportOptional } from "@/contexts/CalculatorReportContext";
import EngineeringChecksPanel from "@/components/shared/EngineeringChecksPanel";
import CalculationBasisPanel from "@/components/shared/CalculationBasisPanel";
import { buildCsvRowsFromResult, mergeCsvRows, type CsvRow } from "@/lib/export/csvRows";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ModuleQualityChecklist } from "@/lib/calculation/qualityChecklist";
import type { ReportMeta } from "@/lib/export/structuredReport";

type Props = {
  fileName: string;
  /** When set, enables standard quality checklist and default CSV rows from result. */
  moduleId?: string;
  title?: string;
  description?: string;
  csvRows?: CsvRow[];
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
  const mergedCsv = useMemo(
    () => mergeCsvRows(buildCsvRowsFromResult(result ?? undefined), csvRows),
    [result, csvRows]
  );

  useEffect(() => {
    if (!reportContext || !moduleId) return;

    reportContext.registerReport({
      reportRef,
      fileName,
      title,
      description,
      csvRows: mergedCsv,
      calculationSpec,
      reportMeta,
      qualityOverrides,
      showQualityChecklist,
    });

    return () => reportContext.unregisterReport();
  }, [
    reportContext,
    moduleId,
    fileName,
    title,
    description,
    mergedCsv,
    calculationSpec,
    reportMeta,
    qualityOverrides,
    showQualityChecklist,
  ]);

  return (
    <div className={className}>
      <div ref={reportRef} className="space-y-6 export-report-content">
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
