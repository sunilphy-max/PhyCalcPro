/**
 * Shaft Post-Processing
 * Recovers stresses and advanced quantities from FEA solution.
 */

import type { ShaftFEMModel } from "./femTypes";

export type ShaftStressRecovery = {
  x: number[];
  torqueDistribution: number[];
  bendingMomentDistribution: number[];
  shearStress: number[];
  bendingStress: number[];
  vonMisesStress: number[];
  deflection: number[];
  rotation: number[];
};

export function recoverStresses(
  model: ShaftFEMModel,
  displacements: number[]
): ShaftStressRecovery {
  const x: number[] = [];
  const torqueDistribution: number[] = [];
  const bendingMomentDistribution: number[] = [];
  const shearStress: number[] = [];
  const bendingStress: number[] = [];
  const vonMisesStress: number[] = [];
  const deflection: number[] = [];
  const rotation: number[] = [];

  for (const node of model.nodes) {
    x.push(node.x);
  }

  for (const element of model.elements) {
    const n1 = element.startNode;
    const n2 = element.endNode;
    const length = element.length;

    // Element DOF: [u1, v1, w1, thetaX1, thetaY1, thetaZ1, u2, v2, w2, thetaX2, thetaY2, thetaZ2].
    const u1 = displacements[n1 * 6 + 0];
    const v1 = displacements[n1 * 6 + 1];
    const w1 = displacements[n1 * 6 + 2];
    const thetaX1 = displacements[n1 * 6 + 3];
    const thetaY1 = displacements[n1 * 6 + 4];
    const thetaZ1 = displacements[n1 * 6 + 5];

    const u2 = displacements[n2 * 6 + 0];
    const thetaX2 = displacements[n2 * 6 + 3];
    const thetaY2 = displacements[n2 * 6 + 4];
    const thetaZ2 = displacements[n2 * 6 + 5];

    const axialStrain = (u2 - u1) / length;
    const torsionalStrain = (thetaX2 - thetaX1) / length;
    const bendingCurvatureY = (thetaZ2 - thetaZ1) / length;
    const bendingCurvatureZ = (thetaY2 - thetaY1) / length;

    const radius = element.diameter / 2;
    const elasticModulus = element.E;
    const shearModulus = element.G;

    const axialStress = elasticModulus * axialStrain;
    const torsionalShearStress = shearModulus * radius * torsionalStrain;
    const bendingStressY = elasticModulus * bendingCurvatureY * radius;
    const bendingStressZ = elasticModulus * bendingCurvatureZ * radius;
    const combinedBendingStress = Math.hypot(bendingStressY, bendingStressZ);
    const vonMises = Math.sqrt(
      axialStress * axialStress +
        3 * torsionalShearStress * torsionalShearStress +
        combinedBendingStress * combinedBendingStress
    );

    torqueDistribution.push(
      Math.abs(shearModulus * element.polarMoment * torsionalStrain)
    );
    bendingMomentDistribution.push(
      Math.abs(elasticModulus * element.secondMoment * bendingCurvatureY)
    );
    shearStress.push(Math.abs(torsionalShearStress));
    bendingStress.push(Math.abs(combinedBendingStress));
    vonMisesStress.push(Math.abs(vonMises));
    deflection.push(Math.hypot(v1, w1));
    rotation.push(Math.abs(thetaX1));
  }

  return {
    x,
    torqueDistribution,
    bendingMomentDistribution,
    shearStress,
    bendingStress,
    vonMisesStress,
    deflection,
    rotation,
  };
}

export function calculateCriticalSpeed(eigenvalues: number[]): number {
  if (eigenvalues.length === 0) return 0;

  const omegaN = Math.sqrt(eigenvalues[0]);
  return (omegaN / (2 * Math.PI)) * 60;
}

export function determineSafetyStatus(
  maxStress: number,
  yieldStress: number,
  safetyFactor: number
): "safe" | "warning" | "critical" {
  const computedSafetyFactor = yieldStress / Math.max(maxStress, 1);

  if (computedSafetyFactor >= safetyFactor) {
    return "safe";
  }

  if (computedSafetyFactor >= safetyFactor * 0.7) {
    return "warning";
  }

  return "critical";
}
