export type SupportType = "simply_supported" | "cantilever" | "fixed_fixed";

export type VibrationConfig = {
  length: number;
  E: number;
  I: number;
  A: number;
  rho: number;
  segments: number;
  support: SupportType;
};

export type VibrationResult = {
  x: number[];
  frequencies: number[];
  modeShapes: number[][];
  support: SupportType;
  segments: number;
  length: number;
  modalMass: number[];
  modalStiffness: number[];
};

export type VibrationNode = {
  x: number;
  index: number;
};

export type VibrationElement = {
  id: string;
  start: number;
  end: number;
  length: number;
  A: number;
  I: number;
  rho: number;
};

export type VibrationMesh = {
  nodes: VibrationNode[];
  elements: VibrationElement[];
  length: number;
  segments: number;
};
