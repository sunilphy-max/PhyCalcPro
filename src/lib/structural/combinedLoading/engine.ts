import type { CombinedLoadingConfig, CombinedLoadingResult } from "./types";

export function solveCombinedLoadingEngine(
  config: CombinedLoadingConfig
): CombinedLoadingResult {
  const width = Math.max(1e-6, config.width);
  const height = Math.max(1e-6, config.height);
  const area = width * height;
  const Ixx = (width * Math.pow(height, 3)) / 12;
  const J = (width * Math.pow(height, 3)) / 3;
  const c = height / 2;
  const axialStress = config.axialForce / area;
  const bendingStress = config.bendingMoment * c / Ixx;
  const torsionalShear = config.torque * c / J;
  const shearStress = config.shearForce / area;
  const combinedStress = axialStress + bendingStress;
  // Orthogonal shear contributions (torsion + transverse) via RSS, then von Mises.
  const shearEquivalent = Math.hypot(torsionalShear, shearStress);
  const vonMisesStress = Math.sqrt(
    combinedStress * combinedStress + 3 * shearEquivalent * shearEquivalent
  );
  const safetyFactor = vonMisesStress > 0 ? config.yieldStrength / vonMisesStress : Number.POSITIVE_INFINITY;
  const designStatus: CombinedLoadingResult["designStatus"] =
    safetyFactor >= 2 ? "safe" : safetyFactor >= 1.25 ? "warning" : "critical";

  return {
    area,
    Ixx,
    J,
    axialStress,
    bendingStress,
    torsionalShear,
    shearStress,
    vonMisesStress,
    safetyFactor,
    designStatus,
  };
}
