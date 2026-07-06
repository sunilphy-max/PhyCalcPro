export type DesignCodeId = "INDICATIVE" | "US" | "EU" | "ISO";

export type StandardRegion = DesignCodeId;

export type CheckMetricKind = "safety_factor" | "utilization" | "stress" | "deflection" | "life" | "other";

export type EngineeringCheckStatus =
  | "pass"
  | "warning"
  | "fail"
  | "not_available"
  | "indicative";

export type StandardReference = {
  body: string;
  document: string;
  clause?: string;
  edition?: string;
  note?: string;
};

export type EquationReference = {
  id: string;
  label: string;
  expression: string;
  description?: string;
};

export type EngineeringCheck = {
  id: string;
  label: string;
  metricKind: CheckMetricKind;
  status: EngineeringCheckStatus;
  value?: number;
  limit?: number;
  unit?: string;
  standardRef?: StandardReference;
  equationRef?: string;
  notes?: string;
};

export type WorksheetStep = {
  label: string;
  symbol?: string;
  value: string;
  unit?: string;
};

export type CalculationSpec = {
  moduleId: string;
  designCode: DesignCodeId;
  method: string;
  validationStatus: "verified" | "beta" | "indicative" | "draft";
  standards: StandardReference[];
  equations: EquationReference[];
  assumptions: string[];
  limitations: string[];
  checks: EngineeringCheck[];
  /** MITCalc-style intermediate factor rows for export reports */
  worksheetSteps?: WorksheetStep[];
  engineVersion: string;
  computedAt: string;
};

/** Solver output after {@link withCalculationSpec} (or attach* helpers). */
export type WithCalculationSpec<T extends object = object> = T & {
  calculationSpec?: CalculationSpec;
};

export type ModuleCheckDefinition = {
  id: string;
  label: string;
  metricKind: CheckMetricKind;
  standardRef: Partial<Record<DesignCodeId, StandardReference>>;
  implementation: Partial<Record<DesignCodeId, "implemented" | "planned" | "not_applicable">>;
};

export type ModuleStandardProfile = {
  moduleId: string;
  title: string;
  indicativeMethod: string;
  checks: ModuleCheckDefinition[];
  standardsByCode: Partial<Record<DesignCodeId, StandardReference[]>>;
  assumptions: string[];
  limitations: string[];
  validationStatus: CalculationSpec["validationStatus"];
};
