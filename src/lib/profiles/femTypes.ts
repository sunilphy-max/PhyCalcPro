/**
 * Profiles FEA Type Definitions
 * Node, element, and model structures for cross-sectional analysis
 */

export type CrossSectionNode = {
  id: number;
  x: number; // x-coordinate
  y: number; // y-coordinate
};

export type CrossSectionElement = {
  id: number;
  nodes: number[]; // 3-4 node IDs (triangular or quad)
  material?: {
    E: number;
    nu: number;
  };
};

export type CrossSectionFEAModel = {
  nodes: CrossSectionNode[];
  elements: CrossSectionElement[];
};

export type AreaPropertiesData = {
  area: number;
  centroidX: number;
  centroidY: number;
  ixx: number;
  iyy: number;
  ixy: number;
  stressDistribution?: number[];
};
