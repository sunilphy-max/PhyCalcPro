/**
 * Buckling FEA Type Definitions
 * Node, element, and model structures for buckling eigenvalue analysis
 */

export type BucklingNode = {
  id: number; // Node identifier
  x: number; // Position along column (m)
};

export type BucklingElement = {
  startNode: number; // Start node ID
  endNode: number; // End node ID
  E: number; // Elastic modulus (Pa)
  I: number; // Second moment of inertia (m^4)
  A: number; // Cross-sectional area (m^2)
  length: number; // Element length (m)
};

export type BucklingFEMModel = {
  nodes: BucklingNode[];
  elements: BucklingElement[];
};

export type BucklingStressData = {
  x: number[];
  mode1: number[]; // First buckling mode shape
  mode2: number[]; // Second mode (if available)
  mode3: number[]; // Third mode (if available)
};

export type EndCondition = "pinned" | "fixed" | "cantilever" | "guided";
