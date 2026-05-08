import { BeamElement, BeamNode, FEMModel } from "./femTypes";

export function generateBeamMesh(
  length: number,
  E: number,
  I: number,
  segments: number
): FEMModel {
  const nodes: BeamNode[] = [];
  const elements: BeamElement[] = [];

  for (let i = 0; i <= segments; i++) {
    nodes.push({
      id: i,
      x: (length * i) / segments,
    });
  }

  for (let i = 0; i < segments; i++) {
    elements.push({
      id: i,
      startNode: i,
      endNode: i + 1,
      E,
      I,
      L: length / segments,
    });
  }

  return {
    nodes,
    elements,
  };
}
