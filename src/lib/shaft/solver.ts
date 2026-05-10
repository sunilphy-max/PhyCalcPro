/**
 * Shaft Solver
 * Calculates torsional, bending, and combined stresses
 */

import type { ShaftConfig, ShaftResult, LoadCase } from "./types";

/**
 * Calculate polar and second moments of inertia
 */
function calculateGeometry(diameter: number) {
  const radius = diameter / 2;
  const polarMoment = (Math.PI * Math.pow(diameter, 4)) / 32; // J = π*D^4/32
  const secondMoment = (Math.PI * Math.pow(diameter, 4)) / 64; // I = π*D^4/64
  return { radius, polarMoment, secondMoment };
}

/**
 * Distribute loads along shaft
 */
function calculateLoadDistribution(
  length: number,
  loads: LoadCase[],
  n: number
): {
  x: number[];
  torque: number[];
  bendingMoment: number[];
  axialForce: number[];
} {
  const x: number[] = [];
  const torque: number[] = [];
  const bendingMoment: number[] = [];
  const axialForce: number[] = [];

  for (let i = 0; i < n; i++) {
    const xi = (i / (n - 1)) * length;
    x.push(xi);

    let T = 0,
      M = 0,
      F = 0;

    for (const load of loads) {
      if (xi >= load.position) {
        T += load.torque ?? 0;
        M += load.bendingMoment ?? 0;
        F += load.axialForce ?? 0;
      }
    }

    torque.push(T);
    bendingMoment.push(M);
    axialForce.push(F);
  }

  return { x, torque, bendingMoment, axialForce };
}

/**
 * Calculate stresses and deflections
 */
function calculateStresses(
  diameter: number,
  polarMoment: number,
  secondMoment: number,
  loads: {
    x: number[];
    torque: number[];
    bendingMoment: number[];
    axialForce: number[];
  },
  yieldStress: number,
  G: number,
  E: number
): {
  shearStress: number[];
  bendingStress: number[];
  combinedStress: number[];
  deflection: number[];
  rotation: number[];
} {
  const radius = diameter / 2;
  const shearStress: number[] = [];
  const bendingStress: number[] = [];
  const combinedStress: number[] = [];
  const deflection: number[] = [];
  const rotation: number[] = [];

  for (let i = 0; i < loads.x.length; i++) {
    // Torsional shear stress: τ = T*r/J
    const tau = Math.abs((loads.torque[i] * radius) / polarMoment);

    // Bending stress: σ = M*c/I (at outer fiber)
    const sigma_b = Math.abs((loads.bendingMoment[i] * radius) / secondMoment);

    // Von Mises equivalent stress (combined)
    const sigma_combined = Math.sqrt(sigma_b * sigma_b + 3 * tau * tau);

    // Deflections (simplified, linear approximation)
    const deflectionValue = Math.abs(
      (loads.bendingMoment[i] * (loads.x[i] * loads.x[i])) / (6 * E * secondMoment)
    );
    const rotationValue = Math.abs(
      (loads.torque[i] * loads.x[i]) / (G * polarMoment)
    );

    shearStress.push(tau);
    bendingStress.push(sigma_b);
    combinedStress.push(sigma_combined);
    deflection.push(deflectionValue);
    rotation.push(rotationValue);
  }

  return { shearStress, bendingStress, combinedStress, deflection, rotation };
}

/**
 * Solve shaft design problem
 */
export function solveShaft(config: ShaftConfig): ShaftResult {
  const diameter = config.geometry.diameter;
  const length = config.geometry.length;
  const yieldStress = config.material.yieldStress;
  const G = config.material.G;
  const E = config.material.E;
  const n = config.meshSegments ?? 100;

  const { radius, polarMoment, secondMoment } = calculateGeometry(diameter);
  const loads = calculateLoadDistribution(length, config.loads, n);
  const stresses = calculateStresses(
    diameter,
    polarMoment,
    secondMoment,
    loads,
    yieldStress,
    G,
    E
  );

  const maxCombinedStress = Math.max(...stresses.combinedStress, 1);
  const maxDeflection = Math.max(...stresses.deflection, 1);
  const maxRotation = Math.max(...stresses.rotation, 1);
  const maxShearStress = Math.max(...stresses.shearStress, 1);
  const maxBendingStress = Math.max(...stresses.bendingStress, 1);

  const safetyFactor = yieldStress / Math.max(maxCombinedStress, 1);
  const isSafe = safetyFactor > 1.5;

  const criticalIndex = stresses.combinedStress.indexOf(maxCombinedStress);
  const criticalSection = loads.x[criticalIndex] ?? 0;

  return {
    diameter,
    radius,
    polarMoment,
    secondMoment,
    x: loads.x,
    shearStress: stresses.shearStress,
    bendingStress: stresses.bendingStress,
    combinedStress: stresses.combinedStress,
    deflection: stresses.deflection,
    rotation: stresses.rotation,
    maxShearStress,
    maxBendingStress,
    maxCombinedStress,
    maxDeflection,
    maxRotation,
    safetyFactor,
    isSafe,
    criticalSection,
  };
}
