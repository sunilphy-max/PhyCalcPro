export type BeamNode = {
  id: number;
  x: number;
};

export type BeamElement = {
  id: number;

  startNode: number;
  endNode: number;

  E: number;
  I: number;
  L: number;
};

export type FEMModel = {
  nodes: BeamNode[];
  elements: BeamElement[];
};