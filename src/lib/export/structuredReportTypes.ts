export type ReportMeta = {
  project?: string;
  engineer?: string;
  revision?: string;
  notes?: string;
};

export type ReportChartImage = {
  dataUrl: string;
  widthPx: number;
  heightPx: number;
  caption?: string;
};

/** @deprecated Use ReportPayload from reportPayload.ts */
export type StructuredReportOptions = {
  fileName: string;
  moduleTitle: string;
  meta?: ReportMeta;
  spec?: import("@/lib/standards/types").CalculationSpec | null;
  resultRows?: import("@/lib/export/csvRows").CsvRow[];
  chartImages?: ReportChartImage[];
};
