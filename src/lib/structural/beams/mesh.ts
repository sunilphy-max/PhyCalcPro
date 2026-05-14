import {
  BeamNode,
  BeamElement,
  FEMModel,
} from "./femTypes";

export function generateBeamMesh(
  length: number,
  E: number,
  I: number,
  divisions = 20
): FEMModel {

  const nodes: BeamNode[] = [];
  const elements: BeamElement[] = [];

  // ---------------------------
  // NODES
  // ---------------------------

  for (let i = 0; i <= divisions; i++) {

    nodes.push({
      id: i,
      x: (i / divisions) * length,
    });
  }

  // ---------------------------
  // ELEMENTS
  // ---------------------------

  for (let i = 0; i < divisions; i++) {

    const L =
      nodes[i + 1].x - nodes[i].x;

    elements.push({
      id: i,

      startNode: i,
      endNode: i + 1,

      E,
      I,
      L,
    });
  }

  return {
    nodes,
    elements,
  };
}