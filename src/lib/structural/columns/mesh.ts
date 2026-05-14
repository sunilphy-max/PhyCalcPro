/**
 * Buckling Mesh Generation
 * Creates nodes and elements for column discretization
 */

import type { BucklingFEMModel, BucklingNode, BucklingElement, EndCondition } from "./femTypes";

export function generateBucklingMesh(
  length: number,
  E: number,
  I: number,
  A: number,
  meshSegments: number = 50
): BucklingFEMModel {
  const nodes: BucklingNode[] = [];
  const elements: BucklingElement[] = [];

  // Create nodes along column length
  for (let i = 0; i <= meshSegments; i++) {
    nodes.push({
      id: i,
      x: (i / meshSegments) * length,
    });
  }

  // Create elements connecting consecutive nodes
  for (let i = 0; i < meshSegments; i++) {
    elements.push({
      startNode: i,
      endNode: i + 1,
      E,
      I,
      A,
      length: length / meshSegments,
    });
  }

  return { nodes, elements };
}
