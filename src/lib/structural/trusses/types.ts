export type TrussNode = {
  x: number;
  y: number;
  index: number;
};

export type TrussElement = {
  id: string;
  start: number;
  end: number;
  length: number;
  cos: number;
  sin: number;
};

export type TrussMesh = {
  nodes: TrussNode[];
  elements: TrussElement[];
  topNodeIndices: number[];
  bottomNodeIndices: number[];
  span: number;
  height: number;
  panels: number;
};

export type TrussConfig = {
  span: number;
  height: number;
  panels: number;
  A: number;
  E: number;
  load: number;
};

export type TrussForce = {
  id: string;
  force: number;
  type: "tension" | "compression";
  length: number;
  start: number;
  end: number;
};

export type Reaction = {
  node: number;
  fx: number;
  fy: number;
};

export type TrussResult = {
  nodes: TrussNode[];
  elements: TrussElement[];
  displacements: { dx: number; dy: number }[];
  memberForces: TrussForce[];
  reactions: Reaction[];
  maxDisplacement: number;
  maxForce: number;
  topNodesX: number[];
  topDeflections: number[];
  panels: number;
  span: number;
  height: number;
};
