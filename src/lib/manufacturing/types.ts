export type FitConfig = {
  nominalSize: number;
  holeUpper: number;
  holeLower: number;
  shaftUpper: number;
  shaftLower: number;
};

export type FitResult = {
  holeMin: number;
  holeMax: number;
  shaftMin: number;
  shaftMax: number;
  clearanceMin: number;
  clearanceMax: number;
  fitType: "clearance" | "transition" | "interference";
};

export type ToleranceConfig = {
  tolerances: number[];
};

export type ToleranceResult = {
  tolerances: number[];
  count: number;
  worstCase: number;
  rss: number;
  totalTolerance: number;
};
