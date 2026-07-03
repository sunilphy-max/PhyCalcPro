/**
 * Shaft Post-Processing
 */

import type { ShaftFEMModel } from "./femTypes";
import type { BearingSupport } from "./types";

export type ShaftStressRecovery = {
  x: number[];
  torqueDistribution: number[];
  bendingMomentDistribution: number[];
  shearForce: number[];
  shearStress: number[];
  bendingStress: number[];
  vonMisesStress: number[];
  deflection: number[];
  slope: number[];
  rotation: number[];
};

export function recoverStresses(
  model: ShaftFEMModel,
  displacements: number[]
): ShaftStressRecovery {
  const nNodes = model.nodes.length;
  const x = model.nodes.map((n) => n.x);

  const torqueDistribution = Array(nNodes).fill(0);
  const bendingMomentDistribution = Array(nNodes).fill(0);
  const shearStress = Array(nNodes).fill(0);
  const bendingStress = Array(nNodes).fill(0);
  const vonMisesStress = Array(nNodes).fill(0);
  const deflection = Array(nNodes).fill(0);
  const slope = Array(nNodes).fill(0);
  const rotation = Array(nNodes).fill(0);
  const counts = Array(nNodes).fill(0);

  for (const element of model.elements) {
    const n1 = element.startNode;
    const n2 = element.endNode;
    const length = element.length;

    const u1 = displacements[n1 * 6 + 0]!;
    const v1 = displacements[n1 * 6 + 1]!;
    const w1 = displacements[n1 * 6 + 2]!;
    const thetaX1 = displacements[n1 * 6 + 3]!;
    const thetaY1 = displacements[n1 * 6 + 4]!;
    const thetaZ1 = displacements[n1 * 6 + 5]!;

    const u2 = displacements[n2 * 6 + 0]!;
    const thetaX2 = displacements[n2 * 6 + 3]!;
    const thetaY2 = displacements[n2 * 6 + 4]!;
    const thetaZ2 = displacements[n2 * 6 + 5]!;

    const axialStrain = (u2 - u1) / length;
    const torsionalStrain = (thetaX2 - thetaX1) / length;
    const curvXY = (thetaY2 - thetaY1) / length;
    const curvXZ = (thetaZ2 - thetaZ1) / length;

    const radius = element.diameter / 2;
    const E = element.E;
    const G = element.G;

    const axialStress = E * axialStrain;
    const torsionalShearStress = G * radius * torsionalStrain;
    const bendingStressXY = E * curvXY * radius;
    const bendingStressXZ = E * curvXZ * radius;
    const combinedBendingStress = Math.hypot(bendingStressXY, bendingStressXZ);
    const vonMises = Math.sqrt(
      axialStress * axialStress +
        3 * torsionalShearStress * torsionalShearStress +
        combinedBendingStress * combinedBendingStress
    );

    const torque = Math.abs(G * element.polarMoment * torsionalStrain);
    const moment = Math.hypot(
      E * element.secondMoment * curvXY,
      E * element.secondMoment * curvXZ
    );

    for (const [nodeIdx, thetaY, thetaZ, v, w, tx] of [
      [n1, thetaY1, thetaZ1, v1, w1, thetaX1] as const,
      [n2, thetaY2, thetaZ2, displacements[n2 * 6 + 1]!, displacements[n2 * 6 + 2]!, thetaX2] as const,
    ]) {
      torqueDistribution[nodeIdx] += torque;
      bendingMomentDistribution[nodeIdx] += moment;
      shearStress[nodeIdx] += Math.abs(torsionalShearStress);
      bendingStress[nodeIdx] += combinedBendingStress;
      vonMisesStress[nodeIdx] += vonMises;
      deflection[nodeIdx] += Math.hypot(v, w);
      slope[nodeIdx] += Math.hypot(thetaY, thetaZ);
      rotation[nodeIdx] += Math.abs(tx);
      counts[nodeIdx]++;
    }
  }

  for (let i = 0; i < nNodes; i++) {
    const c = Math.max(counts[i]!, 1);
    torqueDistribution[i] /= c;
    bendingMomentDistribution[i] /= c;
    shearStress[i] /= c;
    bendingStress[i] /= c;
    vonMisesStress[i] /= c;
    deflection[i] /= c;
    slope[i] /= c;
    rotation[i] /= c;
  }

  const shearForce = computeShearForce(model, bendingMomentDistribution);

  return {
    x,
    torqueDistribution,
    bendingMomentDistribution,
    shearForce,
    shearStress,
    bendingStress,
    vonMisesStress,
    deflection,
    slope,
    rotation,
  };
}

function computeShearForce(model: ShaftFEMModel, moment: number[]): number[] {
  const n = model.nodes.length;
  const shear = Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) {
    const dx = model.nodes[i + 1]!.x - model.nodes[i]!.x;
    if (dx > 0) {
      shear[i] = Math.abs((moment[i + 1]! - moment[i]!) / dx);
    }
  }
  if (n > 1) shear[n - 1] = shear[n - 2] ?? 0;
  return shear;
}

export function bearingSlopes(
  model: ShaftFEMModel,
  displacements: number[],
  supports: BearingSupport[]
): { position: number; slopeRad: number }[] {
  return supports.map((support) => {
    let nearest = 0;
    let minDist = Infinity;
    for (let i = 0; i < model.nodes.length; i++) {
      const d = Math.abs(model.nodes[i]!.x - support.position);
      if (d < minDist) {
        minDist = d;
        nearest = i;
      }
    }
    const thetaY = displacements[nearest * 6 + 4]!;
    const thetaZ = displacements[nearest * 6 + 5]!;
    return {
      position: model.nodes[nearest]!.x,
      slopeRad: Math.hypot(thetaY, thetaZ),
    };
  });
}

export function determineGoverningMode(params: {
  staticSf: number;
  targetStatic: number;
  fatigueSf: number | null;
  targetFatigue: number;
  deflectionUtil: number;
  slopeUtil: number;
  criticalMargin: number | null;
  targetCritical: number;
}): string {
  const issues: { label: string; severity: number }[] = [];

  if (params.staticSf < params.targetStatic) {
    issues.push({ label: "Static yield", severity: params.targetStatic / Math.max(params.staticSf, 1e-9) });
  }
  if (params.fatigueSf != null && params.fatigueSf < params.targetFatigue) {
    issues.push({ label: "Fatigue", severity: params.targetFatigue / params.fatigueSf });
  }
  if (params.deflectionUtil > 1) {
    issues.push({ label: "Deflection", severity: params.deflectionUtil });
  }
  if (params.slopeUtil > 1) {
    issues.push({ label: "Bearing slope", severity: params.slopeUtil });
  }
  if (params.criticalMargin != null && params.criticalMargin < params.targetCritical) {
    issues.push({ label: "Critical speed", severity: params.targetCritical / params.criticalMargin });
  }

  if (issues.length === 0) return "All checks pass";
  issues.sort((a, b) => b.severity - a.severity);
  return issues[0]!.label;
}

export function determineSafetyStatus(
  safetyFactor: number,
  target = 1.5
): "safe" | "warning" | "critical" {
  if (safetyFactor >= target) return "safe";
  if (safetyFactor >= target * 0.8) return "warning";
  return "critical";
}
