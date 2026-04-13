export type Load =
  | { type: "point"; value: number; position: number }
  | { type: "udl"; value: number; start: number; end: number };

export type SupportType =
  | "simply_supported"
  | "cantilever"
  | "fixed_fixed";

export type BeamConfig = {
  length: number;
  E: number;
  I: number;
  c: number;
  support: SupportType;
  loads: Load[];
};

export type BeamResult = {
  x: number[];
  shear: number[];
  moment: number[];
  deflection: number[];
  stress: number[];
  maxStress: number;
  maxDeflection: number;
};