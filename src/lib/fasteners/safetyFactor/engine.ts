import type { SafetyFactorConfig, SafetyFactorResult } from "./types";

export function solveSafetyFactorEngine(config: SafetyFactorConfig): SafetyFactorResult {
  const diameter = Math.max(config.diameter, 1e-6);
  const area = (Math.PI * diameter ** 2) / 4;
  const inertia = (Math.PI * diameter ** 4) / 64;
  const polarMoment = (Math.PI * diameter ** 4) / 32;
  const radius = diameter / 2;

  const axialStress = config.axialForce / area;
  const bendingStress = config.bendingMoment * radius / inertia;
  const torsionalStress = config.torque * radius / polarMoment;
  const shearStress = config.shearForce / area;
  const normalStress = axialStress + bendingStress;
  const combinedShear = Math.sqrt(shearStress ** 2 + torsionalStress ** 2);
  const vonMisesStress = Math.sqrt(normalStress ** 2 + 3 * combinedShear ** 2);

  const safetyFactorYield = vonMisesStress > 0 ? config.yieldStrength / vonMisesStress : Number.POSITIVE_INFINITY;
  const safetyFactorUltimate = vonMisesStress > 0 ? config.ultimateStrength / vonMisesStress : Number.POSITIVE_INFINITY;
  const governingFactor = Math.min(safetyFactorYield, safetyFactorUltimate);
  const governingLimit = safetyFactorYield <= safetyFactorUltimate ? "yield" : "ultimate";
  const designStatus: SafetyFactorResult["designStatus"] =
    governingFactor >= 1.5 ? "safe" : governingFactor >= 1.2 ? "warning" : "critical";

  return {
    diameter,
    area,
    polarMoment,
    axialStress,
    bendingStress,
    torsionalStress,
    shearStress,
    vonMisesStress,
    safetyFactorYield,
    safetyFactorUltimate,
    governingFactor,
    governingLimit,
    designStatus,
  };
}
