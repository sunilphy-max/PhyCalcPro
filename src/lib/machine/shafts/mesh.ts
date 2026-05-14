/**
 * Shaft Mesh Generator
 * Creates discretized FEA mesh for shaft analysis
 */

import type { ShaftFEMModel, ShaftNode, ShaftElement } from "./femTypes";

export function generateShaftMesh(
  length: number,
  diameter: number,
  E: number,
  G: number,
  divisions: number = 20
): ShaftFEMModel {
  const nodes: ShaftNode[] = [];
  const elements: ShaftElement[] = [];

  // Calculate geometry properties
  const radius = diameter / 2;
  const area = Math.PI * radius * radius;
  const polarMoment = (Math.PI * Math.pow(diameter, 4)) / 32; // J
  const secondMoment = (Math.PI * Math.pow(diameter, 4)) / 64; // I

  // ===========================
  // GENERATE NODES
  // ===========================
  for (let i = 0; i <= divisions; i++) {
    nodes.push({
      id: i,
      x: (i / divisions) * length,
    });
  }

  // ===========================
  // GENERATE ELEMENTS
  // ===========================
  for (let i = 0; i < divisions; i++) {
    const elementLength = nodes[i + 1].x - nodes[i].x;

    elements.push({
      id: i,
      startNode: i,
      endNode: i + 1,
      E,
      G,
      diameter,
      length: elementLength,
      polarMoment,
      secondMoment,
      area,
    });
  }

  return {
    nodes,
    elements,
    length,
  };
}
