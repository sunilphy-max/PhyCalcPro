import type { MetricStatus } from "@/components/calculator/CalculatorMetricCard";

/** Map utilization to metric status: ≤0.85 safe, ≤1 near limit, >1 failure. */
export function utilizationToMetricStatus(util: number): MetricStatus {
  if (!Number.isFinite(util)) return "safe";
  if (util > 1) return "danger";
  if (util > 0.85) return "warning";
  return "safe";
}

export type GoverningCheck = {
  status: MetricStatus;
  governing: "stress" | "deflection";
  util: number;
  stressUtilization: number;
  deflectionUtilization: number;
};

const STATUS_RANK: Record<MetricStatus, number> = {
  safe: 0,
  warning: 1,
  danger: 2,
};

export function governingUtilizationStatus(
  stressUtilization: number,
  deflectionUtilization: number
): GoverningCheck {
  const stressStatus = utilizationToMetricStatus(stressUtilization);
  const deflectionStatus = utilizationToMetricStatus(deflectionUtilization);
  const governing =
    stressUtilization >= deflectionUtilization ? "stress" : "deflection";
  const util = Math.max(stressUtilization, deflectionUtilization);
  const status =
    STATUS_RANK[stressStatus] >= STATUS_RANK[deflectionStatus]
      ? stressStatus
      : deflectionStatus;
  return {
    status,
    governing,
    util,
    stressUtilization,
    deflectionUtilization,
  };
}

export function statusLabel(status: MetricStatus): string {
  if (status === "danger") return "Failure";
  if (status === "warning") return "Near limit";
  return "Safe";
}
