/**
 * Screws FEA Type Definitions
 * Node, element, and model structures for screw stress analysis
 */

export type ScrewNode = {
  id: number;
  x: number; // Position along screw axis (m)
  r: number; // Radial position (m)
};

export type ScrewElement = {
  startNode: number;
  endNode: number;
  diameter: number; // Local diameter (m)
  thickness: number; // Thread thickness (m)
  E: number; // Elastic modulus (Pa)
  G: number; // Shear modulus (Pa)
};

export type ScrewFEAModel = {
  nodes: ScrewNode[];
  elements: ScrewElement[];
};

export type ScrewStressData = {
  x: number[];
  shearStress: number[];
  tensileStress: number[];
  contactStress: number[];
  vonMisesStress: number[];
};
