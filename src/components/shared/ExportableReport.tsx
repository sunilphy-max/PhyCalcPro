"use client";

import { useRef, type ReactNode } from "react";
import ResultExportControls from "@/components/ResultExportControls";

type CSVRow = Record<string, string | number | null | undefined>;

type Props = {
  fileName: string;
  title?: string;
  description?: string;
  csvRows?: CSVRow[];
  children: ReactNode;
  className?: string;
  showControlsWhenEmpty?: boolean;
};

export default function ExportableReport({
  fileName,
  title,
  description,
  csvRows,
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
        {children}
      </div>
    </div>
  );
}
