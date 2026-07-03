export const SIGMA = 5.670374419e-8;
export const MU0 = 4 * Math.PI * 1e-7;
export const GAS_R = 8.314462618;
export const HYDROGEN_MOLAR_MASS = 0.002016;

export type AdvancedCalculatorId =
  | "vacuum-engineering"
  | "cryogenic-engineering"
  | "magnetic-fields"
  | "superconducting-systems"
  | "thermal-management"
  | "battery-ev-systems"
  | "hydrogen-systems"
  | "precision-motion";

export type AdvancedField = {
  key: string;
  label: string;
  unit: string;
  defaultValue: number;
  min?: number;
  description?: string;
};

export type AdvancedMetric = {
  key: string;
  label: string;
  value: number;
  unit: string;
  description?: string;
  tone?: "default" | "blue" | "purple" | "orange" | "red" | "amber" | "green";
};

export type AdvancedResult = Record<string, number | string[] | AdvancedMetric[]> & {
  metrics: AdvancedMetric[];
  warnings: string[];
  assumptions: string[];
};

export type AdvancedCalculatorDefinition = {
  id: AdvancedCalculatorId;
  title: string;
  eyebrow: string;
  description: string;
  standards: string[];
  fields: AdvancedField[];
  solve: (input: Record<string, number>) => AdvancedResult;
};

export function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function metric(
  key: string,
  label: string,
  value: number,
  unit: string,
  tone: AdvancedMetric["tone"] = "blue",
  description?: string
): AdvancedMetric {
  return { key, label, value, unit, tone, description };
}

export function result(
  metrics: AdvancedMetric[],
  assumptions: string[],
  warnings: string[] = []
): AdvancedResult {
  return {
    ...Object.fromEntries(metrics.map((item) => [item.key, item.value])),
    metrics,
    assumptions,
    warnings,
  };
}
