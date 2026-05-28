"use client";

import { useRef, type ReactNode } from "react";
import ResultExportControls from "@/components/ResultExportControls";
import EngineeringChecksPanel from "@/components/shared/EngineeringChecksPanel";
import CalculationBasisPanel from "@/components/shared/CalculationBasisPanel";
import type { CalculationSpec } from "@/lib/standards/types";

type CSVRow = Record<string, string | number | null | undefined>;

type Props = {
  fileName: string;
  title?: string;
  description?: string;
  csvRows?: CSVRow[];
  calculationSpec?: CalculationSpec | null;
  children: ReactNode;
  className?: string;
  showControlsWhenEmpty?: boolean;
};

export default function ExportableReport({
  fileName,
  title,
  description,
  csvRows,
  calculationSpec,
  children,
  className = "space-y-6",
  showControlsWhenEmpty = true,
}: Props) {
  const reportRef = useRef<HTMLDivElement>(null);

  return (
    <div className={className}>
      {showControlsWhenEmpty ? (
        <ResultExportControls
          reportRef={reportRef}
          fileName={fileName}
          title={title}
          description={description}
          csvRows={csvRows}
        />
      ) : null}
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
