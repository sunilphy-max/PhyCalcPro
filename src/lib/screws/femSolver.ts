/**
 * Screws FEA Solver
 * Comprehensive stress analysis for power and ball screws
 */

import { generateScrewMesh } from "./mesh";
import { assembleGlobalStiffness } from "./stiffness";
import { createLoadVector, applyConstraints } from "./loadVector";
import { solveLinearSystem } from "./linearSolver";
import { recoverStresses, calculateCriticalSpeed, determineScrewSafety } from "./femPost";
import type { ScrewConfig, ScrewResult } from "./types";

export function solveScrewFEM(config: ScrewConfig): ScrewResult {
  const majorDiameter = config.majorDiameter;
  const minorDiameter = majorDiameter - 2 * (5 / 8) * config.pitch;
  const pitchDiameter = (majorDiameter + minorDiameter) / 2;
  const E = 200e9; // Steel modulus
  const G = 80e9; // Steel shear modulus
  const yieldStress = 250e6;
  const meshSegments = 50;
  const screwLength = (config as any).length || config.pitch * 10; // Default to 10 pitches

  // ===========================
  // MESH GENERATION
  // ===========================
  const model = generateScrewMesh(
    screwLength,
    majorDiameter,
    minorDiameter,
    E,
    G,
    meshSegments
  );

  // ===========================
  // STIFFNESS MATRIX
  // ===========================
  const K = assembleGlobalStiffness(model);

  // ===========================
  // LOAD VECTOR
  // ===========================
  const F = createLoadVector(model.nodes.length, config.axialForce);

  // ===========================
  // BOUNDARY CONDITIONS
  // ===========================
  const constraints = applyConstraints(model.nodes.length);

  // ===========================
  // SOLVE SYSTEM
  // ===========================
  let displacements: number[] = [];
  try {
    displacements = solveLinearSystem(K, F, constraints);
  } catch (e) {
    console.warn("Linear solver failed:", e);
    displacements = F.map((fi) => fi / (K[0][0] || 1));
  }

  // ===========================
  // STRESS RECOVERY
  // ===========================
  const torque = (config as any).torque || 10; // Default torque
  const stressData = recoverStresses(model, displacements, torque, config.axialForce);

  // ===========================
  // COMPUTE KEY METRICS
  // ===========================
  const maxVonMises = Math.max(...stressData.vonMisesStress, 1);
  const maxShear = Math.max(...stressData.shearStress, 1);
  const maxTensile = Math.max(...stressData.tensileStress, 1);
  const maxContact = Math.max(...stressData.contactStress, 1);

  const safetyFactor = yieldStress / Math.max(maxVonMises, 1);
  const designStatus = determineScrewSafety(maxVonMises, yieldStress, 1.5);

  // Efficiency calculation
  const lead = (config as any).lead || config.pitch;
  const L = lead;
  const pitchRadius = pitchDiameter / 2;
  const mu = (config as any).frictionCoefficient || 0.1;
  const efficiency = (L / (L + Math.PI * mu * pitchDiameter)) * 100;

  // Helix angle
  const helixAngle = Math.atan(lead / (Math.PI * pitchDiameter)) * (180 / Math.PI);

  // Critical speed
  const criticalSpeed = calculateCriticalSpeed(1.5, minorDiameter, screwLength);

  // Recommendations
  const recommendations: string[] = [];
  if (safetyFactor < 1.5) {
    recommendations.push("Increase diameter or reduce load for better safety margin");
  }
  if (efficiency < 30) {
    recommendations.push("Consider ball screw for higher efficiency");
  }

  // ===========================
  // RESULTS COMPILATION
  // ===========================
  return {
    screwType: config.screwType,
    threadType: (config as any).threadType,
    majorDiameter,
    minorDiameter,
    pitchDiameter,
    pitch: config.pitch,
    lead,
    helixAngle,
    axialForce: config.axialForce,
    torque,
    efficiency,
    shearStress: maxShear,
    compressiveStress: maxTensile,
    vonMisesStress: maxVonMises,
    safetyFactor,
    fatigueSafetyFactor: safetyFactor * 0.8,
    power: torque * ((config as any).speed || 1000) * Math.PI / 30,
    speed: (config as any).speed,
    criticalSpeed,
    bucklingLoad: yieldStress * Math.PI * (minorDiameter / 2) * (minorDiameter / 2),
    designStatus,
    recommendations,
  };
}
