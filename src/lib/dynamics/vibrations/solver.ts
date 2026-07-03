import { generateVibrationMesh } from "./mesh";
import type { VibrationConfig, VibrationResult } from "./types";

export function solveVibrationFEM(config: VibrationConfig): VibrationResult {
  const mesh = generateVibrationMesh(config);
  const dofs = mesh.nodes.length * 2;
  const K = Array.from({ length: dofs }, () => Array(dofs).fill(0));
  const M = Array.from({ length: dofs }, () => Array(dofs).fill(0));

  mesh.elements.forEach((element) => {
    const ke = elementStiffness(element, config.E);
    const me = elementMass(element);
    const dofIndices = [element.start * 2, element.start * 2 + 1, element.end * 2, element.end * 2 + 1];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        K[dofIndices[i]][dofIndices[j]] += ke[i][j];
        M[dofIndices[i]][dofIndices[j]] += me[i][j];
      }
    }
  });

  const fixedDOFs = getFixedDOFs(mesh.nodes.length, config.support);
  const { reducedK, reducedM, retainedMap } = reduceSystem(K, M, fixedDOFs);

  const modes = solveGeneralizedEigen(reducedK, reducedM, 3);

  const fullModeShapes = modes.map((mode) => {
    const full = Array(dofs).fill(0);
    for (let i = 0; i < retainedMap.length; i++) {
      full[retainedMap[i]] = mode.shape[i];
    }
    return full.filter((_, index) => index % 2 === 0);
  });

  const frequencies = modes.map((mode) => mode.frequency);
  const zeta = Math.min(Math.max(config.dampingRatio ?? 0, 0), 0.5);
  const dampFactor = Math.sqrt(Math.max(0, 1 - zeta * zeta));

  return {
    x: mesh.nodes.map((node) => node.x),
    frequencies,
    dampedNaturalFrequencies: frequencies.map((f) => f * dampFactor),
    dampingRatio: zeta,
    resonanceNote: "",
    modeShapes: fullModeShapes,
    support: config.support,
    segments: mesh.segments,
    length: mesh.length,
    modalMass: modes.map((mode) => mode.modalMass),
    modalStiffness: modes.map((mode) => mode.modalStiffness),
    fundamentalFrequency: frequencies[0] ?? 0,
  };
}

function elementStiffness(element: { length: number; I: number }, E: number) {
  const L = element.length;
  const factor = (E * element.I) / (L * L * L);

  return [
    [12 * factor, 6 * L * factor, -12 * factor, 6 * L * factor],
    [6 * L * factor, 4 * L * L * factor, -6 * L * factor, 2 * L * L * factor],
    [-12 * factor, -6 * L * factor, 12 * factor, -6 * L * factor],
    [6 * L * factor, 2 * L * L * factor, -6 * L * factor, 4 * L * L * factor],
  ];
}

function elementMass(element: { length: number; A: number; rho: number }) {
  const L = element.length;
  const m = (element.rho * element.A * L) / 420;

  return [
    [156 * m, 22 * L * m, 54 * m, -13 * L * m],
    [22 * L * m, 4 * L * L * m, 13 * L * m, -3 * L * L * m],
    [54 * m, 13 * L * m, 156 * m, -22 * L * m],
    [-13 * L * m, -3 * L * L * m, -22 * L * m, 4 * L * L * m],
  ];
}

function getFixedDOFs(nodeCount: number, support: VibrationConfig["support"]) {
  const left = [0, 1];
  const right = [nodeCount * 2 - 2, nodeCount * 2 - 1];

  switch (support) {
    case "cantilever":
      return left;
    case "fixed_fixed":
      return [...left, ...right];
    case "simply_supported":
    default:
      return [0, nodeCount * 2 - 2];
  }
}

function reduceSystem(K: number[][], M: number[][], fixedDOFs: number[]) {
  const fixedSet = new Set(fixedDOFs);
  const retainedMap: number[] = [];
  for (let i = 0; i < K.length; i++) {
    if (!fixedSet.has(i)) retainedMap.push(i);
  }

  const reducedK = retainedMap.map((row) => retainedMap.map((col) => K[row][col]));
  const reducedM = retainedMap.map((row) => retainedMap.map((col) => M[row][col]));

  return { reducedK, reducedM, retainedMap };
}

function solveGeneralizedEigen(K: number[][], M: number[][], modes: number) {
  const n = K.length;
  const results: Array<{ frequency: number; shape: number[]; modalMass: number; modalStiffness: number }> = [];

  const previousModes: number[][] = [];

  for (let modeIndex = 0; modeIndex < modes; modeIndex++) {
    let x = Array.from({ length: n }, () => Math.random() - 0.5);
    x = normalizeWithMass(x, M);

    let lastLambda = 0;
    for (let iteration = 0; iteration < 80; iteration++) {
      let y = multiplyMatrixVector(M, x);
      y = solveLinearSystem(K, y);

      for (const prev of previousModes) {
        const projection = dot(y, multiplyMatrixVector(M, prev));
        y = subtract(y, scale(prev, projection));
      }

      y = normalizeWithMass(y, M);
      const lambda = dot(y, multiplyMatrixVector(K, y)) / dot(y, multiplyMatrixVector(M, y));

      if (Math.abs(lambda - lastLambda) < 1e-9) {
        x = y;
        break;
      }

      x = y;
      lastLambda = lambda;
    }

    const omega2 = dot(x, multiplyMatrixVector(K, x)) / dot(x, multiplyMatrixVector(M, x));
    const frequency = Math.sqrt(Math.max(omega2, 0)) / (2 * Math.PI);
    const modalMass = dot(x, multiplyMatrixVector(M, x));
    const modalStiffness = dot(x, multiplyMatrixVector(K, x));

    previousModes.push(x);
    results.push({ frequency, shape: x, modalMass, modalStiffness });
  }

  return results;
}

function solveLinearSystem(A: number[][], b: number[]) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(M[j][i]) > Math.abs(M[pivot][i])) pivot = j;
    }

    [M[i], M[pivot]] = [M[pivot], M[i]];
    const diag = M[i][i] || 1e-12;
    for (let j = i; j <= n; j++) {
      M[i][j] /= diag;
    }

    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const factor = M[j][i];
      for (let k = i; k <= n; k++) {
        M[j][k] -= factor * M[i][k];
      }
    }
  }

  return M.map((row) => row[n]);
}

function multiplyMatrixVector(A: number[][], x: number[]) {
  return A.map((row) => row.reduce((sum, value, index) => sum + value * x[index], 0));
}

function dot(a: number[], b: number[]) {
  return a.reduce((sum, value, index) => sum + value * b[index], 0);
}

function normalizeWithMass(x: number[], M: number[][]) {
  const massNorm = Math.sqrt(dot(x, multiplyMatrixVector(M, x))) || 1;
  return x.map((value) => value / massNorm);
}

function subtract(a: number[], b: number[]) {
  return a.map((value, index) => value - b[index]);
}

function scale(x: number[], factor: number) {
  return x.map((value) => value * factor);
}
