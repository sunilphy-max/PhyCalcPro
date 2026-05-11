/**
 * Shaft Stiffness Matrix Computation
 * Calculates element and global stiffness matrices for combined loading
 */

import type { ShaftElement } from "./femTypes";

/**
 * Hermite shape functions for beam bending
 * Returns derivatives needed for stiffness calculations
 */
function hermiteShapeFunctions(xi: number) {
  const xi2 = xi * xi;
  const xi3 = xi2 * xi;

  return {
    N1: 1 - 3 * xi2 + 2 * xi3,
    N2: xi - 2 * xi2 + xi3,
    N3: 3 * xi2 - 2 * xi3,
    N4: -xi2 + xi3,
    dN1: -6 * xi + 6 * xi2,
    dN2: 1 - 4 * xi + 3 * xi2,
    dN3: 6 * xi - 6 * xi2,
    dN4: -2 * xi + 3 * xi2,
  };
}

/**
 * Assemble element stiffness matrix for beam element
 * Combines axial, torsional, and bending stiffness
 * DOF: [u1, v1, w1, θx1, θy1, θz1, u2, v2, w2, θx2, θy2, θz2]
 */
export function assembleElementStiffness(element: ShaftElement): number[][] {
  const L = element.length;
  const EA = element.E * element.area;
  const GJ = element.G * element.polarMoment;
  const EI = element.E * element.secondMoment;

  const K: number[][] = Array(12)
    .fill(0)
    .map(() => Array(12).fill(0));

  // Axial stiffness (DOF 0, 6)
  K[0][0] = EA / L;
  K[0][6] = -EA / L;
  K[6][0] = -EA / L;
  K[6][6] = EA / L;

  // Torsional stiffness (DOF 3, 9)
  K[3][3] = GJ / L;
  K[3][9] = -GJ / L;
  K[9][3] = -GJ / L;
  K[9][9] = GJ / L;

  // Bending in XY plane (DOF 1, 4, 7, 10)
  const k_bend = (12 * EI) / (L * L * L);
  const k_bend_moment = (6 * EI) / (L * L);
  const k_bend_moment2 = (4 * EI) / L;

  K[1][1] = k_bend;
  K[1][4] = k_bend_moment;
  K[1][7] = -k_bend;
  K[1][10] = k_bend_moment;

  K[4][1] = k_bend_moment;
  K[4][4] = k_bend_moment2;
  K[4][7] = -k_bend_moment;
  K[4][10] = (2 * EI) / L;

  K[7][1] = -k_bend;
  K[7][4] = -k_bend_moment;
  K[7][7] = k_bend;
  K[7][10] = -k_bend_moment;

  K[10][1] = k_bend_moment;
  K[10][4] = (2 * EI) / L;
  K[10][7] = -k_bend_moment;
  K[10][10] = k_bend_moment2;

  // Bending in XZ plane (DOF 2, 5, 8, 11)
  K[2][2] = k_bend;
  K[2][5] = -k_bend_moment;
  K[2][8] = -k_bend;
  K[2][11] = -k_bend_moment;

  K[5][2] = -k_bend_moment;
  K[5][5] = k_bend_moment2;
  K[5][8] = k_bend_moment;
  K[5][11] = (2 * EI) / L;

  K[8][2] = -k_bend;
  K[8][5] = k_bend_moment;
  K[8][8] = k_bend;
  K[8][11] = k_bend_moment;

  K[11][2] = -k_bend_moment;
  K[11][5] = (2 * EI) / L;
  K[11][8] = k_bend_moment;
  K[11][11] = k_bend_moment2;

  return K;
}

/**
 * Assemble global stiffness matrix for entire shaft
 * Maps element stiffness to global system (6 DOF per node)
 */
export function assembleGlobalStiffness(
  nodes: Array<{ id: number }>,
  elements: Array<ShaftElement>
): number[][] {
  const nNodes = nodes.length;
  const nDOF = nNodes * 6;
  const K: number[][] = Array(nDOF)
    .fill(0)
    .map(() => Array(nDOF).fill(0));

  for (const element of elements) {
    const Ke = assembleElementStiffness(element);

    // Map element DOF to global DOF
    // Node1: DOF [node1*6, node1*6+5], Node2: DOF [node2*6, node2*6+5]
    const node1_start = element.startNode * 6;
    const node2_start = element.endNode * 6;

    // Add element contributions to global matrix
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        K[node1_start + i][node1_start + j] += Ke[i][j];
        K[node1_start + i][node2_start + j] += Ke[i][j + 6];
        K[node2_start + i][node1_start + j] += Ke[i + 6][j];
        K[node2_start + i][node2_start + j] += Ke[i + 6][j + 6];
      }
    }
  }

  return K;
}
