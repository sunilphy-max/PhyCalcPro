import { generatePortalFrameMesh } from "./mesh";
import type { FrameConfig, FrameResult } from "./types";

export function solveFrameFEM(config: FrameConfig): FrameResult {
  const mesh = generatePortalFrameMesh(config);
  const dofs = mesh.nodes.length * 3;

  const K = Array.from({ length: dofs }, () => Array(dofs).fill(0));
  const F = Array(dofs).fill(0);

  mesh.elements.forEach((element) => {
    const ke = elementStiffness(element, config.E);
    const global = transformStiffness(ke, element.cos, element.sin);
    const dofIndices = [
      element.start * 3,
      element.start * 3 + 1,
      element.start * 3 + 2,
      element.end * 3,
      element.end * 3 + 1,
      element.end * 3 + 2,
    ];

    for (let a = 0; a < 6; a++) {
      for (let b = 0; b < 6; b++) {
        K[dofIndices[a]][dofIndices[b]] += global[a][b];
      }
    }
  });

  const midBeamIndex = mesh.beamNodeIndices[Math.floor(mesh.beamNodeIndices.length / 2)];
  F[midBeamIndex * 3 + 1] = -config.load;

  const fixedDOFs = [0, 1, 2, mesh.rightColumnIndex * 3, mesh.rightColumnIndex * 3 + 1, mesh.rightColumnIndex * 3 + 2];

  const Kcopy = K.map((row) => [...row]);
  const Fcopy = [...F];

  applyBoundaryConditions(K, F, fixedDOFs);
  const d = solveLinearSystem(K, F);

  const displacements = mesh.nodes.map((_, index) => ({
    dx: d[index * 3],
    dy: d[index * 3 + 1],
    rotation: d[index * 3 + 2],
  }));

  const memberAxial = mesh.elements.map((element) => {
    const u1 = d[element.start * 3];
    const v1 = d[element.start * 3 + 1];
    const r1 = d[element.start * 3 + 2];
    const u2 = d[element.end * 3];
    const v2 = d[element.end * 3 + 1];
    const r2 = d[element.end * 3 + 2];
    const local = transformDisplacements([u1, v1, r1, u2, v2, r2], element.cos, element.sin);
    const axial = (element.A * config.E / element.length) * (local[3] - local[0]);
    return axial;
  });

  const memberMoment = mesh.elements.map((element) => {
    const u1 = d[element.start * 3];
    const v1 = d[element.start * 3 + 1];
    const r1 = d[element.start * 3 + 2];
    const u2 = d[element.end * 3];
    const v2 = d[element.end * 3 + 1];
    const r2 = d[element.end * 3 + 2];
    const local = transformDisplacements([u1, v1, r1, u2, v2, r2], element.cos, element.sin);
    const L = element.length;
    const EI = config.E * element.I;
    return (EI / L) * (2 * local[2] + local[5] - 6 * (local[1] - local[4]) / L);
  });

  const fullForces = multiplyMatrixVector(Kcopy, d);
  const reactions = fixedDOFs.map((dof, index) => ({
    node: Math.floor(dof / 3),
    fx: fullForces[dof] - Fcopy[dof],
    fy: fullForces[dof + 1] - Fcopy[dof + 1],
    m: fullForces[dof + 2] - Fcopy[dof + 2],
  }));

  const maxDisplacement = Math.max(...displacements.map((disp) => Math.hypot(disp.dx, disp.dy)));
  const maxAxial = Math.max(...memberAxial.map((v) => Math.abs(v)));
  const maxMoment = Math.max(...memberMoment.map((v) => Math.abs(v)));

  const topNodesX = mesh.beamNodeIndices.map((id) => mesh.nodes[id].x);
  const topDeflections = mesh.beamNodeIndices.map((id) => displacements[id].dy);

  return {
    nodes: mesh.nodes,
    elements: mesh.elements,
    displacements,
    memberAxial,
    memberMoment,
    reactions,
    maxDisplacement,
    maxAxial,
    maxMoment,
    topNodesX,
    topDeflections,
    segments: mesh.segments,
    span: mesh.span,
    height: mesh.height,
  };
}

function elementStiffness(element: { length: number; A: number; I: number }, E: number) {
  const L = element.length;
  const EA = E * element.A / L;
  const EI = E * element.I;
  const k = EI / (L * L * L);

  return [
    [EA, 0, 0, -EA, 0, 0],
    [0, 12 * k, 6 * L * k, 0, -12 * k, 6 * L * k],
    [0, 6 * L * k, 4 * L * L * k, 0, -6 * L * k, 2 * L * L * k],
    [-EA, 0, 0, EA, 0, 0],
    [0, -12 * k, -6 * L * k, 0, 12 * k, -6 * L * k],
    [0, 6 * L * k, 2 * L * L * k, 0, -6 * L * k, 4 * L * L * k],
  ];
}

function transformStiffness(k: number[][], c: number, s: number) {
  const T = [
    [c, s, 0, 0, 0, 0],
    [-s, c, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 0, 0, c, s, 0],
    [0, 0, 0, -s, c, 0],
    [0, 0, 0, 0, 0, 1],
  ];

  const Tt = transpose(T);
  return multiplyMatrices(Tt, multiplyMatrices(k, T));
}

function transformDisplacements(d: number[], c: number, s: number) {
  return [
    c * d[0] + s * d[1],
    -s * d[0] + c * d[1],
    d[2],
    c * d[3] + s * d[4],
    -s * d[3] + c * d[4],
    d[5],
  ];
}

function applyBoundaryConditions(K: number[][], F: number[], fixedDOFs: number[]) {
  for (const dof of fixedDOFs) {
    for (let j = 0; j < K.length; j++) {
      K[dof][j] = 0;
      K[j][dof] = 0;
    }
    K[dof][dof] = 1;
    F[dof] = 0;
  }
}

function solveLinearSystem(A: number[][], b: number[]) {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }

    [M[i], M[maxRow]] = [M[maxRow], M[i]];

    const pivot = M[i][i] || 1e-12;
    for (let j = i; j <= n; j++) {
      M[i][j] /= pivot;
    }

    for (let k = 0; k < n; k++) {
      if (k === i) continue;
      const factor = M[k][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  return M.map((row) => row[n]);
}

function multiplyMatrices(A: number[][], B: number[][]) {
  const rows = A.length;
  const cols = B[0].length;
  const inner = B.length;
  const result = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      for (let k = 0; k < inner; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

function multiplyMatrixVector(A: number[][], x: number[]) {
  return A.map((row) => row.reduce((sum, value, index) => sum + value * x[index], 0));
}

function transpose(matrix: number[][]) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}
