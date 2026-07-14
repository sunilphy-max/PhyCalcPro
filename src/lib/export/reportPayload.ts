import type { CalculationSpec, EngineeringCheckStatus } from "@/lib/standards/types";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { CsvRow } from "@/lib/export/csvRows";
import {
  formatReportGeneratedAt,
  getReportSiteUrl,
  REPORT_DISCLAIMER,
  REPORT_PRODUCT_NAME,
  REPORT_SUPPORT_EMAIL,
  REPORT_TAGLINE,
} from "@/lib/site/reportBrand";
import type { ReportChartImage, ReportMeta } from "@/lib/export/structuredReportTypes";
import type { ReportSection } from "@/lib/export/reportSections";
import { sectionRowsAsReportRows } from "@/lib/export/reportSections";

export type ReportRow = {
  parameter: string;
  value: string;
  unit?: string;
  notes?: string;
};

export type PlotSeriesExport = {
  label: string;
  y: number[];
  unitLabel?: string;
};

export type PlotDataExport = {
  title?: string;
  x: number[];
  xLabel?: string;
  xUnit?: string;
  yLabel?: string;
  unitLabel?: string;
  series: PlotSeriesExport[];
};

export type CheckSummary = {
  pass: number;
  warning: number;
  fail: number;
  notAvailable: number;
  indicative: number;
};

export type ReportPayload = {
  fileName: string;
  moduleTitle: string;
  meta: ReportMeta;
  spec: CalculationSpec | null;
  inputRows: ReportRow[];
  resultRows: ReportRow[];
  /** Named engineer sections (Design Summary, ISO 281, arrangement, advisor, …). */
  sections: ReportSection[];
  chartImages: ReportChartImage[];
  plotData: PlotDataExport[];
  siteUrl: string;
  productName: string;
  tagline: string;
  supportEmail: string;
  disclaimer: string;
  generatedAt: ReturnType<typeof formatReportGeneratedAt>;
  checkSummary: CheckSummary | null;
};

export type BuildReportPayloadOptions = {
  fileName: string;
  moduleTitle: string;
  meta?: ReportMeta;
  spec?: CalculationSpec | null;
  resultRows?: CsvRow[];
  inputRows?: ReportRow[];
  /** Optional named sections for PDF / Excel structure. */
  sections?: ReportSection[];
  userInputs?: ModuleUserInputs;
  chartImages?: ReportChartImage[];
  plotData?: PlotDataExport[];
};

const SKIP_INPUT_KEYS = new Set([
  "loads",
  "shaftLoads",
  "supports",
  "applicationId",
  "applicationPresetId",
]);

const UNIT_SUFFIX_KEYS: Partial<Record<keyof ModuleUserInputs, keyof ModuleUserInputs>> = {
  length: "lengthUnit",
  columnLength: "lengthUnit",
  width: "lengthUnit",
  height: "lengthUnit",
  thickness: "lengthUnit",
  wireDiameter: "lengthUnit",
  meanDiameter: "lengthUnit",
  freeLength: "lengthUnit",
  deflection: "lengthUnit",
  legLength: "lengthUnit",
  baseRadius: "lengthUnit",
  diameterDriver: "lengthUnit",
  diameterDriven: "lengthUnit",
  centerDistance: "lengthUnit",
  power: "powerUnit",
  torque: "torqueUnit",
  maxForce: "forceUnit",
  bendingMoment: "momentUnit",
  pressure: "pressureUnit",
  E: "stressUnit",
  elasticModulus: "stressUnit",
  modulus: "stressUnit",
  ultimateStrength: "stressUnit",
  allowableStressPa: "stressUnit",
  designMaxStressPa: "stressUnit",
  rpm: "frequencyUnit",
  speedDriver: "frequencyUnit",
  speedDriven: "frequencyUnit",
};

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\bPa\b/g, "Pa")
    .replace(/^./, (c) => c.toUpperCase());
}

export function formatReportValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return String(value);
    const abs = Math.abs(value);
    if (abs !== 0 && (abs >= 1e5 || abs < 1e-3)) return value.toExponential(4);
    return Number(value.toPrecision(6)).toString();
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function resolveUnitForInputKey(
  key: string,
  inputs: ModuleUserInputs
): string | undefined {
  const unitKey = UNIT_SUFFIX_KEYS[key as keyof ModuleUserInputs];
  if (!unitKey) return undefined;
  const unit = inputs[unitKey];
  return typeof unit === "string" ? unit : undefined;
}

export function buildInputRowsFromUserInputs(inputs: ModuleUserInputs): ReportRow[] {
  const rows: ReportRow[] = [];
  for (const [key, value] of Object.entries(inputs)) {
    if (SKIP_INPUT_KEYS.has(key)) continue;
    if (key.endsWith("Unit")) continue;
    if (value == null || value === "") continue;
    if (typeof value === "object") continue;
    rows.push({
      parameter: humanizeKey(key),
      value: formatReportValue(value),
      unit: resolveUnitForInputKey(key, inputs),
    });
  }
  return rows;
}

export function normalizeCsvRow(row: CsvRow): ReportRow {
  const parameter =
    (typeof row.label === "string" && row.label) ||
    (typeof row.metric === "string" && humanizeKey(row.metric)) ||
    "—";
  const unit = typeof row.unit === "string" ? row.unit : undefined;
  const notes = typeof row.notes === "string" ? row.notes : undefined;
  const rawValue = row.value ?? row.result ?? row.amount;
  return {
    parameter,
    value: formatReportValue(rawValue),
    unit,
    notes,
  };
}

export function normalizeResultRows(rows: CsvRow[] | undefined): ReportRow[] {
  if (!rows?.length) return [];
  return rows.map(normalizeCsvRow);
}

export function summarizeChecks(checks: EngineeringCheckStatus[]): CheckSummary {
  const summary: CheckSummary = {
    pass: 0,
    warning: 0,
    fail: 0,
    notAvailable: 0,
    indicative: 0,
  };
  for (const status of checks) {
    switch (status) {
      case "pass":
        summary.pass += 1;
        break;
      case "warning":
        summary.warning += 1;
        break;
      case "fail":
        summary.fail += 1;
        break;
      case "not_available":
        summary.notAvailable += 1;
        break;
      case "indicative":
        summary.indicative += 1;
        break;
      default:
        break;
    }
  }
  return summary;
}

export function formatCheckSummaryText(summary: CheckSummary): string {
  const parts: string[] = [];
  if (summary.pass) parts.push(`${summary.pass} pass`);
  if (summary.warning) parts.push(`${summary.warning} warning`);
  if (summary.fail) parts.push(`${summary.fail} fail`);
  if (summary.indicative) parts.push(`${summary.indicative} indicative`);
  if (summary.notAvailable) parts.push(`${summary.notAvailable} N/A`);
  return parts.length ? parts.join(" · ") : "No checks recorded";
}

export function buildReportPayload(options: BuildReportPayloadOptions): ReportPayload {
  const explicitInputs = options.inputRows ?? [];
  const contextInputs = options.userInputs
    ? buildInputRowsFromUserInputs(options.userInputs)
    : [];
  const inputRows = explicitInputs.length > 0 ? explicitInputs : contextInputs;
  const sections = options.sections ?? [];
  const flatFromSections = sectionRowsAsReportRows(sections);
  const resultRows =
    normalizeResultRows(options.resultRows).length > 0
      ? normalizeResultRows(options.resultRows)
      : flatFromSections;
  const spec = options.spec ?? null;
  const checkSummary =
    spec && spec.checks.length > 0
      ? summarizeChecks(spec.checks.map((c) => c.status))
      : null;

  return {
    fileName: options.fileName,
    moduleTitle: options.moduleTitle,
    meta: options.meta ?? {},
    spec,
    inputRows,
    resultRows,
    sections,
    chartImages: options.chartImages ?? [],
    plotData: options.plotData ?? [],
    siteUrl: getReportSiteUrl(),
    productName: REPORT_PRODUCT_NAME,
    tagline: REPORT_TAGLINE,
    supportEmail: REPORT_SUPPORT_EMAIL,
    disclaimer: REPORT_DISCLAIMER,
    generatedAt: formatReportGeneratedAt(),
    checkSummary,
  };
}

export function sanitizeReportFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "report";
}
