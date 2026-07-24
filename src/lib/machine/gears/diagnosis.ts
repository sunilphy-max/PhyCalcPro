/**
 * Gear Diagnosis Engine
 * Post-solve risk screening for gear designs (no new physics).
 */

import type {
  ModuleDiagnosis,
  DiagnosisFinding,
  DiagnosisRecommendation,
} from "@/lib/design-workflows/diagnosisTypes";
import {
  maxDiagnosisRisk,
  riskFromSafetyFactor,
  emptyDiagnosis,
} from "@/lib/design-workflows/diagnosisTypes";
import type { GearResult } from "./types";

export function diagnoseGear(result: GearResult): ModuleDiagnosis {
  const findings: DiagnosisFinding[] = [];
  const recommendations: DiagnosisRecommendation[] = [];

  // Bending (Lewis) safety factor
  const bendingRisk = riskFromSafetyFactor(result.safetyFactor);
  if (bendingRisk && bendingRisk !== "low") {
    findings.push({
      category: "bending",
      categoryLabel: "Tooth Bending",
      level: bendingRisk,
      title: `Bending safety factor ${result.safetyFactor.toFixed(2)}`,
      detail: `Lewis bending stress ${(result.bendingStress / 1e6).toFixed(
        1
      )} MPa yields SF = ${result.safetyFactor.toFixed(
        2
      )}. Risk of tooth root failure.`,
      metricKey: "safetyFactor",
      metricValue: result.safetyFactor,
      threshold: 1.5,
    });
  }

  // Contact (Hertzian) safety factor
  const contactRisk = riskFromSafetyFactor(result.contactSafetyFactor);
  if (contactRisk && contactRisk !== "low") {
    findings.push({
      category: "contact",
      categoryLabel: "Surface Contact",
      level: contactRisk,
      title: `Contact safety factor ${result.contactSafetyFactor.toFixed(2)}`,
      detail: `Hertzian contact stress ${(result.contactStress / 1e6).toFixed(
        0
      )} MPa yields SF = ${result.contactSafetyFactor.toFixed(
        2
      )}. Risk of pitting or surface wear.`,
      metricKey: "contactSafetyFactor",
      metricValue: result.contactSafetyFactor,
      threshold: 1.5,
    });
  }

  // Bending fatigue (ISO 6336)
  if (result.iso6336BendingSafetyFactor != null) {
    const bendingFatigueRisk = riskFromSafetyFactor(result.iso6336BendingSafetyFactor);
    if (bendingFatigueRisk && bendingFatigueRisk !== "low") {
      findings.push({
        category: "bending_fatigue",
        categoryLabel: "Bending Fatigue (ISO 6336)",
        level: bendingFatigueRisk,
        title: `ISO 6336 bending SF ${result.iso6336BendingSafetyFactor.toFixed(2)}`,
        detail: `Bending fatigue per ISO 6336 yields SF = ${result.iso6336BendingSafetyFactor.toFixed(
          2
        )}. Consider application factor and load distribution.`,
        metricKey: "iso6336BendingSafetyFactor",
        metricValue: result.iso6336BendingSafetyFactor,
        threshold: 1.4,
      });
    }
  }

  // Contact fatigue (ISO 6336)
  if (result.iso6336ContactSafetyFactor != null) {
    const contactFatigueRisk = riskFromSafetyFactor(result.iso6336ContactSafetyFactor);
    if (contactFatigueRisk && contactFatigueRisk !== "low") {
      findings.push({
        category: "contact_fatigue",
        categoryLabel: "Contact Fatigue (ISO 6336)",
        level: contactFatigueRisk,
        title: `ISO 6336 contact SF ${result.iso6336ContactSafetyFactor.toFixed(2)}`,
        detail: `Contact fatigue per ISO 6336 yields SF = ${result.iso6336ContactSafetyFactor.toFixed(
          2
        )}. Lubrication and surface finish are critical.`,
        metricKey: "iso6336ContactSafetyFactor",
        metricValue: result.iso6336ContactSafetyFactor,
        threshold: 1.4,
      });
    }
  }

  // Scuffing risk
  if (result.scuffingSafetyFactor != null) {
    const scuffingRisk = riskFromSafetyFactor(result.scuffingSafetyFactor, 1, 1.5);
    if (scuffingRisk && scuffingRisk !== "low") {
      findings.push({
        category: "scuffing",
        categoryLabel: "Scuffing Risk",
        level: scuffingRisk,
        title: `Scuffing safety factor ${result.scuffingSafetyFactor.toFixed(2)}`,
        detail: `Flash temperature check indicates elevated scuffing risk. Ensure adequate lubrication and EP additives.`,
        metricKey: "scuffingSafetyFactor",
        metricValue: result.scuffingSafetyFactor,
        threshold: 1.5,
      });
      if (result.scuffingSafetyFactor < 1.5) {
        recommendations.push({
          id: "improve_lubrication",
          label: "Improve lubrication",
          detail: "Use higher-grade oil with EP additives or consider oil-jet cooling.",
        });
      }
    }
  }

  // Micropitting risk
  if (result.micropittingSafetyFactor != null) {
    const micropittingRisk = riskFromSafetyFactor(result.micropittingSafetyFactor, 1, 1.5);
    if (micropittingRisk && micropittingRisk !== "low") {
      findings.push({
        category: "micropitting",
        categoryLabel: "Micropitting Risk",
        level: micropittingRisk,
        title: `Micropitting safety factor ${result.micropittingSafetyFactor.toFixed(2)}`,
        detail: `Micropitting screening per ISO/TS 6336-22 indicates elevated risk. Surface finish and lubrication cleanliness are critical.`,
        metricKey: "micropittingSafetyFactor",
        metricValue: result.micropittingSafetyFactor,
        threshold: 1.5,
      });
    }
  }

  // General recommendations
  if (bendingRisk === "high" || contactRisk === "high") {
    recommendations.push({
      id: "increase_module",
      label: "Increase module or face width",
      detail: "Larger module or wider face reduces bending and contact stress.",
    });
  }

  const overallRisk = maxDiagnosisRisk(findings.map((f) => f.level));
  const governingMode =
    bendingRisk === "high"
      ? "tooth bending"
      : contactRisk === "high"
        ? "surface contact"
        : "multiple factors";

  const summary =
    overallRisk === "high"
      ? `Critical failure risk in ${governingMode}. Immediate redesign required.`
      : overallRisk === "medium"
        ? `Marginal safety in ${governingMode}. Consider design improvements.`
        : "All gear strength and fatigue metrics within acceptable thresholds.";

  return {
    overallRisk,
    summary,
    findings,
    recommendations,
  };
}
