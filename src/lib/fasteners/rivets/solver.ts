import type { RivetConfig, RivetResult } from "./types";

export function solveRivetDesign(config: RivetConfig): RivetResult {
  const area = Math.PI * (config.rivetDiameter / 2) ** 2;
  const shearStress = Math.abs(config.shearForce) / Math.max(area * config.quantity, 1e-9);
  const axialStress = Math.abs(config.axialForce) / Math.max(area * config.quantity, 1e-9);
  const bearingArea = Math.max(1e-9, config.quantity * config.rivetDiameter * config.plateThickness);
  const bearingStress = Math.abs(config.shearForce) / bearingArea;
  const vonMisesStress = Math.sqrt(axialStress ** 2 + 3 * shearStress ** 2);

  const rivetTypeFactor = config.rivetType === "blind" ? 0.85 : 1;
  const allowableShear = config.material.shearStrength * rivetTypeFactor;
  const allowableAxial = config.material.yieldStress;
  const allowableBearing = config.material.bearingStrength * rivetTypeFactor;

  const safetyFactorShear = allowableShear / Math.max(shearStress, 1e-12);
  const safetyFactorAxial = allowableAxial / Math.max(axialStress, 1e-12);
  const safetyFactorBearing = allowableBearing / Math.max(bearingStress, 1e-12);
  const safetyFactorOverall = Math.min(safetyFactorShear, safetyFactorAxial, safetyFactorBearing);

  const governingMode =
    safetyFactorOverall === safetyFactorShear
      ? "shear"
      : safetyFactorOverall === safetyFactorAxial
      ? "axial"
      : "bearing";
  const designStatus = safetyFactorOverall >= 2 ? "safe" : safetyFactorOverall >= 1 ? "warning" : "critical";

  return {
    rivetDiameter: config.rivetDiameter,
    plateThickness: config.plateThickness,
    quantity: config.quantity,
    shearForce: config.shearForce,
    axialForce: config.axialForce,
    rivetArea: area,
    shearStress,
    axialStress,
    bearingStress,
    vonMisesStress,
    allowableShear,
    allowableAxial,
    allowableBearing,
    safetyFactorShear,
    safetyFactorAxial,
    safetyFactorBearing,
    safetyFactorOverall,
    governingMode,
    designStatus,
    material: config.material,
    rivetType: config.rivetType,
  };
}
