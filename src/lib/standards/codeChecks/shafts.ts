/**
 * Shaft standards code checks — DIN 743 (EU) / AGMA 6001 (US) / indicative Goodman.
 */

import type { DesignCodeId, EngineeringCheck } from "../types";
import { makeSafetyFactorCheck } from "../buildSpec";
import type { ShaftResult } from "@/lib/machine/shafts/types";

export function shaftCodeMethod(designCode: DesignCodeId): string {
  switch (designCode) {
    case "EU":
      return "DIN 743-1/2/3 shaft load-capacity worksheet (fatigue + static + notch catalogs)";
    case "US":
      return "AGMA 6001 interface loads + Marin–Goodman fatigue screening";
    case "ISO":
      return "ISO-oriented shaft screening with DIN 743 factors available";
    default:
      return "Combined von Mises + Marin–Goodman fatigue + critical-speed screening";
  }
}

export function buildShaftCodeChecks(
  result: ShaftResult,
  designCode: DesignCodeId
): EngineeringCheck[] {
  const checks: EngineeringCheck[] = [
    makeSafetyFactorCheck("von_mises", "Static von Mises safety factor", result.safetyFactor, designCode),
  ];

  if (result.fatigueSafetyFactor != null) {
    checks.push(
      makeSafetyFactorCheck(
        "fatigue",
        designCode === "EU"
          ? "Indicative Goodman fatigue (cross-check)"
          : "Fatigue safety (Goodman)",
        result.fatigueSafetyFactor,
        designCode
      )
    );
  }

  if (result.din743Worksheet) {
    const din = result.din743Worksheet;
    const fatigueStatus =
      din.governingFatigueSF >= din.SminFatigue
        ? designCode === "INDICATIVE"
          ? "indicative"
          : "pass"
        : din.governingFatigueSF >= din.SminFatigue * 0.85
          ? "warning"
          : "fail";
    const staticStatus =
      din.governingStaticSF >= din.SminStatic
        ? designCode === "INDICATIVE"
          ? "indicative"
          : "pass"
        : din.governingStaticSF >= din.SminStatic * 0.85
          ? "warning"
          : "fail";

    checks.push({
      id: "din743_fatigue",
      label: "DIN 743 fatigue safety S",
      metricKind: "safety_factor",
      value: din.governingFatigueSF,
      limit: din.SminFatigue,
      status: fatigueStatus,
      standardRef: "DIN 743-1",
    });
    checks.push({
      id: "din743_static",
      label: "DIN 743 static safety S",
      metricKind: "safety_factor",
      value: din.governingStaticSF,
      limit: din.SminStatic,
      status: staticStatus,
      standardRef: "DIN 743-1",
    });
  }

  if (result.criticalSpeedMargin != null) {
    checks.push(
      makeSafetyFactorCheck(
        "critical_speed",
        "Critical speed margin",
        result.criticalSpeedMargin,
        designCode
      )
    );
  }

  return checks;
}
