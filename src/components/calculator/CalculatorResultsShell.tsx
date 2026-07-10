"use client";

import { useLayoutEffect, type ReactNode } from "react";
import ExportableReport from "@/components/shared/ExportableReport";
import { useCalculatorReportOptional } from "@/contexts/CalculatorReportContext";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ModuleQualityChecklist } from "@/lib/calculation/qualityChecklist";
import type { CsvRow } from "@/lib/export/csvRows";
import type { ReportRow } from "@/lib/export/reportPayload";
import type { ReportMeta } from "@/lib/export/structuredReport";
import CalculatorEmptyResults from "./CalculatorEmptyResults";
import CalculatorResultsPanel from "./CalculatorResultsPanel";

type Props = {
  moduleId: string;
  fileName: string;
  title?: string;
  description?: string;
  calculationSpec?: CalculationSpec | null;
  result?: Record<string, unknown> | null;
  csvRows?: CsvRow[];
  inputRows?: ReportRow[];
  qualityOverrides?: Partial<ModuleQualityChecklist>;
  showQualityChecklist?: boolean;
  /** Title block metadata (project, engineer) for the structured PDF report */
  reportMeta?: ReportMeta;
  children: ReactNode;
  /** Panel heading when results are present */
  heading?: string;
  /** Shown when `empty` is true */
  emptyMessage?: string;
  /** When true, renders standard empty state instead of children */
  empty?: boolean;
  /** Dense results table for modules with many metrics */
  tableVariant?: "default" | "compact";
};

/** Standard results column — export registration + buckling-style results panel. */
export default function CalculatorResultsShell({
  moduleId,
  children,
  heading,
  emptyMessage,
  empty = false,
  tableVariant = "default",
  ...rest
}: Props) {
  const reportContext = useCalculatorReportOptional();

  const setResultsStageActive = reportContext?.setResultsStageActive;

  useLayoutEffect(() => {
    setResultsStageActive?.(!empty);
  }, [empty, setResultsStageActive]);

  return (
    <ExportableReport moduleId={moduleId} {...rest}>
      {empty ? (
        <CalculatorEmptyResults message={emptyMessage} />
      ) : (
        <CalculatorResultsPanel title={heading} tableVariant={tableVariant}>
          {children}
        </CalculatorResultsPanel>
      )}
    </ExportableReport>
  );
}
