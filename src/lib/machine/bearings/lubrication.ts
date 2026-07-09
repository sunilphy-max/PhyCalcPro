/**
 * Kinematic viscosity at temperature from ISO VG grade (screening).
 * Uses Walther-type log-log relationship for mineral oils.
 */

/** ISO VG nominal viscosity at 40 °C (mm²/s). */
export const ISO_VG_VISCOSITY_40: Record<number, number> = {
  10: 10,
  15: 15,
  22: 22,
  32: 32,
  46: 46,
  68: 68,
  100: 100,
  150: 150,
  220: 220,
  320: 320,
  460: 460,
  680: 680,
};

export type OilLubricationInputs = {
  isoVgGrade: number;
  operatingTempC: number;
};

/**
 * Estimate kinematic viscosity ν at operating temperature (mm²/s).
 * ASTM D341 / Walther screening for mineral oils.
 */
export function kinematicViscosityAtTemp(isoVgGrade: number, operatingTempC: number): number {
  const nu40 = ISO_VG_VISCOSITY_40[isoVgGrade] ?? isoVgGrade;
  const t = Math.max(operatingTempC, 10);
  const logNu40 = Math.log10(nu40 + 0.8);
  const logNuT = logNu40 - 0.035 * (t - 40);
  return Math.max(Math.pow(10, logNuT) - 0.8, 0.5);
}

/** Grease effective viscosity screening at operating speed (mm²/s). */
export function greaseEffectiveViscosity(
  baseOilVg: number,
  operatingTempC: number,
  speedRpm: number,
  meanDiameterMm: number
): number {
  const oilNu = kinematicViscosityAtTemp(baseOilVg, operatingTempC);
  const nDm = speedRpm * meanDiameterMm;
  const shearFactor = nDm > 50000 ? 0.4 : nDm > 20000 ? 0.6 : 0.85;
  return oilNu * shearFactor;
}
