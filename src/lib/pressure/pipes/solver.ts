import { generatePressurePipeMesh } from "./mesh";
import type { PressurePipeConfig, PressurePipeResult, PipeStressSummary } from "./types";
import { STEEL_YIELD } from "@/lib/materials/materialDefaults";

function buildPipeStressCategories(
  config: PressurePipeConfig,
  maxHoopStress: number
): PipeStressSummary[] {
  const longitudinalStress = (config.pressure * config.radius) / (2 * Math.max(config.thickness, 1e-9));
  const equivalentStress = Math.sqrt(
    maxHoopStress * maxHoopStress +
      longitudinalStress * longitudinalStress -
      maxHoopStress * longitudinalStress
  );
  const allowableS = config.allowableStress ?? STEEL_YIELD * 0.55;

  const base = {
    hoopStress: maxHoopStress,
    longitudinalStress,
    equivalentStress,
    allowableStress: allowableS,
    utilization: equivalentStress / allowableS,
  };

  return [
    {
      category: "sustained",
      label: "Sustained (pressure + dead load)",
      ...base,
    },
    {
      category: "occasional",
      label: "Occasional (≤ 8 h at ≤ 33% over sustained)",
      hoopStress: maxHoopStress * 1.15,
      longitudinalStress: longitudinalStress * 1.15,
      equivalentStress: equivalentStress * 1.15,
      allowableStress: allowableS * 1.33,
      utilization: (equivalentStress * 1.15) / (allowableS * 1.33),
    },
    {
      category: "peak",
      label: "Peak / upset (rare events)",
      hoopStress: maxHoopStress * 1.25,
      longitudinalStress: longitudinalStress * 1.25,
      equivalentStress: equivalentStress * 1.25,
      allowableStress: allowableS * 1.5,
      utilization: (equivalentStress * 1.25) / (allowableS * 1.5),
    },
  ];
}

export function solvePressurePipeFEM(config: PressurePipeConfig): PressurePipeResult {
  const mesh = generatePressurePipeMesh(config);
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

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        K[dofIndices[i]][dofIndices[j]] += global[i][j];
      }
    }

    const loadMagnitude = config.pressure * config.length * element.length;
    const nx = -(element.cos * mesh.radius) / mesh.radius;
    const ny = -(element.sin * mesh.radius) / mesh.radius;

    F[element.start * 3] += 0.5 * loadMagnitude * nx;
    F[element.start * 3 + 1] += 0.5 * loadMagnitude * ny;
    F[element.end * 3] += 0.5 * loadMagnitude * nx;
    F[element.end * 3 + 1] += 0.5 * loadMagnitude * ny;
  });

  const fixedDOFs = [0, 1, 2, 5];
  applyBoundaryConditions(K, F, fixedDOFs);
  const d = solveLinearSystem(K, F);

  const displacements = mesh.nodes.map((_, index) => ({
    dx: d[index * 3],
    dy: d[index * 3 + 1],
    rotation: d[index * 3 + 2],
  }));

  const hoopStress = mesh.elements.map((element) => {
    const u1 = d[element.start * 3];
    const v1 = d[element.start * 3 + 1];
    const r1 = d[element.start * 3 + 2];
    const u2 = d[element.end * 3];
    const v2 = d[element.end * 3 + 1];
    const r2 = d[element.end * 3 + 2];
    const local = transformDisplacements([u1, v1, r1, u2, v2, r2], element.cos, element.sin);
    const axial = (element.A * config.E / element.length) * (local[3] - local[0]);
    return axial / element.A;
  });

  const angles = mesh.nodes.map((node) => Math.atan2(node.y, node.x));
  const radialDisplacement = displacements.map((disp, index) => {
    const node = mesh.nodes[index];
    const r = Math.hypot(node.x, node.y) || 1;
    return (node.x * disp.dx + node.y * disp.dy) / r;
  });

  const maxHoopStress = Math.max(...hoopStress.map((v) => Math.abs(v)));
  const stressCategories = buildPipeStressCategories(config, maxHoopStress);

  return {
    nodes: mesh.nodes,
    elements: mesh.elements,
    displacements,
    hoopStress,
    radialDisplacement,
    maxRadialDisplacement: Math.max(...radialDisplacement.map((v) => Math.abs(v))),
    maxHoopStress,
    stressCategories,
    angles,
    segments: mesh.segments,
    radius: mesh.radius,
    thickness: config.thickness,
    length: mesh.length,
    pressure: config.pressure,
  };
}

function elementStiffness(element: { length: number; A: number; I: number }, E: number) {
  const L = element.length;
  const EA = (E * element.A) / L;
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
    for (let i = 0; i < K.length; i++) {
      K[dof][i] = 0;
      K[i][dof] = 0;
    }
    K[dof][dof] = 1;
    F[dof] = 0;
  }
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

function transpose(matrix: number[][]) {
  return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
}
