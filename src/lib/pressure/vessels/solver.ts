import { generatePressureVesselMesh } from "./mesh";
import type { PressureVesselConfig, PressureVesselResult } from "./types";

export function solvePressureVesselFEM(config: PressureVesselConfig): PressureVesselResult {
  const mesh = generatePressureVesselMesh(config);
  const dofs = mesh.nodes.length * 2;
  const K = Array.from({ length: dofs }, () => Array(dofs).fill(0));
  const F = Array(dofs).fill(0);

  mesh.elements.forEach((element) => {
    const ke = elementStiffness(element, config.E);
    const dofIndices = [element.start * 2, element.start * 2 + 1, element.end * 2, element.end * 2 + 1];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        K[dofIndices[i]][dofIndices[j]] += ke[i][j];
      }
    }
  });

  const pressureLoad = config.pressure * config.length;
  mesh.nodes.forEach((node) => {
    const radial = Math.sqrt(node.x * node.x + node.y * node.y) || 1;
    const fx = pressureLoad * node.x / radial * (Math.PI * 2 * mesh.radius / mesh.segments / 2);
    const fy = pressureLoad * node.y / radial * (Math.PI * 2 * mesh.radius / mesh.segments / 2);
    F[node.index * 2] += fx;
    F[node.index * 2 + 1] += fy;
  });

  const fixedDOFs = fixRigidBodyModes(mesh.nodes.length);
  applyBoundaryConditions(K, F, fixedDOFs);
  const d = solveLinearSystem(K, F);

  const displacements = mesh.nodes.map((node, index) => ({
    dx: d[index * 2],
    dy: d[index * 2 + 1],
  }));

  const hoopStress = mesh.elements.map((element) => {
    const u1 = d[element.start * 2];
    const v1 = d[element.start * 2 + 1];
    const u2 = d[element.end * 2];
    const v2 = d[element.end * 2 + 1];
    const localU1 = element.cos * u1 + element.sin * v1;
    const localU2 = element.cos * u2 + element.sin * v2;
    const strain = (localU2 - localU1) / element.length;
    return config.E * strain;
  });

  const radialDisplacement = displacements.map((disp, index) => {
    const node = mesh.nodes[index];
    const radius = Math.sqrt(node.x * node.x + node.y * node.y) || 1;
    return (node.x * disp.dx + node.y * disp.dy) / radius;
  });

  const maxRadialDisplacement = Math.max(...radialDisplacement.map((v) => Math.abs(v)));
  const maxHoopStress = Math.max(...hoopStress.map((v) => Math.abs(v)));
  const angles = mesh.nodes.map((node) => Math.atan2(node.y, node.x));

  return {
    nodes: mesh.nodes,
    elements: mesh.elements,
    displacements,
    hoopStress,
    maxRadialDisplacement,
    maxHoopStress,
    angles,
    radialDisplacement,
    segments: mesh.segments,
    radius: mesh.radius,
    thickness: config.thickness,
    length: mesh.length,
    pressure: config.pressure,
  };
}

function elementStiffness(element: { area: number; length: number; cos: number; sin: number }, E: number) {
  const k = (E * element.area) / element.length;
  const c = element.cos;
  const s = element.sin;
  const cc = c * c;
  const ss = s * s;
  const cs = c * s;

  return [
    [k * cc, k * cs, -k * cc, -k * cs],
    [k * cs, k * ss, -k * cs, -k * ss],
    [-k * cc, -k * cs, k * cc, k * cs],
    [-k * cs, -k * ss, k * cs, k * ss],
  ];
}

function fixRigidBodyModes(nodeCount: number) {
  return [0, 1, 3];
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
