import type { WeldConfig, WeldResult } from "./types";

function weldThroatSize(type: WeldConfig["weldType"], weldSize: number) {
  return type === "fillet" ? weldSize * 0.7071 : weldSize;
}

export function solveWeldDesign(config: WeldConfig): WeldResult {
  const throatSize = weldThroatSize(config.weldType, config.weldSize);
  const totalThroatArea = throatSize * config.weldLength * config.weldCount;
  const shearStress = totalThroatArea > 0 ? Math.abs(config.shearForce) / totalThroatArea : 0;
  const axialStress = totalThroatArea > 0 ? Math.abs(config.axialForce) / totalThroatArea : 0;
  const resultantStress = Math.sqrt(shearStress * shearStress + axialStress * axialStress);

  const allowableShear = 0.6 * config.material.strength;
  const allowableAxial = 0.4 * config.material.strength;
  const allowableResultant = 0.5 * config.material.strength;

  const safetyFactorShear = allowableShear / Math.max(shearStress, 1e-12);
  const safetyFactorAxial = allowableAxial / Math.max(axialStress, 1e-12);
  const safetyFactorResultant = allowableResultant / Math.max(resultantStress, 1e-12);
  const safetyFactorOverall = Math.min(safetyFactorShear, safetyFactorAxial, safetyFactorResultant);

  const governingMode =
    safetyFactorOverall === safetyFactorShear
      ? "shear"
      : safetyFactorOverall === safetyFactorAxial
      ? "axial"
      : "resultant";

  const designStatus =
    safetyFactorOverall >= 2 ? "safe" : safetyFactorOverall >= 1 ? "warning" : "critical";

  return {
    weldType: config.weldType,
    weldSize: config.weldSize,
    weldLength: config.weldLength,
    weldCount: config.weldCount,
    throatSize,
    totalThroatArea,
    shearStress,
    axialStress,
    resultantStress,
    allowableShear,
    allowableAxial,
    allowableResultant,
    safetyFactorShear,
    safetyFactorAxial,
    safetyFactorResultant,
    safetyFactorOverall,
    governingMode,
    designStatus,
    material: config.material,
  };
}
