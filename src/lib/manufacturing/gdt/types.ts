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

/** Title-block / sheet metadata for audit trail. */
export type DrawingMetadata = {
  drawingNumber?: string;
  revision?: string;
  sheet?: string;
  title?: string;
  material?: string;
  scale?: string;
  units?: string;
};

/** Location of an annotation on the source drawing (traceability). */
export type AnnotationLocation = {
  sheet?: string;
  zone?: string;
  page?: number;
  /** Optional normalized bbox [x0,y0,x1,y1] in 0–1 page coords for highlight. */
  bbox?: [number, number, number, number];
};

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
  location?: AnnotationLocation;
  /** Composite frame segment (ASME): upper = pattern location, lower = feature-to-feature. */
  compositeSegment?: "upper" | "lower";
  /** Simultaneous requirement group id when frames must be evaluated together. */
  simultaneousGroup?: string;
  /** Pattern instance count (drawing convention); informational for stack unless expanded. */
  patternCount?: number;
  /** Projected tolerance zone length (SI metres), when specified on drawing. */
  projectedZoneLength?: number;
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

/** Per-contributor process model for Monte Carlo (optional). */
export type ContributorDistribution = "uniform" | "normal" | "triangular";

export type ContributorProcessStats = {
  distribution?: ContributorDistribution;
  /** Process capability; σ ≈ tolWidth / (6·Cpk) when set. */
  cpk?: number;
  /** Explicit process standard deviation (SI). Overrides Cpk when set. */
  processSigma?: number;
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
  /** Default MC distribution when contributor stats omit one. */
  defaultDistribution?: ContributorDistribution;
  /** Optional process stats keyed by contributor id. */
  contributorStats?: Record<string, ContributorProcessStats>;
  /** Functional requirement band (SI metres) for yield calc. */
  requirementMinSi?: number;
  requirementMaxSi?: number;
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

export type ContributorSensitivity = {
  id: string;
  label?: string;
  pctOfWc: number;
  rssLeverage: number;
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
  /** 95th percentile of MC assembly magnitude (SI). */
  monteCarloPercentile95?: number;
  /** Fraction of MC samples inside [requirementMin, requirementMax] when set. */
  monteCarloYield?: number;
  sensitivity?: ContributorSensitivity[];
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
  location?: AnnotationLocation;
};

/** Structured extract returned by the drawing parse API (inputs only). */
export type DrawingExtract = {
  metadata?: DrawingMetadata;
  datums: Datum[];
  features: FeatureOfSize[];
  frames: FeatureControlFrame[];
  dimensions: DimensionCallout[];
  fitCallouts: FitCallout[];
  /** Suggested stack contributors for tolerance mode (may be empty). */
  suggestedContributors: StackContributor[];
  notes?: string[];
};
