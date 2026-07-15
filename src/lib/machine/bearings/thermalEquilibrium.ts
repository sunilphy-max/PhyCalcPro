/**
 * Thermal equilibrium screening: friction power → ΔT → operating temperature.
 * Closes the loop so viscosity / κ can use equilibrium temp instead of a guess.
 */

import { estimateFriction } from "./auxiliaryChecks";
import { greaseEffectiveViscosity, kinematicViscosityAtTemp } from "./lubrication";
import type { BearingType, LubricantType } from "./types";

export type ThermalEquilibriumInput = {
  equivalentLoadN: number;
  meanDiameterMm: number;
  speedRpm: number;
  bearingType: BearingType;
  sealed?: boolean;
  ambientTempC?: number;
  /** Optional user override — if set, equilibrium still reported for comparison. */
  specifiedTempC?: number;
  /**
   * Housing thermal resistance (K/W). Default scales with bearing size.
   * Small pillow block ≈ 0.2–0.4 K/W; large housings lower.
   */
  thermalResistanceKW?: number;
  lubricantType?: LubricantType;
  isoVgGrade?: number;
  dynamicRatingN?: number;
};

export type ThermalEquilibriumResult = {
  ambientTempC: number;
  equilibriumTempC: number;
  /** Temp used for viscosity / life (specified if provided, else equilibrium). */
  operatingTempC: number;
  deltaTempK: number;
  powerLossW: number;
  frictionTorqueNm: number;
  thermalResistanceKW: number;
  /** Viscosity at operating temperature (cSt), if VG known. */
  viscosityCst: number | null;
  usedSpecifiedTemp: boolean;
  note: string;
};

function defaultThermalResistance(meanDiameterMm: number): number {
  // Larger bearings / housings dissipate better → lower R_th
  const dm = Math.max(meanDiameterMm, 20);
  return Math.max(0.08, Math.min(0.45, 8 / dm));
}

/**
 * Steady-state: ΔT = Q · R_th, T_eq = T_amb + ΔT.
 * One optional viscosity-aware friction re-estimate (screening).
 */
export function calculateThermalEquilibrium(
  input: ThermalEquilibriumInput
): ThermalEquilibriumResult {
  const ambient = input.ambientTempC ?? 20;
  const Rth = input.thermalResistanceKW ?? defaultThermalResistance(input.meanDiameterMm);

  const friction1 = estimateFriction({
    equivalentLoadN: input.equivalentLoadN,
    meanDiameterMm: input.meanDiameterMm,
    speedRpm: input.speedRpm,
    bearingType: input.bearingType,
    sealed: input.sealed,
    lubricantType: input.lubricantType === "none" ? undefined : input.lubricantType,
    dynamicRatingN: input.dynamicRatingN,
  });

  let power = friction1.powerLossW;
  let torque = friction1.frictionTorqueNm;

  // First-pass equilibrium
  let deltaT = power * Rth;
  let tEq = ambient + deltaT;

  // Mild viscosity feedback: hotter → thinner oil → slightly lower friction (screening)
  if (input.isoVgGrade != null && input.lubricantType && input.lubricantType !== "none") {
    const nu =
      input.lubricantType === "grease"
        ? greaseEffectiveViscosity(
            input.isoVgGrade,
            tEq,
            input.speedRpm,
            input.meanDiameterMm
          )
        : kinematicViscosityAtTemp(input.isoVgGrade, tEq);
    const nuRef = kinematicViscosityAtTemp(input.isoVgGrade, 70);
    const frictionScale = Math.sqrt(Math.max(nu, 1) / Math.max(nuRef, 1));
    const clamped = Math.min(Math.max(frictionScale, 0.7), 1.4);
    power = friction1.powerLossW * clamped;
    torque = friction1.frictionTorqueNm * clamped;
    deltaT = power * Rth;
    tEq = ambient + deltaT;
  }

  const usedSpecified = input.specifiedTempC != null && Number.isFinite(input.specifiedTempC);
  const operatingTempC = usedSpecified ? input.specifiedTempC! : tEq;

  let viscosityCst: number | null = null;
  if (input.isoVgGrade != null && input.lubricantType && input.lubricantType !== "none") {
    viscosityCst =
      input.lubricantType === "grease"
        ? greaseEffectiveViscosity(
            input.isoVgGrade,
            operatingTempC,
            input.speedRpm,
            input.meanDiameterMm
          )
        : kinematicViscosityAtTemp(input.isoVgGrade, operatingTempC);
  }

  const note = usedSpecified
    ? `Using specified ${operatingTempC.toFixed(0)} °C (equilibrium would be ≈ ${tEq.toFixed(0)} °C from ${power.toFixed(1)} W × ${Rth.toFixed(2)} K/W).`
    : `Equilibrium ≈ ${tEq.toFixed(0)} °C from friction ${power.toFixed(1)} W and housing R_th ${Rth.toFixed(2)} K/W.`;

  return {
    ambientTempC: ambient,
    equilibriumTempC: tEq,
    operatingTempC,
    deltaTempK: deltaT,
    powerLossW: power,
    frictionTorqueNm: torque,
    thermalResistanceKW: Rth,
    viscosityCst,
    usedSpecifiedTemp: usedSpecified,
    note,
  };
}
