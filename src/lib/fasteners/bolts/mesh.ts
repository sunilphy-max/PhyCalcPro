/**
 * Screws Mesh Generation
 * Creates FEA mesh for screw stress analysis
 */

import type { ScrewFEAModel, ScrewNode, ScrewElement } from "./femTypes";

export function generateScrewMesh(
  length: number,
  majorDiameter: number,
  minorDiameter: number,
  E: number,
  G: number,
  meshSegments: number = 50
): ScrewFEAModel {
  const nodes: ScrewNode[] = [];
  const elements: ScrewElement[] = [];

  const pitchRadius = majorDiameter / 2;
  const rootRadius = minorDiameter / 2;
  const threadThickness = (pitchRadius - rootRadius) / 2;

  // Create nodes along screw length
  for (let i = 0; i <= meshSegments; i++) {
    const x = (i / meshSegments) * length;

    // Surface node (pitch diameter)
    nodes.push({
      id: nodes.length,
      x,
      r: pitchRadius,
    });

    // Root node (minor diameter)
    nodes.push({
      id: nodes.length,
      x,
      r: rootRadius,
    });
  }

  // Create axisymmetric elements
  for (let i = 0; i < meshSegments; i++) {
    const elemLength = length / meshSegments;
    const avgDiameter = majorDiameter - (i / meshSegments) * (majorDiameter - minorDiameter) * 0.1;

    // Axisymmetric element from surface to root
    elements.push({
      startNode: i * 2,
      endNode: i * 2 + 2,
      diameter: avgDiameter,
      thickness: threadThickness,
      E,
      G,
    });

    // Root element
    elements.push({
      startNode: i * 2 + 1,
      endNode: i * 2 + 3,
      diameter: minorDiameter,
      thickness: threadThickness,
      E,
      G,
    });
  }

  return { nodes, elements };
}
