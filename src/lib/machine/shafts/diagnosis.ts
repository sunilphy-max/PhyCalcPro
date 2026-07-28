/**
 * Shaft Diagnosis Engine
 * Post-solve risk screening for shaft designs (no new physics).
 */

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "@/lib/design-workflows/diagnosisTypes";
import {
  maxDiagnosisRisk,
  riskFromSafetyFactor,
  riskFromUtilization,
  emptyDiagnosis,
} from "@/lib/design-workflows/diagnosisTypes";
import type { ShaftResult } from "./types";

export function diagnoseShaft(result: ShaftResult): ModuleDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Static safety factor
  const sfRisk = riskFromSafetyFactor(result.safetyFactor);
  if (sfRisk && sfRisk !== "low") {
    findings.push({
      category: "static_strength",
      categoryLabel: "Static Strength",
      level: sfRisk,
      title: `Static safety factor ${result.safetyFactor.toFixed(2)}`,
      detail: `Von Mises stress at critical section yields SF = ${result.safetyFactor.toFixed(
        2
      )}. Target ≥ 1.5 for most applications.`,
      metricKey: "safetyFactor",
      metricValue: result.safetyFactor,
      threshold: 1.5,
    });
    if (result.safetyFactor < 1) {
      recommendations.push({
        id: "increase_diameter",
        label: "Increase shaft diameter",
        detail: `Current max stress ${(result.maxStress / 1e6).toFixed(1)} MPa exceeds material capacity. Consider larger diameter at critical section.`,
      });
    }
  }

  // Fatigue safety factor
  if (result.fatigueSafetyFactor != null) {
    const fatigueRisk = riskFromSafetyFactor(result.fatigueSafetyFactor);
    if (fatigueRisk && fatigueRisk !== "low") {
      findings.push({
        category: "fatigue",
        categoryLabel: "Fatigue Life",
        level: fatigueRisk,
        title: `Fatigue safety factor ${result.fatigueSafetyFactor.toFixed(2)}`,
        detail: `Infinite-life fatigue screening yields SF = ${result.fatigueSafetyFactor.toFixed(
          2
        )}. Consider stress concentrations and surface finish.`,
        metricKey: "fatigueSafetyFactor",
        metricValue: result.fatigueSafetyFactor,
        threshold: 1.5,
      });
      if (result.fatigueSafetyFactor < 1.25) {
        recommendations.push({
          id: "reduce_stress_concentration",
          label: "Reduce stress concentrations",
          detail: "Add larger fillet radii at shoulders or keyways to lower Kt.",
        });
      }
    }
  }

  // Deflection utilization
  const deflRisk = riskFromUtilization(result.deflectionUtilization);
  if (deflRisk && deflRisk !== "low") {
    findings.push({
      category: "deflection",
      categoryLabel: "Deflection",
      level: deflRisk,
      title: `Deflection utilization ${(result.deflectionUtilization * 100).toFixed(0)}%`,
      detail: `Max deflection ${(result.maxDeflection * 1000).toFixed(
        2
      )} mm approaches or exceeds serviceability limit. May affect bearing life or alignment.`,
      metricKey: "deflectionUtilization",
      metricValue: result.deflectionUtilization,
      threshold: 0.85,
    });
  }

  // Slope utilization
  const slopeRisk = riskFromUtilization(result.slopeUtilization);
  if (slopeRisk && slopeRisk !== "low") {
    findings.push({
      category: "slope",
      categoryLabel: "Slope at Bearings",
      level: slopeRisk,
      title: `Slope utilization ${(result.slopeUtilization * 100).toFixed(0)}%`,
      detail: `Max slope ${(result.maxSlope * 1000).toFixed(
        2
      )} mrad may exceed bearing misalignment tolerance. Consider stiffer shaft or shorter span.`,
      metricKey: "slopeUtilization",
      metricValue: result.slopeUtilization,
      threshold: 0.85,
    });
  }

  // Critical speed margin
  if (result.criticalSpeedMargin != null) {
    const csMarginRisk =
      result.criticalSpeedMargin < 1
        ? "high"
        : result.criticalSpeedMargin < 1.25
          ? "medium"
          : "low";
    if (csMarginRisk !== "low") {
      findings.push({
        category: "critical_speed",
        categoryLabel: "Critical Speed",
        level: csMarginRisk,
        title: `Critical speed margin ${result.criticalSpeedMargin.toFixed(2)}`,
        detail: `Operating speed is ${result.criticalSpeedMargin < 1 ? "above" : "near"} first critical speed ${result.criticalSpeed.toFixed(0)} rpm. Risk of resonance.`,
        metricKey: "criticalSpeedMargin",
        metricValue: result.criticalSpeedMargin,
        threshold: 1.25,
      });
      if (result.criticalSpeedMargin < 1.25) {
        recommendations.push({
          id: "increase_stiffness",
          label: "Increase shaft stiffness",
          detail: "Larger diameter or shorter bearing span to raise critical speed.",
        });
      }
    }
  }

  // Keys
  if (result.keysDesign && result.keysDesign.status !== "safe") {
    const keyRisk = result.keysDesign.status === "critical" ? "high" : "medium";
    findings.push({
      category: "keys",
      categoryLabel: "Key Sizing",
      level: keyRisk,
      title: `Key SF min ${Math.min(result.keysDesign.shearSafety, result.keysDesign.bearingSafety).toFixed(2)}`,
      detail: `DIN 6885 key ${((result.keysDesign.width) * 1000).toFixed(0)}×${(result.keysDesign.height * 1000).toFixed(0)} mm under ${result.keysDesign.appliedTorque.toFixed(0)} N·m.`,
      metricKey: "keysDesign",
      metricValue: Math.min(result.keysDesign.shearSafety, result.keysDesign.bearingSafety),
      threshold: 1.5,
    });
    recommendations.push({
      id: "lengthen_key",
      label: "Lengthen key or upgrade section",
      detail: "Increase key length or shaft diameter so key shear/bearing SF ≥ 1.5.",
    });
  }

  // Retaining rings
  for (const ring of result.retainingRingChecks ?? []) {
    if (ring.status === "critical" || ring.status === "warning") {
      findings.push({
        category: "retaining_rings",
        categoryLabel: "Retaining Rings",
        level: ring.status === "critical" ? "high" : "medium",
        title: `Ring axial SF ${ring.safetyFactor.toFixed(2)} @ position ${ring.position.toFixed(3)}`,
        detail: `Groove Kt ≈ ${ring.kt.toFixed(2)}; axial capacity ${(ring.axialCapacity).toFixed(0)} (display force units).`,
        metricKey: "retainingRingSf",
        metricValue: ring.safetyFactor,
        threshold: 2,
      });
    }
  }

  // Bearing life screening
  for (const b of result.bearingLifeScreens ?? []) {
    if (b.status === "critical" || b.status === "warning") {
      findings.push({
        category: "bearings",
        categoryLabel: "Bearing Life",
        level: b.status === "critical" ? "high" : "medium",
        title: `Estimated L10 ${b.estimatedL10Hours != null ? b.estimatedL10Hours.toFixed(0) : "—"} h`,
        detail: `Fr = ${(b.radialForce / 1000).toFixed(2)} kN; required C ≈ ${(b.requiredDynamicRating / 1000).toFixed(1)} kN for ${b.targetLifeHours} h.`,
        metricKey: "bearingL10",
        metricValue: b.estimatedL10Hours ?? 0,
        threshold: b.targetLifeHours,
      });
      recommendations.push({
        id: "open_bearings",
        label: "Select bearings with adequate C",
        detail: "Open the bearings module with shaft handoff loads to pick a catalog designation.",
      });
      break;
    }
  }

  // DIN 743
  if (result.din743Worksheet) {
    const din = result.din743Worksheet;
    if (din.designStatus !== "safe") {
      findings.push({
        category: "din743",
        categoryLabel: "DIN 743",
        level: din.designStatus === "critical" ? "high" : "medium",
        title: `DIN 743 fatigue S ${din.governingFatigueSF.toFixed(2)} (min ${din.SminFatigue})`,
        detail: `Material ${din.materialDesignation}; governing station ${din.governingStationId}; K_σ=${din.autoK_sigma.toFixed(2)}, K_τ=${din.autoK_tau.toFixed(2)}.`,
        metricKey: "din743FatigueSf",
        metricValue: din.governingFatigueSF,
        threshold: din.SminFatigue,
      });
      recommendations.push({
        id: "din743_improve_notch",
        label: "Improve DIN 743 notch / diameter",
        detail: "Increase fillet radius, reduce groove sharpness, or step up diameter at the governing DIN station.",
      });
    }
  }

  const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
  const summary =
    overallRisk === "high"
      ? `Critical failure risk detected: ${result.governingFailureMode}. Immediate redesign required.`
      : overallRisk === "medium"
        ? `Marginal safety detected in ${result.governingFailureMode}. Consider design improvements.`
        : "All shaft metrics within acceptable safety thresholds.";

  return {
    overallRisk,
    summary,
    findings,
    recommendations,
  };
}
