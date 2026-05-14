/**
 * Screws Stiffness Assembly
 * Creates stiffness matrices for screw stress analysis
 */

import type { ScrewElement, ScrewFEAModel } from "./femTypes";

/**
 * Assemble element stiffness for axisymmetric element
 */
function assembleElementStiffness(element: ScrewElement): number[][] {
  const { diameter, thickness, E, G } = element;
  const r = diameter / 2;
  const A = Math.PI * (r * r - (r - thickness) * (r - thickness)); // Cross-sectional area
  const J = Math.PI * (r * r * r * r - (r - thickness) * (r - thickness) * (r - thickness) * (r - thickness)) / 32; // Polar moment
  const c = E * A;
  const ct = G * J;

  // 2x2 matrix for 2-node axisymmetric element
  const ke = [
    [c, -c],
    [-c, c],
  ];

  return ke;
}

/**
 * Assemble global stiffness matrix
 */
export function assembleGlobalStiffness(model: ScrewFEAModel): number[][] {
  const n = model.nodes.length;
  const K: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  for (const element of model.elements) {
    const ke = assembleElementStiffness(element);

    const dof = [element.startNode, element.endNode];

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        K[dof[i]][dof[j]] += ke[i][j];
      }
    }
  }

  return K;
}
