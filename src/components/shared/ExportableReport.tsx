"use client";

import { useRef, type ReactNode } from "react";
import ResultExportControls from "@/components/ResultExportControls";
import EngineeringChecksPanel from "@/components/shared/EngineeringChecksPanel";
import CalculationBasisPanel from "@/components/shared/CalculationBasisPanel";
import CalculationQualityChecklist from "@/components/shared/CalculationQualityChecklist";
import { getModuleQualityChecklist } from "@/lib/calculation/moduleQualityDefaults";
import { buildCsvRowsFromResult, mergeCsvRows, type CsvRow } from "@/lib/export/csvRows";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ModuleQualityChecklist } from "@/lib/calculation/qualityChecklist";
import type { ReportMeta } from "@/lib/export/structuredReport";
import { allModules } from "@/data/modules";

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
  showControlsWhenEmpty?: boolean;
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
  showControlsWhenEmpty = true,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const mergedCsv = mergeCsvRows(buildCsvRowsFromResult(result ?? undefined), csvRows);
  const checklist = moduleId ? getModuleQualityChecklist(moduleId, qualityOverrides) : null;
  const moduleTitle = moduleId
    ? allModules.find((m) => m.id === moduleId)?.title
    : undefined;

  return (
    <div className={className}>
      {showControlsWhenEmpty ? (
        <ResultExportControls
          reportRef={reportRef}
          fileName={fileName}
          title={title}
          description={description}
          csvRows={mergedCsv}
          moduleTitle={moduleTitle}
          calculationSpec={calculationSpec}
          reportMeta={reportMeta}
        />
      ) : null}
      <div ref={reportRef} className="space-y-6 export-report-content">
        {calculationSpec ? (
          <>
            <EngineeringChecksPanel spec={calculationSpec} />
            <CalculationBasisPanel spec={calculationSpec} />
          </>
        ) : null}
        {moduleId && showQualityChecklist && checklist ? (
          <CalculationQualityChecklist title="Module quality" checklist={checklist} />
        ) : null}
        {children}
      </div>
    </div>
  );
}
