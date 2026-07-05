import type { ShellConfig, ShellResult } from "./types";

/** Thin cylindrical shell screening (Roark / ASME Division 1 membrane + bending). */
export function solveShellEngine(c: ShellConfig): ShellResult {
  const r = Math.max(c.radius, 1e-9);
  const t = Math.max(c.thickness, 1e-9);
  const L = Math.max(c.length, 1e-9);

  const hoopStress = (c.internalPressure * r) / t;
  const axialMembrane =
    c.endCondition === "closed"
      ? (c.internalPressure * r) / (2 * t)
      : 0;
  const axialFromForce = c.axialForce / (2 * Math.PI * r * t);
  const axialStress = axialMembrane + axialFromForce;

  const sectionModulus = (Math.PI * (2 * r) ** 2 * t) / 4;
  const bendingStress = Math.abs(c.bendingMoment) / Math.max(sectionModulus, 1e-12);

  const sx = hoopStress;
  const sy = axialStress + bendingStress;
  const vonMisesStress = Math.sqrt(sx ** 2 - sx * sy + sy ** 2);
  const allowable = Math.max(c.allowableStress, 1e-6);
  const safetyFactor = allowable / Math.max(vonMisesStress, 1e-9);

  const E = c.modulus;
  const maxDeflection =
    (5 * c.internalPressure * L ** 4) / (384 * E * ((Math.PI * r ** 3 * t) / 12));

  const status =
    safetyFactor >= 2
      ? "Adequate membrane + bending margin (indicative)"
      : safetyFactor >= 1
        ? "Marginal — review load combinations and local effects"
        : "Overstressed — increase thickness or reduce loads";

  return {
    hoopStress,
    axialStress,
    bendingStress,
    vonMisesStress,
    safetyFactor,
    maxDeflection,
    status,
  };
}
