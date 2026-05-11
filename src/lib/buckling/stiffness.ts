/**
 * Buckling Stiffness Assembly
 * Creates elastic and geometric stiffness matrices for eigenvalue analysis
 */

import type { BucklingNode, BucklingElement, BucklingFEMModel } from "./femTypes";

/**
 * Assemble elastic stiffness matrix for beam element
 * 2-node beam with 2 DOF per node (deflection, rotation in 2D)
 */
function assembleElementElasticStiffness(element: BucklingElement): number[][] {
  const { E, I, length } = element;
  const L = length;
  const c = (E * I) / (L * L * L);

  // 4x4 matrix for 2-node beam (v, θ at start; v, θ at end)
  const ke = [
    [12 * c, 6 * L * c, -12 * c, 6 * L * c],
    [6 * L * c, 4 * L * L * c, -6 * L * c, 2 * L * L * c],
    [-12 * c, -6 * L * c, 12 * c, -6 * L * c],
    [6 * L * c, 2 * L * L * c, -6 * L * c, 4 * L * L * c],
  ];

  return ke;
}

/**
 * Assemble geometric stiffness matrix (depends on axial load)
 * For axial load P, Kg represents the effect of load on lateral stiffness
 */
function assembleElementGeometricStiffness(element: BucklingElement, P: number): number[][] {
  const { length } = element;
  const L = length;
  const c = P / (30 * L);

  // 4x4 geometric stiffness matrix
  const kg = [
    [36 * c, 3 * L * c, -36 * c, 3 * L * c],
    [3 * L * c, 4 * L * L * c, -3 * L * c, -L * L * c],
    [-36 * c, -3 * L * c, 36 * c, -3 * L * c],
    [3 * L * c, -L * L * c, -3 * L * c, 4 * L * L * c],
  ];

  return kg;
}

/**
 * Assemble global elastic stiffness matrix
 */
export function assembleGlobalElasticStiffness(model: BucklingFEMModel): number[][] {
  const n = model.nodes.length;
  const nDOF = n * 2; // 2 DOF per node (deflection, rotation)
  const K: number[][] = Array(nDOF)
    .fill(0)
    .map(() => Array(nDOF).fill(0));

  for (const element of model.elements) {
    const ke = assembleElementElasticStiffness(element);

    // Map element DOF to global DOF
    const dof = [
      element.startNode * 2,
      element.startNode * 2 + 1,
      element.endNode * 2,
      element.endNode * 2 + 1,
    ];

    // Assemble into global matrix
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        K[dof[i]][dof[j]] += ke[i][j];
      }
    }
  }

  return K;
}

/**
 * Assemble global geometric stiffness matrix
 */
export function assembleGlobalGeometricStiffness(
  model: BucklingFEMModel,
  P: number
): number[][] {
  const n = model.nodes.length;
  const nDOF = n * 2;
  const Kg: number[][] = Array(nDOF)
    .fill(0)
    .map(() => Array(nDOF).fill(0));

  for (const element of model.elements) {
    const kg = assembleElementGeometricStiffness(element, P);

    const dof = [
      element.startNode * 2,
      element.startNode * 2 + 1,
      element.endNode * 2,
      element.endNode * 2 + 1,
    ];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        Kg[dof[i]][dof[j]] += kg[i][j];
      }
    }
  }

  return Kg;
}
