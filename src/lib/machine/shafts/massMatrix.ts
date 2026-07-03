/**
 * Lumped mass matrix for lateral critical-speed estimation
 */

import type { ShaftFEMModel } from "./femTypes";

export function buildLumpedMassMatrix(model: ShaftFEMModel): number[][] {
  const nDOF = model.nodes.length * 6;
  const M: number[][] = Array(nDOF)
    .fill(0)
    .map(() => Array(nDOF).fill(0));

  for (const element of model.elements) {
    const mass = element.density * element.area * element.length;
    const lump = mass / 2;
    for (const nodeIdx of [element.startNode, element.endNode]) {
      const base = nodeIdx * 6;
      M[base + 1]![base + 1]! += lump;
      M[base + 2]![base + 2]! += lump;
    }
  }

  return M;
}

function reduceMatrix(A: number[][], freeDofs: number[]): number[][] {
  const n = freeDofs.length;
  const R: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      R[i]![j]! = A[freeDofs[i]!]![freeDofs[j]!]!;
    }
  }
  return R;
}

export function computeLateralCriticalSpeeds(
  K: number[][],
  M: number[][],
  constraints: { dof: number; value: number }[],
  numModes = 2
): { speedsRpm: number[]; modeShape: number[] } {
  const n = K.length;
  const constrained = new Set(constraints.map((c) => c.dof));
  const lateralDofs: number[] = [];
  for (let i = 0; i < n; i++) {
    const local = i % 6;
    if ((local === 1 || local === 2) && !constrained.has(i)) {
      lateralDofs.push(i);
    }
  }

  if (lateralDofs.length === 0) {
    return { speedsRpm: [0], modeShape: [] };
  }

  const Kr = reduceMatrix(K, lateralDofs);
  const Mr = reduceMatrix(M, lateralDofs);
  const m = lateralDofs.length;

  const speedsRpm: number[] = [];
  let v: number[] = Array(m)
    .fill(0)
    .map(() => Math.random() + 0.1);

  for (let mode = 0; mode < numModes; mode++) {
    for (let iter = 0; iter < 80; iter++) {
      const Mv = matrixVector(Mr, v);
      const y = solveReduced(Kr, Mv);
      const norm = Math.sqrt(y.reduce((s, yi) => s + yi * yi, 0));
      if (norm < 1e-20) break;
      v = y.map((yi) => yi / norm);
    }

    const Mv = matrixVector(Mr, v);
    const Ky = matrixVector(Kr, v);
    const num = dot(v, Ky);
    const den = dot(v, Mv);
    const omegaSq = den > 0 ? num / den : 0;
    const omega = Math.sqrt(Math.max(omegaSq, 0));
    speedsRpm.push((omega * 60) / (2 * Math.PI));

    if (mode < numModes - 1) {
      const ref = [...v];
      v = Array(m)
        .fill(0)
        .map(() => Math.random() + 0.1);
      const proj = dot(v, ref) / Math.max(dot(ref, ref), 1e-12);
      v = v.map((vi, i) => vi - proj * ref[i]!);
    }
  }

  return { speedsRpm: speedsRpm.filter((s) => s > 0).sort((a, b) => a - b), modeShape: v };
}

function matrixVector(A: number[][], v: number[]): number[] {
  return A.map((row) => row.reduce((s, aij, j) => s + aij * v[j]!, 0));
}

function dot(a: number[], b: number[]): number {
  return a.reduce((s, ai, i) => s + ai * b[i]!, 0);
}

function solveReduced(K: number[][], b: number[]): number[] {
  const n = K.length;
  const A = K.map((row) => [...row]);
  const x = [...b];

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k]![i]!) > Math.abs(A[maxRow]![i]!)) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow]!, A[i]!];
    [x[i], x[maxRow]] = [x[maxRow]!, x[i]!];

    const pivot = A[i]![i]!;
    if (Math.abs(pivot) < 1e-14) continue;

    for (let k = i + 1; k < n; k++) {
      const factor = A[k]![i]! / pivot;
      for (let j = i; j < n; j++) {
        A[k]![j]! -= factor * A[i]![j]!;
      }
      x[k]! -= factor * x[i]!;
    }
  }

  const u: number[] = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = x[i]!;
    for (let j = i + 1; j < n; j++) {
      sum -= A[i]![j]! * u[j]!;
    }
    u[i] = Math.abs(A[i]![i]!) > 1e-14 ? sum / A[i]![i]! : 0;
  }
  return u;
}
