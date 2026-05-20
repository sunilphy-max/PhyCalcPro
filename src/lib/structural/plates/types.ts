export type BoundaryType = "clamped" | "simply_supported";

export type PlateConfig = {
  length: number;
  width: number;
  thickness: number;
  E: number;
  nu: number;
  q: number;
  elementsX: number;
  elementsY: number;
  boundaryType: BoundaryType;
};

export type PlateResult = {
  x: number[];
  y: number[];
  w: number[][];
  momentX: number[][];
  momentY: number[][];
  momentXY: number[][];
  maxDeflection: number;
  minDeflection: number;
  maxMoment: number;
  deflectionAlongLength: number[];
  deflectionAlongWidth: number[];
  elementsX: number;
  elementsY: number;
  boundaryType: BoundaryType;
};
