/**
 * Screws Post-Processing
 * Extracts stresses from nodal displacements
 */

import type { ScrewFEAModel, ScrewStressData } from "./femTypes";

/**
 * Recover stresses from displacements
 */
export function recoverStresses(
  model: ScrewFEAModel,
  displacements: number[],
  torque: number,
  axialForce: number
): ScrewStressData {
  const x: number[] = [];
  const shearStress: number[] = [];
  const tensileStress: number[] = [];
  const contactStress: number[] = [];
  const vonMisesStress: number[] = [];

  for (const node of model.nodes) {
    x.push(node.x);

    const disp = displacements[node.id] || 0;
    const r = node.r;

    // Tensile stress from axial force
    const sigma_t = axialForce / (Math.PI * r * r);

    // Shear stress from torque
    const J = Math.PI * r * r * r * r / 32;
    const tau = (torque * r) / J;

    // Contact stress (simplified Hertzian, approximate)
    const tau_c = Math.abs(disp * 1000); // Contact contribution

    // Von Mises
    const sigma_vm = Math.sqrt(sigma_t * sigma_t + 3 * tau * tau);

    shearStress.push(tau);
    tensileStress.push(sigma_t);
    contactStress.push(tau_c);
    vonMisesStress.push(sigma_vm);
  }

  return { x, shearStress, tensileStress, contactStress, vonMisesStress };
}

/**
 * Calculate critical speed from eigenvalue
 */
export function calculateCriticalSpeed(
  eigenvalue: number,
  diameter: number,
  length: number
): number {
  const N_cr = (Math.sqrt(eigenvalue) * 3.0e8 * diameter) / (length * length);
  return Math.max(N_cr, 100); // Minimum 100 rpm
}

/**
 * Determine design status
 */
export function determineScrewSafety(
  vonMisesStress: number,
  yieldStress: number,
  safetyFactor: number = 1.5
): "safe" | "warning" | "critical" {
  const ratio = vonMisesStress / yieldStress;

  if (ratio < 1 / safetyFactor) {
    return "safe";
  } else if (ratio < 0.9) {
    return "warning";
  } else {
    return "critical";
  }
}
