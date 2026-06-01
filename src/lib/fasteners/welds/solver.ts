import type { WeldConfig, WeldResult } from "./types";

function weldThroatSize(type: WeldConfig["weldType"], weldSize: number) {
  return type === "fillet" ? weldSize * 0.7071 : weldSize;
}

/** Polar moment of inertia for n parallel line welds (unit throat), Roark-style. */
function weldGroupPolarInertia(weldLength: number, weldCount: number, throatSize: number) {
  const unitArea = throatSize * weldLength;
  if (weldCount <= 1) {
    return unitArea * (weldLength * weldLength) / 12;
  }
  const spacing = weldLength / Math.max(weldCount - 1, 1);
  let j = 0;
  for (let i = 0; i < weldCount; i++) {
    const y = -weldLength / 2 + i * spacing;
    j += unitArea * y * y + (unitArea * weldLength * weldLength) / 12;
  }
  return Math.max(j, 1e-18);
}

export function solveWeldDesign(config: WeldConfig): WeldResult {
  const throatSize = weldThroatSize(config.weldType, config.weldSize);
  const totalThroatArea = throatSize * config.weldLength * config.weldCount;
  const directShearStress = totalThroatArea > 0 ? Math.abs(config.shearForce) / totalThroatArea : 0;
  const axialStress = totalThroatArea > 0 ? Math.abs(config.axialForce) / totalThroatArea : 0;

  const eccentricity = Math.max(config.eccentricity ?? 0, 0);
  const bendingMoment =
    config.bendingMoment ?? Math.abs(config.shearForce) * eccentricity;
  const polarMomentOfInertia = weldGroupPolarInertia(
    config.weldLength,
    config.weldCount,
    throatSize
  );
  const polarRadius = config.weldLength / 2;
  const momentShearStress =
    polarMomentOfInertia > 0 ? (bendingMoment * polarRadius) / polarMomentOfInertia : 0;
  const shearStress = Math.sqrt(
    directShearStress * directShearStress + momentShearStress * momentShearStress
  );
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
    directShearStress,
    momentShearStress,
    bendingMoment,
    polarMomentOfInertia,
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
