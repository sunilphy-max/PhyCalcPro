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

export type Load = PointLoad | UDL;

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
  meshSegments?: number;
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
  reactions?: number[];
};