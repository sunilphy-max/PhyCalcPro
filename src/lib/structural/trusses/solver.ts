import { generateWarrenTrussMesh } from "./mesh";
import type { TrussConfig, TrussForce, TrussResult } from "./types";

export function solveTrussFEM(config: TrussConfig): TrussResult {
  const { span, height, panels, A, E, load } = config;
  const mesh = generateWarrenTrussMesh(span, height, panels);
  const dofs = mesh.nodes.length * 2;

  const K = Array.from({ length: dofs }, () => Array(dofs).fill(0));
  const F = Array(dofs).fill(0);

  for (const element of mesh.elements) {
    const k = (E * A) / element.length;
    const c = element.cos;
    const s = element.sin;

    const ke = [
      [c * c, c * s, -c * c, -c * s],
      [c * s, s * s, -c * s, -s * s],
      [-c * c, -c * s, c * c, c * s],
      [-c * s, -s * s, c * s, s * s],
    ].map((row) => row.map((value) => value * k));

    const dofIndices = [
      element.start * 2,
      element.start * 2 + 1,
      element.end * 2,
      element.end * 2 + 1,
    ];

    for (let a = 0; a < 4; a++) {
      for (let b = 0; b < 4; b++) {
        K[dofIndices[a]][dofIndices[b]] += ke[a][b];
      }
    }
  }

  const midTopIndex = Math.floor(mesh.topNodeIndices.length / 2);
  const loadNode = mesh.topNodeIndices[midTopIndex];
  F[loadNode * 2 + 1] = -load;

  const fixedDOFs = [0, 1, mesh.bottomNodeIndices[mesh.bottomNodeIndices.length - 1] * 2 + 1];

  const Korig = K.map((row) => [...row]);
  const Forig = [...F];

  applyBoundaryConditions(K, F, fixedDOFs);

  const d = solveLinearSystem(K, F);

  const displacements = mesh.nodes.map((node, index) => ({
    dx: d[index * 2],
    dy: d[index * 2 + 1],
  }));

  const memberForces: TrussForce[] = mesh.elements.map((element) => {
    const u1 = d[element.start * 2];
    const v1 = d[element.start * 2 + 1];
    const u2 = d[element.end * 2];
    const v2 = d[element.end * 2 + 1];
    const axial = (E * A / element.length) * (element.cos * (u2 - u1) + element.sin * (v2 - v1));

    return {
      id: element.id,
      force: axial,
      type: axial >= 0 ? "tension" : "compression",
      length: element.length,
      start: element.start,
      end: element.end,
    };
  });

  const fullForces = multiplyMatrixVector(Korig, d);
  const reactions = [
    {
      node: mesh.bottomNodeIndices[0],
      fx: fullForces[0] - Forig[0],
      fy: fullForces[1] - Forig[1],
    },
    {
      node: mesh.bottomNodeIndices[mesh.bottomNodeIndices.length - 1],
      fx: 0,
      fy: fullForces[fullForces.length - 1] - Forig[fullForces.length - 1],
    },
  ];

  const maxDisplacement = Math.max(...displacements.map((disp) => Math.hypot(disp.dx, disp.dy)));
  const maxForce = Math.max(...memberForces.map((m) => Math.abs(m.force)));

  const topNodesX = mesh.topNodeIndices.map((nodeIndex) => mesh.nodes[nodeIndex].x);
  const topDeflections = mesh.topNodeIndices.map((nodeIndex) => displacements[nodeIndex].dy);

  return {
    nodes: mesh.nodes,
    elements: mesh.elements,
    displacements,
    memberForces,
    reactions,
    maxDisplacement,
    maxForce,
    topNodesX,
    topDeflections,
    panels,
    span,
    height,
  };
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

function multiplyMatrixVector(A: number[][], v: number[]) {
  return A.map((row) => row.reduce((sum, value, i) => sum + value * v[i], 0));
}
