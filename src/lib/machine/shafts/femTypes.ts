/**
 * FEA Types for Shaft Analysis
 * Defines mesh and element structures for shaft FEM
 */

export type ShaftNode = {
  id: number;
  x: number;
};

export type ShaftElement = {
  id: number;
  startNode: number;
  endNode: number;
  E: number;
  G: number;
  diameter: number;
  innerDiameter?: number;
  length: number;
  polarMoment: number;
  secondMoment: number;
  area: number;
  density: number;
};

export type ShaftFEMModel = {
  nodes: ShaftNode[];
  elements: ShaftElement[];
  length: number;
};

export type ElementStiffness = {
  K: number[][];
  Kt: number[][]; // Torsional
  Kb: number[][]; // Bending
};

export type ShaftDOF = {
  nodeId: number;
  type: "axial" | "torque" | "bendingX" | "bendingY" | "rotationX" | "rotationY";
};
