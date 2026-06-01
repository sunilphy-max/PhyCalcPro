export type FitConfig = {
  nominalSize: number;
  holeUpper: number;
  holeLower: number;
  shaftUpper: number;
  shaftLower: number;
  /** ISO 286 tolerance grade e.g. 7 for H7/g6 auto lookup */
  isoHoleGrade?: number;
  isoShaftGrade?: number;
  isoHoleLetter?: string;
  isoShaftLetter?: string;
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
  tolerancesY?: number[];
  monteCarloSamples?: number;
};

export type ToleranceResult = {
  tolerances: number[];
  count: number;
  worstCase: number;
  rss: number;
  totalTolerance: number;
  worstCaseY?: number;
  rssY?: number;
  monteCarloMean?: number;
  monteCarloStdDev?: number;
};
