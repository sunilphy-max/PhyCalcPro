/**
 * Shaft Post-Processing
 * Recovers stresses and advanced quantities from FEA solution
 */

import type { ShaftFEMModel, ShaftElement } from "./femTypes";

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

/**
 * Recover stresses from element displacements
 */
export function recoverStresses(
  model: ShaftFEMModel,
  displacements: number[],
  materialYield: number
): ShaftStressRecovery {
  const x: number[] = [];
  const torqueDistribution: number[] = [];
  const bendingMomentDistribution: number[] = [];
  const shearStress: number[] = [];
  const bendingStress: number[] = [];
  const vonMisesStress: number[] = [];
  const deflection: number[] = [];
  const rotation: number[] = [];

  // Sample at nodes and element centers
  for (const node of model.nodes) {
    x.push(node.x);
  }

  for (const element of model.elements) {
    const n1 = element.startNode;
    const n2 = element.endNode;
    const L = element.length;

    // Element DOF: [u1, v1, w1, θx1, θy1, θz1, u2, v2, w2, θx2, θy2, θz2]
    const u1 = displacements[n1 * 6 + 0];
    const v1 = displacements[n1 * 6 + 1];
    const w1 = displacements[n1 * 6 + 2];
    const θx1 = displacements[n1 * 6 + 3];
    const θy1 = displacements[n1 * 6 + 4];
    const θz1 = displacements[n1 * 6 + 5];

    const u2 = displacements[n2 * 6 + 0];
    const v2 = displacements[n2 * 6 + 1];
    const w2 = displacements[n2 * 6 + 2];
    const θx2 = displacements[n2 * 6 + 3];
    const θy2 = displacements[n2 * 6 + 4];
    const θz2 = displacements[n2 * 6 + 5];

    // Strain recovery (simplified - linear distribution)
    const axialStrain = (u2 - u1) / L;
    const shearStrainX = (v2 - v1) / L - (θz1 + θz2) / 2;
    const shearStrainY = (w2 - w1) / L + (θy1 + θy2) / 2;
    const torsionalStrain = (θx2 - θx1) / L;
    const bendingCurvatureY = (θz2 - θz1) / L;
    const bendingCurvatureZ = (θy2 - θy1) / L;

    // Stress computation
    const radius = element.diameter / 2;
    const E = element.E;
    const G = element.G;

    // Axial stress
    const axialStress = E * axialStrain;

    // Torsional shear stress (at outer fiber)
    const τ = G * torsionalStrain * element.polarMoment / radius;

    // Bending stresses
    const σbY = E * bendingCurvatureY * radius;
    const σbZ = E * bendingCurvatureZ * radius;
    const σb = Math.sqrt(σbY * σbY + σbZ * σbZ);

    // Von Mises stress
    const σvm = Math.sqrt(
      axialStress * axialStress + 3 * τ * τ + σb * σb
    );

    // Deflection (absolute value)
    const deflectionValue = Math.sqrt(v1 * v1 + w1 * w1);

    torqueDistribution.push(Math.abs(G * element.polarMoment * torsionalStrain));
    bendingMomentDistribution.push(Math.abs(E * element.secondMoment * bendingCurvatureY));
    shearStress.push(Math.abs(τ));
    bendingStress.push(Math.abs(σb));
    vonMisesStress.push(Math.abs(σvm));
    deflection.push(deflectionValue);
    rotation.push(Math.abs(θx1));
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

/**
 * Calculate critical speed for shaft
 * Based on fundamental natural frequency
 */
export function calculateCriticalSpeed(
  eigenvalues: number[],
  diameter: number,
  density: number
): number {
  if (eigenvalues.length === 0) return 0;

  // First natural frequency in rad/s
  const ωn = Math.sqrt(eigenvalues[0]);

  // Convert to RPM: RPM = (ωn / 2π) * 60
  const rpm = (ωn / (2 * Math.PI)) * 60;

  return rpm;
}

/**
 * Determine safety status
 */
export function determineSafetyStatus(
  maxStress: number,
  yieldStress: number,
  safetyFactor: number
): "safe" | "warning" | "critical" {
  const SF = yieldStress / Math.max(maxStress, 1);

  if (SF >= safetyFactor) {
    return "safe";
  } else if (SF >= safetyFactor * 0.7) {
    return "warning";
  } else {
    return "critical";
  }
}
