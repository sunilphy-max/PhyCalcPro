/**
 * Shaft/housing fit recommendation and operating clearance (ISO 286 / SKF tables, screening).
 */

import type { BearingClearance, BearingMountingRole } from "@/data/catalogs/bearingCatalog";

export type ShaftToleranceClass = "g6" | "h6" | "j6" | "k5" | "m5" | "m6" | "n6";
export type HousingToleranceClass = "F7" | "G7" | "H7" | "J7" | "K7" | "M7";

export type FitRecommendation = {
  shaftFit: ShaftToleranceClass;
  housingFit: HousingToleranceClass;
  shaftDeviationUm: number;
  housingDeviationUm: number;
  clearanceReductionUm: number;
  estimatedOperatingClearanceUm: number;
  /** Differential thermal clearance change (µm); positive = clearances close. */
  thermalClearanceChangeUm: number;
  innerRingTempC: number;
  outerRingTempC: number;
  notes: string[];
};

/** Nominal radial internal clearance mid-values (μm) by ISO group. */
const CLEARANCE_MID_UM: Record<BearingClearance, number> = {
  C2: 8,
  CN: 15,
  C3: 28,
  C4: 42,
};

/** Linear expansion coefficient for bearing steel (1/K). */
const ALPHA_STEEL = 12e-6;

/** Reduction in radial internal clearance from interference fits (screening, rotating inner ring). */
function clearanceReductionFromFits(
  boreMm: number,
  shaftFit: ShaftToleranceClass,
  housingFit: HousingToleranceClass
): number {
  const boreFactor = Math.sqrt(boreMm / 25);
  const shaftTightness: Record<ShaftToleranceClass, number> = {
    g6: 0,
    h6: 2,
    j6: 6,
    k5: 10,
    m5: 14,
    m6: 18,
    n6: 24,
  };
  const housingTightness: Record<HousingToleranceClass, number> = {
    F7: 12,
    G7: 8,
    H7: 4,
    J7: 0,
    K7: -2,
    M7: -4,
  };
  return (shaftTightness[shaftFit] + housingTightness[housingFit]) * boreFactor;
}

/**
 * Thermal clearance change from differential ring expansion (screening).
 * Inner grows more than outer → clearance reduces.
 */
export function thermalClearanceChangeUm(params: {
  boreMm: number;
  innerRingTempC: number;
  outerRingTempC: number;
  ambientTempC?: number;
}): number {
  const ambient = params.ambientTempC ?? 20;
  const dInner = params.innerRingTempC - ambient;
  const dOuter = params.outerRingTempC - ambient;
  // Δδ ≈ α · d · (ΔT_inner − ΔT_outer) in metres → µm
  return params.boreMm * ALPHA_STEEL * (dInner - dOuter) * 1000;
}

export function recommendBearingFits(params: {
  boreMm: number;
  radialLoadN: number;
  speedRpm: number;
  mountingRole: BearingMountingRole;
  clearance: BearingClearance;
  innerRingRotates?: boolean;
  /** @deprecated Prefer innerRingTempC / outerRingTempC. */
  operatingTempDeltaC?: number;
  innerRingTempC?: number;
  outerRingTempC?: number;
  ambientTempC?: number;
}): FitRecommendation {
  const { boreMm, radialLoadN, speedRpm, mountingRole, clearance } = params;
  const innerRotates = params.innerRingRotates ?? true;
  const ambient = params.ambientTempC ?? 20;
  const notes: string[] = [];

  const loadRatio = radialLoadN / Math.max(boreMm, 1);
  const isHeavy = loadRatio > 150 || mountingRole === "locating";
  const isHighSpeed = speedRpm > 6000;

  let shaftFit: ShaftToleranceClass = "h6";
  let housingFit: HousingToleranceClass = "H7";

  if (innerRotates) {
    if (isHeavy && !isHighSpeed) {
      shaftFit = "m6";
      housingFit = "H7";
      notes.push("Rotating inner ring, moderate/heavy load — transition fit on shaft.");
    } else if (isHighSpeed) {
      shaftFit = "k5";
      housingFit = "H7";
      notes.push("High speed — tighter shaft fit (k5) to avoid creep.");
    } else if (mountingRole === "non_locating") {
      shaftFit = "g6";
      housingFit = "H7";
      notes.push("Floating bearing — loose shaft fit (g6) allows axial float.");
    } else {
      shaftFit = "k5";
      housingFit = "H7";
      notes.push("General rotating inner ring — k5/h6 shaft, H7 housing.");
    }
  } else {
    shaftFit = "h6";
    housingFit = "K7";
    notes.push("Stationary inner ring — tight housing fit (K7).");
  }

  const clearanceReduction = clearanceReductionFromFits(boreMm, shaftFit, housingFit);

  let innerRingTempC = params.innerRingTempC;
  let outerRingTempC = params.outerRingTempC;
  if (innerRingTempC == null || outerRingTempC == null) {
    const opDelta = params.operatingTempDeltaC ?? 30;
    const operating = ambient + opDelta;
    // Outer runs cooler than inner (housing sink) — screening defaults.
    innerRingTempC = innerRingTempC ?? operating;
    outerRingTempC = outerRingTempC ?? ambient + opDelta / 3;
  }

  const thermalChange = thermalClearanceChangeUm({
    boreMm,
    innerRingTempC,
    outerRingTempC,
    ambientTempC: ambient,
  });
  const nominalClearance = CLEARANCE_MID_UM[clearance];
  const operatingClearance = nominalClearance - clearanceReduction - thermalChange;

  notes.push(
    `Ring temps (screening): inner ${innerRingTempC.toFixed(0)} °C / outer ${outerRingTempC.toFixed(0)} °C → thermal Δδ ${thermalChange.toFixed(1)} µm.`
  );

  if (operatingClearance < 5) {
    notes.push("Operating clearance is tight — consider C3/C4 or looser housing fit.");
  }

  return {
    shaftFit,
    housingFit,
    shaftDeviationUm: clearanceReduction * 0.55,
    housingDeviationUm: clearanceReduction * 0.45,
    clearanceReductionUm: clearanceReduction,
    estimatedOperatingClearanceUm: operatingClearance,
    thermalClearanceChangeUm: thermalChange,
    innerRingTempC,
    outerRingTempC,
    notes,
  };
}
