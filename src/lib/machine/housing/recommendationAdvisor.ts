/**
 * Deterministic Engineering Advisor for bearing housings / mounted units.
 */

import type { HousingConfig, HousingResult } from "./types";
import type { MountedBomResult } from "./mountedBom";

export type HousingRecommendationAdvisor = {
  summary: string;
  narrative: string;
  reasons: string[];
  costBand: "Low" | "Medium" | "High";
};

export function explainHousingRecommendation(
  result: HousingResult,
  config: HousingConfig,
  bom?: MountedBomResult | null
): HousingRecommendationAdvisor {
  const reasons: string[] = [];
  const sentences: string[] = [];
  const sku = result.housingSku ?? bom?.housing.sku ?? "generic housing";
  const series = bom?.housing.seriesClass ?? "screening";

  sentences.push(
    `${sku} (${config.mountStyle.replace("_", " ")}) was preferred for the ${((config.boreDiameter * 1000).toFixed(0))} mm bore under the entered radial/axial loads.`
  );

  if (result.bodySafetyFactor >= 2) {
    reasons.push(`Body bending SF = ${result.bodySafetyFactor.toFixed(2)} provides comfortable structural margin.`);
    sentences.push(
      `Cantilever body screening shows safety factor ${result.bodySafetyFactor.toFixed(2)} against yield.`
    );
  } else if (result.bodySafetyFactor >= 1) {
    reasons.push(`Body SF = ${result.bodySafetyFactor.toFixed(2)} passes but is tight — verify casting geometry.`);
  } else {
    reasons.push(`Body SF = ${result.bodySafetyFactor.toFixed(2)} fails — increase section or reduce load.`);
  }

  reasons.push(
    `Recommended fasteners ${result.recommendedBoltSize} (T = ${(result.boltTensionPerBolt / 1000).toFixed(2)} kN, V = ${(result.boltShearPerBolt / 1000).toFixed(2)} kN per bolt).`
  );

  if (bom) {
    reasons.push(`Seal: ${bom.seal.replace("_", " ")} · ${bom.lines.length} BOM lines.`);
    sentences.push(
      `Mounted kit pairs the housing with a ${bom.seal.replace("_", " ")} seal set for the duty environment.`
    );
  }

  reasons.push(
    `Fits: shaft ${result.recommendedShaftFit}, housing ${result.recommendedHousingFit} (est. clearance ${result.estimatedOperatingClearanceUm.toFixed(0)} µm).`
  );

  const costBand: HousingRecommendationAdvisor["costBand"] =
    series === "SAF" || series === "SNLF"
      ? "High"
      : series === "SNL" || series === "FY"
        ? "Medium"
        : "Low";
  reasons.push(`Relative cost band: ${costBand} (${series}-class screening SKU).`);

  if (result.designStatus === "safe") {
    sentences.push("Overall housing check is PASS for body stress and bolt load sharing.");
  } else {
    sentences.push(`Overall status ${result.designStatus.toUpperCase()} — ${result.governingFailureMode}.`);
  }

  return {
    summary: `${sku} · body SF ${result.bodySafetyFactor.toFixed(1)} · bolts ${result.recommendedBoltSize} · cost ${costBand}`,
    narrative: sentences.join(" "),
    reasons,
    costBand,
  };
}
