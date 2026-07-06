/**
 * Shaft fatigue screening — rotating-bending + steady torsion (Shigley / Marin).
 */

import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import type { ShaftFatigueOptions, ShaftMaterial } from "./types";
import type { SurfaceFinish } from "@/lib/materials/fatigue/types";

export type FatigueStressState = {
  bendingAmplitude: number;
  bendingMean: number;
  shearAmplitude: number;
  shearMean: number;
  diameter: number;
};

export type ShaftFatigueResult = {
  safetyFactor: number;
  status: "safe" | "warning" | "critical";
  bendingSf: number;
  torsionSf: number;
  combinedSf: number;
};

const ENDURANCE_FRACTION = 0.5;

export function estimateEnduranceLimit(material: ShaftMaterial): number {
  return ENDURANCE_FRACTION * material.ultimateStrength;
}

export function evaluateShaftFatigue(
  material: ShaftMaterial,
  stress: FatigueStressState,
  options: ShaftFatigueOptions,
  targetSf = 1.5,
  gammaF = 1
): ShaftFatigueResult {
  const finish: SurfaceFinish = options.surfaceFinish ?? "machined";
  const Se = estimateEnduranceLimit(material) / Math.max(gammaF, 1e-9);

  const bending = solveFatigueEngine({
    alternatingStress: stress.bendingAmplitude,
    meanStress: stress.bendingMean,
    ultimateStrength: material.ultimateStrength,
    enduranceLimit: Se,
    surfaceFinish: finish,
    loadType: "bending",
    characteristicDiameter: stress.diameter,
    meanStressMethod: "goodman",
  });

  const torsion = solveFatigueEngine({
    alternatingStress: stress.shearAmplitude,
    meanStress: stress.shearMean,
    ultimateStrength: material.ultimateStrength,
    enduranceLimit: Se,
    surfaceFinish: finish,
    loadType: "torsion",
    characteristicDiameter: stress.diameter,
    meanStressMethod: "goodman",
  });

  const sigmaA = stress.bendingAmplitude;
  const sigmaM = stress.bendingMean;
  const tauA = stress.shearAmplitude;
  const tauM = stress.shearMean;
  const vmA = Math.sqrt(sigmaA * sigmaA + 3 * tauA * tauA);
  const vmM = Math.sqrt(sigmaM * sigmaM + 3 * tauM * tauM);

  const combined = solveFatigueEngine({
    alternatingStress: vmA,
    meanStress: vmM,
    ultimateStrength: material.ultimateStrength,
    enduranceLimit: Se,
    surfaceFinish: finish,
    loadType: "bending",
    characteristicDiameter: stress.diameter,
    meanStressMethod: "goodman",
  });

  const combinedSf = combined.safetyFactor;
  const status =
    combinedSf >= targetSf ? "safe" : combinedSf >= targetSf * 0.8 ? "warning" : "critical";

  return {
    safetyFactor: combinedSf,
    status,
    bendingSf: bending.safetyFactor,
    torsionSf: torsion.safetyFactor,
    combinedSf,
  };
}

export function rotatingShaftStressState(
  bendingStress: number,
  shearStress: number,
  axialMean = 0,
  alternatingTorqueFraction = 0
): FatigueStressState {
  return {
    bendingAmplitude: Math.abs(bendingStress),
    bendingMean: Math.abs(axialMean),
    shearAmplitude: Math.abs(shearStress) * alternatingTorqueFraction,
    shearMean: Math.abs(shearStress) * (1 - alternatingTorqueFraction),
    diameter: 0,
  };
}
