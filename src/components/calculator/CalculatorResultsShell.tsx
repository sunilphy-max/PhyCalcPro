"use client";

import type { ReactNode } from "react";
import ExportableReport from "@/components/shared/ExportableReport";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ModuleQualityChecklist } from "@/lib/calculation/qualityChecklist";
import type { CsvRow } from "@/lib/export/csvRows";

type Props = {
  moduleId: string;
  fileName: string;
  title?: string;
  description?: string;
  calculationSpec?: CalculationSpec | null;
  result?: Record<string, unknown> | null;
  csvRows?: CsvRow[];
  qualityOverrides?: Partial<ModuleQualityChecklist>;
  showQualityChecklist?: boolean;
  children: ReactNode;
  showControlsWhenEmpty?: boolean;
};

/** Standard right column — thin wrapper over ExportableReport with required moduleId. */
export default function CalculatorResultsShell(props: Props) {
  const { moduleId, children, ...rest } = props;
  return (
    <ExportableReport moduleId={moduleId} {...rest}>
      {children}
    </ExportableReport>
  );
}
