/**
 * Shaft FEA Solver
 * Comprehensive FEM-based shaft analysis with proper physics
 */

import { generateShaftMesh } from "./mesh";
import { assembleGlobalStiffness } from "./stiffness";
import { createLoadVector, applyConstraints } from "./loadVector";
import { solveLinearSystem, computeEigenvalues } from "./linearSolver";
import { recoverStresses, calculateCriticalSpeed, determineSafetyStatus } from "./femPost";
import type { ShaftConfig, ShaftResult, LoadCase } from "./types";
import type { ShaftFEMModel } from "./femTypes";

export function solveShaftFEM(config: ShaftConfig): ShaftResult {
  const { geometry, material, loads, meshSegments = 50 } = config;
  const divisions = Math.max(10, Math.round(meshSegments));
  const model = generateShaftMesh(
    geometry.length,
    geometry.diameter,
    material.E,
    material.G,
    divisions
  );

  const stiffness = assembleGlobalStiffness(model.nodes, model.elements);
  const { F } = createLoadVector(model.nodes.length, loads, geometry.length);
  const constraints = applyConstraints(model.nodes.length, "fixed");
  const displacements = solveLinearSystem(stiffness, F, constraints);

  const post = recoverStresses(model, displacements, material.yieldStress);

  const maxStress = Math.max(...post.vonMisesStress, 0);
  const maxShear = Math.max(...post.shearStress, 0);
  const maxBending = Math.max(...post.bendingStress, 0);
  const maxDeflection = Math.max(...post.deflection, 0);
  const maxTorque = Math.max(...post.torqueDistribution, 0);
  const maxBendingMoment = Math.max(...post.bendingMomentDistribution, 0);

  const safetyFactor = Math.max(material.yieldStress / Math.max(maxStress, 1e-12), 0);
  const designStatus =
    safetyFactor >= 1.5 ? "safe" : safetyFactor >= 1.2 ? "warning" : "critical";

  const criticalIndex = post.vonMisesStress.indexOf(maxStress);
  const criticalSection = model.nodes[criticalIndex]?.x ?? 0;

  const radius = geometry.diameter / 2;
  const area = Math.PI * Math.pow(radius, 2);
  const secondMoment = Math.PI * Math.pow(geometry.diameter, 4) / 64;
  const beta = 1.875;
  const omegaCrit = Math.pow(beta, 2) *
    Math.sqrt((material.E * secondMoment) / (material.density * area * Math.pow(geometry.length, 4)));
  const criticalSpeed = Math.max((omegaCrit * 60) / (2 * Math.PI), 0);

  return {
    ...post,
    maxStress,
    maxShearStress: maxShear,
    maxBendingStress: maxBending,
    maxDeflection,
    maxTorque,
    maxBendingMoment,
    safetyFactor,
    designStatus,
    isSafe: designStatus === "safe",
    criticalSection,
    criticalSpeed,
    analysisType: "FEA",
    diameter: geometry.diameter,
    radius,
    polarMoment: Math.PI * Math.pow(geometry.diameter, 4) / 32,
    secondMoment,
  };
}
