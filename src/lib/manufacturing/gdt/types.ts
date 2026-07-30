/** Material condition on a feature or datum reference (ASME Y14.5 / ISO 1101). */
export type MaterialCondition = "RFS" | "MMC" | "LMC";

export type DatumType = "plane" | "axis" | "point";

export type GdtCharacteristic =
  | "position"
  | "perpendicularity"
  | "parallelism"
  | "profile"
  | "concentricity"
  | "coaxiality"
  | "circularRunout"
  | "totalRunout"
  | "size";

export type StackAxis = "X" | "Y" | "Z";

export type Datum = {
  id: string;
  type: DatumType;
  label?: string;
};

/** Feature of size with absolute limit dimensions (SI metres). */
export type FeatureOfSize = {
  id: string;
  label?: string;
  nominal: number;
  upperLimit: number;
  lowerLimit: number;
  /** true = hole / slot (internal); false = pin / shaft (external) */
  isInternal: boolean;
};

export type DatumReference = {
  datumId: string;
  materialCondition?: MaterialCondition;
};

export type FeatureControlFrame = {
  id: string;
  characteristic: GdtCharacteristic;
  /** Tolerance zone size (diameter or width), SI metres. */
  zoneValue: number;
  isDiameterZone?: boolean;
  materialCondition: MaterialCondition;
  datumRefs: DatumReference[];
  /** Feature of size this FCF applies to (for bonus). */
  featureOfSizeId?: string;
  label?: string;
  confidence?: number;
};

export type StackContributorSource =
  | { kind: "size"; featureOfSizeId: string }
  | { kind: "fcf"; fcfId: string }
  | { kind: "datumShift"; datumId: string; featureOfSizeId: string };

export type StackContributor = {
  id: string;
  label?: string;
  sense: 1 | -1;
  axis: StackAxis;
  source: StackContributorSource;
  /** Multiplier for projecting onto stack axis (default 1). */
  projectionFactor?: number;
};

export type GdtStackConfig = {
  features: FeatureOfSize[];
  frames: FeatureControlFrame[];
  datums: Datum[];
  contributors: StackContributor[];
  /** Actual sizes by feature id (SI). When omitted, worst-case bonus is used. */
  actualSizes?: Record<string, number>;
  /**
   * When true (default), geometric MMC/LMC bonus uses the size that
   * maximizes available bonus (LMC for MMC callouts, MMC for LMC callouts).
   */
  useWorstCaseBonus?: boolean;
  monteCarloSamples?: number;
};

export type ContributorBreakdown = {
  id: string;
  label?: string;
  axis: StackAxis;
  sense: 1 | -1;
  specifiedTolerance: number;
  bonus: number;
  effectiveTolerance: number;
  kind: "size" | "fcf" | "datumShift";
  characteristic?: GdtCharacteristic;
};

export type GdtStackResult = {
  contributors: ContributorBreakdown[];
  count: number;
  worstCase: number;
  rss: number;
  totalTolerance: number;
  worstCaseY?: number;
  rssY?: number;
  worstCaseZ?: number;
  rssZ?: number;
  worstCase3d?: number;
  rss3d?: number;
  monteCarloMean?: number;
  monteCarloStdDev?: number;
};

/** ISO fit callout extracted from a drawing (e.g. Ø20 H7/g6). */
export type FitCallout = {
  id: string;
  label?: string;
  nominal: number;
  holeLetter?: string;
  holeGrade?: number;
  shaftLetter?: string;
  shaftGrade?: number;
  holeUpper?: number;
  holeLower?: number;
  shaftUpper?: number;
  shaftLower?: number;
  confidence?: number;
};

/** Size / bilateral dimension callout from a drawing. */
export type DimensionCallout = {
  id: string;
  label?: string;
  nominal: number;
  upperDeviation: number;
  lowerDeviation: number;
  isInternal?: boolean;
  confidence?: number;
};

/** Structured extract returned by the drawing parse API (inputs only). */
export type DrawingExtract = {
  datums: Datum[];
  features: FeatureOfSize[];
  frames: FeatureControlFrame[];
  dimensions: DimensionCallout[];
  fitCallouts: FitCallout[];
  /** Suggested stack contributors for tolerance mode (may be empty). */
  suggestedContributors: StackContributor[];
  notes?: string[];
};
