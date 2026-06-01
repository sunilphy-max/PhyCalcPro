export type BoltPatternPosition = { x: number; y: number };

export type BoltPatternConfig = {
  boltCount: number;
  /** Bolt circle / pattern radius for evenly spaced bolts (m). */
  patternRadius: number;
  /** Custom positions override even spacing when provided. */
  positions?: BoltPatternPosition[];
  shearForce: number;
  axialForce: number;
  /** Eccentricity of shear from pattern centroid (m). */
  eccentricityX?: number;
  eccentricityY?: number;
  boltStiffness?: number;
};

export type BoltPatternBoltLoad = {
  index: number;
  x: number;
  y: number;
  force: number;
};

export type BoltPatternResult = {
  boltCount: number;
  centroidX: number;
  centroidY: number;
  maxBoltForce: number;
  minBoltForce: number;
  meanBoltForce: number;
  bolts: BoltPatternBoltLoad[];
  polarMoment: number;
  appliedMoment: number;
};
