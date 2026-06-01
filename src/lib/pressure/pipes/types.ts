export type PressurePipeConfig = {
  radius: number;
  thickness: number;
  length: number;
  pressure: number;
  E: number;
  segments: number;
};

export type PressurePipeNode = {
  x: number;
  y: number;
  index: number;
};

export type PressurePipeElement = {
  id: string;
  start: number;
  end: number;
  length: number;
  cos: number;
  sin: number;
  A: number;
  I: number;
};

export type PipeStressCategory = "sustained" | "occasional" | "peak";

export type PipeStressSummary = {
  category: PipeStressCategory;
  label: string;
  hoopStress: number;
  longitudinalStress: number;
  equivalentStress: number;
  allowableStress: number;
  utilization: number;
};

export type PressurePipeResult = {
  nodes: PressurePipeNode[];
  elements: PressurePipeElement[];
  displacements: { dx: number; dy: number; rotation: number }[];
  hoopStress: number[];
  radialDisplacement: number[];
  maxRadialDisplacement: number;
  maxHoopStress: number;
  /** ASME B31.3–style stress category screening (indicative). */
  stressCategories: PipeStressSummary[];
  angles: number[];
  segments: number;
  radius: number;
  thickness: number;
  length: number;
  pressure: number;
};
