export type BaseLoad = {
  id: string;
};

export type PointLoad = BaseLoad & {
  type: "point";
  value: number;
  position: number;
};

export type UDL = BaseLoad & {
  type: "udl";
  value: number;
  start: number;
  end: number;
};

export type MomentLoad = BaseLoad & {
  type: "moment";
  value: number;
  position: number;
};

/** Linear distributed load (triangular when one end is 0; trapezoidal otherwise). */
export type TriangularLoad = BaseLoad & {
  type: "triangular";
  wStart: number;
  wEnd: number;
  start: number;
  end: number;
};

export type Load = PointLoad | UDL | MomentLoad | TriangularLoad;

export type BeamApplicationContext = {
  id: string;
  label: string;
  description: string;
  standards: string[];
  loadFactor: number;
  allowableStressRatio: number;
  deflectionLimitRatio: number;
  fatigueSensitive: boolean;
  allowableStress: number;
  deflectionLimit: number;
  stressUtilization: number;
  deflectionUtilization: number;
  calculationNotes: string[];
  limitations: string[];
};

export type SupportType =
  | "simply_supported"
  | "cantilever"
  | "fixed_fixed";

export type SupportKind = "pin" | "roller" | "fixed";

export type BeamSupport = {
  id: string;
  x: number;
  kind: SupportKind;
};

export type SupportReaction = {
  supportId: string;
  x: number;
  kind: SupportKind;
  Fy: number;
  Mz?: number;
};

export type BeamConfig = {
  length: number;
  E: number;
  I: number;
  c: number;
  /** Preset end condition; used when `supports` is omitted. */
  support?: SupportType;
  /** Explicit supports (enables intermediate / continuous beams). */
  supports?: BeamSupport[];
  loads: Load[];
  meshSegments?: number;
  /** Optional section area (m²) for self-weight and reporting. */
  area?: number;
  /** Include gravity self-weight as UDL when area + density provided. */
  includeSelfWeight?: boolean;
  /** Material density kg/m³ for self-weight. */
  density?: number;
};

export type BeamResult = {
  x: number[];
  shear: number[];
  moment: number[];
  slope: number[];
  deflection: number[];
  stress: number[];
  maxStress: number;
  maxDeflection: number;
  maxMoment: number;
  maxShear: number;
  /** Raw DOF reaction vector (legacy). */
  reactions?: number[];
  /** Mapped reactions at each support. */
  supportReactions?: SupportReaction[];
  physicsChecks?: {
    staticEquilibriumResidual: number;
    finiteValues: boolean;
  };
  solverMeta?: {
    meshSegments: number;
    support: SupportType | "continuous";
    solver: "beam-fem";
    warnings: string[];
  };
  applicationContext?: BeamApplicationContext;
};
