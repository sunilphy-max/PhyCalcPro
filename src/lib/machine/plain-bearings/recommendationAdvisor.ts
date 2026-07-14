/**
 * Deterministic Engineering Advisor for plain / hydrodynamic bearings.
 */

import type { PlainBearingConfig, PlainBearingResult } from "./types";

export type PlainRecommendationAdvisor = {
  summary: string;
  narrative: string;
  reasons: string[];
  costBand: "Low" | "Medium" | "High";
};

export function explainPlainBearingRecommendation(
  result: PlainBearingResult,
  config: PlainBearingConfig
): PlainRecommendationAdvisor {
  const reasons: string[] = [];
  const sentences: string[] = [];
  const ld = config.length / Math.max(config.diameter, 1e-9);
  const clearanceRatio = config.clearance / Math.max(config.diameter, 1e-9);

  if (config.bearingType === "journal") {
    sentences.push(
      `A journal bearing was evaluated under ISO 7902 screening with Sommerfeld number S = ${result.sommerfeldNumber.toFixed(3)}.`
    );
    if (ld >= 0.6 && ld <= 1.5) {
      reasons.push(`L/D = ${ld.toFixed(2)} is in a typical industrial range (0.6–1.5).`);
      sentences.push(`Length-to-diameter ratio L/D = ${ld.toFixed(2)} supports stable hydrodynamic operation.`);
    } else if (ld < 0.6) {
      reasons.push(`Short bearing L/D = ${ld.toFixed(2)} — film capacity limited; consider longer journal.`);
      sentences.push(`The short L/D = ${ld.toFixed(2)} limits load capacity — lengthening the bearing is preferred.`);
    } else {
      reasons.push(`Long bearing L/D = ${ld.toFixed(2)} — check alignment and thermal gradient.`);
    }

    if (result.eccentricityRatio < 0.7) {
      reasons.push(`Eccentricity ε = ${result.eccentricityRatio.toFixed(2)} leaves film margin.`);
    } else {
      reasons.push(`High eccentricity ε = ${result.eccentricityRatio.toFixed(2)} — increase viscosity, speed, or length.`);
    }
  } else if (config.bearingType === "thrust_pad") {
    sentences.push(
      `A thrust pad layout was screened per ISO 12131 with unit load ${((result.unitLoad ?? 0) / 1e6).toFixed(2)} MPa.`
    );
    reasons.push(`Pad diameter ratio ${(config.padDiameterRatio ?? 2).toFixed(2)} sets the annular area.`);
  } else {
    sentences.push(
      `A tilting-pad configuration (${config.padCount ?? 6} pads) was screened per ISO 12130.`
    );
    reasons.push(`${config.padCount ?? 6} pads share thrust — more pads reduce unit load.`);
  }

  if (result.minFilmThickness > 10e-6) {
    reasons.push(`h_min ≈ ${(result.minFilmThickness * 1e6).toFixed(1)} µm exceeds the 5 µm screening floor.`);
    sentences.push(
      `Predicted minimum film thickness (${(result.minFilmThickness * 1e6).toFixed(1)} µm) exceeds the screening limit with comfortable margin.`
    );
  } else if (result.minFilmThickness > 5e-6) {
    reasons.push(`h_min ≈ ${(result.minFilmThickness * 1e6).toFixed(1)} µm is above 5 µm but tight.`);
  } else {
    reasons.push(`h_min ≈ ${(result.minFilmThickness * 1e6).toFixed(1)} µm risks boundary contact.`);
  }

  if (clearanceRatio > 0.0008 && clearanceRatio < 0.0025) {
    reasons.push(`Diametral clearance ratio ${(clearanceRatio * 1000).toFixed(2)}‰ is typical for journals.`);
  }

  const costBand: PlainRecommendationAdvisor["costBand"] =
    config.bearingType === "tilting_pad" ? "High" : config.bearingType === "thrust_pad" ? "Medium" : "Low";

  reasons.push(`Relative cost band: ${costBand} (${config.bearingType.replace("_", " ")} class).`);

  if (result.designStatus === "safe") {
    sentences.push("Overall ISO screening status is PASS for film, specific load, and temperature.");
  } else if (result.designStatus === "warning") {
    sentences.push(`Status is MARGINAL — ${result.status}`);
  } else {
    sentences.push(`Status is FAIL — ${result.status}`);
  }

  return {
    summary: `${config.bearingType.replace(/_/g, " ")} · h_min ${(result.minFilmThickness * 1e6).toFixed(1)} µm · S ${result.sommerfeldNumber.toFixed(2)} · cost ${costBand}`,
    narrative: sentences.join(" "),
    reasons,
    costBand,
  };
}
