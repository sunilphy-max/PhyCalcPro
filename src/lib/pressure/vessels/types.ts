export type PressureVesselConfig = {
  radius: number;
  thickness: number;
  length: number;
  pressure: number;
  E: number;
  A: number;
  segments: number;
};

export type PressureVesselNode = {
  x: number;
  y: number;
  index: number;
};

export type PressureVesselElement = {
  id: string;
  start: number;
  end: number;
  length: number;
  cos: number;
  sin: number;
  area: number;
};

export type PressureVesselResult = {
  nodes: PressureVesselNode[];
  elements: PressureVesselElement[];
  displacements: { dx: number; dy: number }[];
  hoopStress: number[];
  maxRadialDisplacement: number;
  maxHoopStress: number;
  angles: number[];
  radialDisplacement: number[];
  segments: number;
  radius: number;
  thickness: number;
  length: number;
  pressure: number;
};
