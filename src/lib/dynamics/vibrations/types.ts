export type SupportType = "simply_supported" | "cantilever" | "fixed_fixed";

export type VibrationConfig = {
  length: number;
  E: number;
  I: number;
  A: number;
  rho: number;
  segments: number;
  support: SupportType;
  /** Viscous damping ratio ζ (0–0.5 typical). */
  dampingRatio?: number;
};

export type VibrationResult = {
  x: number[];
  frequencies: number[];
  /** ω_d = ω_n √(1 − ζ²) for each mode. */
  dampedNaturalFrequencies: number[];
  dampingRatio: number;
  resonanceNote: string;
  modeShapes: number[][];
  support: SupportType;
  segments: number;
  length: number;
  modalMass: number[];
  modalStiffness: number[];
  /** First mode natural frequency (Hz) — scalar for benchmarks. */
  fundamentalFrequency: number;
  physicsChecks?: {
    positiveFrequencies: boolean;
    monotonicFrequencyOrder: boolean;
  };
  solverMeta?: {
    meshSegments: number;
    support: SupportType;
    solver: "euler-bernoulli-fem";
    warnings: string[];
  };
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
