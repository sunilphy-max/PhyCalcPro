export type HousingMountStyle = "pillow_block" | "flange" | "foot";

export type HousingConfig = {
  /** Bearing bore / shaft diameter at housing (m). */
  boreDiameter: number;
  radialLoad: number;
  axialLoad: number;
  speed: number;
  mountStyle: HousingMountStyle;
  boltCount: number;
  boltCircleDiameter: number;
  yieldStress: number;
};

export type HousingResult = {
  bodyStress: number;
  bodySafetyFactor: number;
  boltTensionPerBolt: number;
  boltShearPerBolt: number;
  housingDeflection: number;
  stiffnessEstimate: number;
  recommendedBoltSize: string;
  isSafe: boolean;
  designStatus: "safe" | "warning" | "critical";
  governingFailureMode: string;
};
