import { generatePlateMesh } from "./mesh";
import type { PlateConfig, PlateResult } from "./types";

const GAUSS_POINTS = [-1 / Math.sqrt(3), 1 / Math.sqrt(3)];

export function solvePlateFEM(config: PlateConfig): PlateResult {
  const { length, width, thickness, E, nu, q, elementsX, elementsY, boundaryType } = config;
  const mesh = generatePlateMesh(length, width, elementsX, elementsY);
  const size = mesh.nodes.length * 3;

  const K = assembleGlobalStiffness(mesh, E, nu, thickness);
  const F = createLoadVector(mesh, q);

  const fixedDOFs = getBoundaryDOFs(mesh, boundaryType);
  applyBoundaryConditions(K, F, fixedDOFs);

  const d = solveLinearSystem(K, F);
  const w = extractDeflectionGrid(mesh, d);
  const moments = computeMoments(mesh, w, E, nu, thickness);

  const maxDeflection = Math.max(...w.flat().map((v) => Math.abs(v)));
  const minDeflection = Math.min(...w.flat());
  const maxMoment = Math.max(...moments.momentX.flat().map(Math.abs), ...moments.momentY.flat().map(Math.abs));

  const midYIndex = Math.floor(mesh.ny / 2);
  const midXIndex = Math.floor(mesh.nx / 2);

  const deflectionAlongLength = w[midYIndex] || [];
  const deflectionAlongWidth = w.map((row) => row[midXIndex] ?? 0);

  return {
    x: Array.from({ length: mesh.nx + 1 }, (_, i) => i * mesh.hx),
    y: Array.from({ length: mesh.ny + 1 }, (_, j) => j * mesh.hy),
    w,
    momentX: moments.momentX,
    momentY: moments.momentY,
    momentXY: moments.momentXY,
    maxDeflection,
    minDeflection,
    maxMoment,
    deflectionAlongLength,
    deflectionAlongWidth,
    elementsX: mesh.nx,
    elementsY: mesh.ny,
    boundaryType,
  };
}

function assembleGlobalStiffness(mesh: ReturnType<typeof generatePlateMesh>, E: number, nu: number, t: number) {
  const size = mesh.nodes.length * 3;
  const K = Array.from({ length: size }, () => Array(size).fill(0));
  const ke = assembleElementStiffness(mesh, E, nu, t);

  for (const element of mesh.elements) {
    const dofIndices = element.nodes.flatMap((nodeIndex) => [nodeIndex * 3, nodeIndex * 3 + 1, nodeIndex * 3 + 2]);

    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        K[dofIndices[a]][dofIndices[b]] += ke[a][b];
      }
    }
  }

  return K;
}

function assembleElementStiffness(mesh: ReturnType<typeof generatePlateMesh>, E: number, nu: number, t: number) {
  const hx = mesh.hx;
  const hy = mesh.hy;
  const D = (E * t * t * t) / (12 * (1 - nu * nu));
  const G = E / (2 * (1 + nu));
  const shearFactor = (5 / 6) * G * t;

  const Db = [
    [1, nu, 0],
    [nu, 1, 0],
    [0, 0, (1 - nu) / 2],
  ].map((row) => row.map((value) => value * D));

  const Ds = [
    [shearFactor, 0],
    [0, shearFactor],
  ];

  const ke = Array.from({ length: 12 }, () => Array(12).fill(0));

  const gradientsAt = (xi: number, eta: number) => {
    const { dNdXi, dNdEta } = shapeFunctionDerivatives(xi, eta);
    const J = computeJacobian(dNdXi, dNdEta, hx, hy);
    const detJ = J[0][0] * J[1][1] - J[0][1] * J[1][0];
    const invJ = invert2x2(J);
    const dNdx: number[] = [];
    const dNdy: number[] = [];
    for (let i = 0; i < 4; i++) {
      dNdx.push(invJ[0][0] * dNdXi[i] + invJ[0][1] * dNdEta[i]);
      dNdy.push(invJ[1][0] * dNdXi[i] + invJ[1][1] * dNdEta[i]);
    }
    return { dNdx, dNdy, detJ };
  };

  // Bending: full 2x2 Gauss integration
  for (const xi of GAUSS_POINTS) {
    for (const eta of GAUSS_POINTS) {
      const { dNdx, dNdy, detJ } = gradientsAt(xi, eta);
      const Bb = buildBendingMatrix(dNdx, dNdy);
      const BtDbB = multiplyMatrices(transpose(Bb), multiplyMatrices(Db, Bb));
      for (let a = 0; a < 12; a++) {
        for (let b = 0; b < 12; b++) {
          ke[a][b] += BtDbB[a][b] * detJ;
        }
      }
    }
  }

  // Transverse shear: selective reduced integration (single Gauss point,
  // weight 4) to avoid shear locking of bilinear Mindlin elements on thin plates
  {
    const center = gradientsAt(0, 0);
    const shapeAtCenter = [0.25, 0.25, 0.25, 0.25];
    const Bs = buildShearMatrix(center.dNdx, center.dNdy, shapeAtCenter);
    const BtDsB = multiplyMatrices(transpose(Bs), multiplyMatrices(Ds, Bs));
    for (let a = 0; a < 12; a++) {
      for (let b = 0; b < 12; b++) {
        ke[a][b] += BtDsB[a][b] * center.detJ * 4;
      }
    }
  }

  return ke;
}

function buildBendingMatrix(dNdx: number[], dNdy: number[]) {
  const Bb = Array.from({ length: 3 }, () => Array(12).fill(0));

  for (let i = 0; i < 4; i++) {
    const offset = i * 3;
    Bb[0][offset + 1] = dNdx[i];
    Bb[1][offset + 2] = dNdy[i];
    Bb[2][offset + 1] = dNdy[i];
    Bb[2][offset + 2] = dNdx[i];
  }

  return Bb;
}

function buildShearMatrix(dNdx: number[], dNdy: number[], N: number[]) {
  const Bs = Array.from({ length: 2 }, () => Array(12).fill(0));

  for (let i = 0; i < 4; i++) {
    const offset = i * 3;
    Bs[0][offset] = dNdx[i];
    Bs[0][offset + 1] = N[i];
    Bs[1][offset] = dNdy[i];
    Bs[1][offset + 2] = N[i];
  }

  return Bs;
}

function shapeFunctionDerivatives(xi: number, eta: number) {
  return {
    dNdXi: [-(1 - eta), 1 - eta, 1 + eta, -(1 + eta)].map((value) => value * 0.25),
    dNdEta: [-(1 - xi), -(1 + xi), 1 + xi, 1 - xi].map((value) => value * 0.25),
  };
}

function computeJacobian(dNdXi: number[], dNdEta: number[], hx: number, hy: number) {
  return [
    [hx / 2, 0],
    [0, hy / 2],
  ];
}

function invert2x2(matrix: number[][]) {
  const [[a, b], [c, d]] = matrix;
  const det = a * d - b * c;
  return [[d / det, -b / det], [-c / det, a / det]];
}

function createLoadVector(mesh: ReturnType<typeof generatePlateMesh>, q: number) {
  const F = Array(mesh.nodes.length * 3).fill(0);
  const nodalLoad = (q * mesh.hx * mesh.hy) / 4;

  for (const element of mesh.elements) {
    for (const nodeIndex of element.nodes) {
      F[nodeIndex * 3] += nodalLoad;
    }
  }

  return F;
}

function getBoundaryDOFs(mesh: ReturnType<typeof generatePlateMesh>, boundaryType: PlateConfig["boundaryType"]) {
  const fixed: number[] = [];

  for (const node of mesh.nodes) {
    const isBoundary =
      node.x <= 0 || node.x >= mesh.length || node.y <= 0 || node.y >= mesh.width;

    if (!isBoundary) continue;

    if (boundaryType === "clamped") {
      fixed.push(node.index * 3, node.index * 3 + 1, node.index * 3 + 2);
    } else {
      fixed.push(node.index * 3);
    }
  }

  return Array.from(new Set(fixed)).sort((a, b) => a - b);
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

function extractDeflectionGrid(mesh: ReturnType<typeof generatePlateMesh>, d: number[]) {
  const rows: number[][] = [];
  for (let j = 0; j <= mesh.ny; j++) {
    const row: number[] = [];
    for (let i = 0; i <= mesh.nx; i++) {
      const nodeIndex = j * (mesh.nx + 1) + i;
      row.push(d[nodeIndex * 3]);
    }
    rows.push(row);
  }
  return rows;
}

function computeMoments(
  mesh: ReturnType<typeof generatePlateMesh>,
  w: number[][],
  E: number,
  nu: number,
  t: number
) {
  const momentsX: number[][] = [];
  const momentsY: number[][] = [];
  const momentsXY: number[][] = [];
  const D = (E * t * t * t) / (12 * (1 - nu * nu));

  for (let j = 0; j <= mesh.ny; j++) {
    const rowX: number[] = [];
    const rowY: number[] = [];
    const rowXY: number[] = [];

    for (let i = 0; i <= mesh.nx; i++) {
      const center = w[j][i];
      const d2wdx2 = secondDerivative(w, i, j, mesh.hx, mesh.nx, true);
      const d2wdy2 = secondDerivative(w, i, j, mesh.hy, mesh.ny, false);
      const d2wdxdy = mixedSecondDerivative(w, i, j, mesh.hx, mesh.hy, mesh.nx, mesh.ny);

      rowX.push(-D * (d2wdx2 + nu * d2wdy2));
      rowY.push(-D * (d2wdy2 + nu * d2wdx2));
      rowXY.push(-D * (1 - nu) * d2wdxdy);
    }

    momentsX.push(rowX);
    momentsY.push(rowY);
    momentsXY.push(rowXY);
  }

  return { momentX: momentsX, momentY: momentsY, momentXY: momentsXY };
}

function secondDerivative(
  w: number[][],
  i: number,
  j: number,
  h: number,
  maxIndex: number,
  isX: boolean
) {
  const previous = isX ? i - 1 : j - 1;
  const next = isX ? i + 1 : j + 1;

  if (previous < 0 || next > maxIndex) {
    return 0;
  }

  const center = w[j][i];
  const neighbor1 = isX ? w[j][previous] : w[previous][i];
  const neighbor2 = isX ? w[j][next] : w[next][i];

  return (neighbor1 - 2 * center + neighbor2) / (h * h);
}

function mixedSecondDerivative(
  w: number[][],
  i: number,
  j: number,
  hx: number,
  hy: number,
  maxX: number,
  maxY: number
) {
  if (i <= 0 || j <= 0 || i >= maxX || j >= maxY) {
    return 0;
  }

  return (
    w[j - 1][i - 1] -
    w[j - 1][i + 1] -
    w[j + 1][i - 1] +
    w[j + 1][i + 1]
  ) / (4 * hx * hy);
}

function transpose(matrix: number[][]) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
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

function addMatrices(A: number[][], B: number[][]) {
  return A.map((row, i) => row.map((value, j) => value + B[i][j]));
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

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) {
      continue;
    }

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
