import type { BearingClearance } from "@/data/catalogs/bearingCatalog";
import type { FitRecommendation } from "@/lib/machine/bearings/fitsClearance";

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
  bearingClearance?: BearingClearance;
  operatingTempDeltaC?: number;
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
  fitRecommendation: FitRecommendation;
  recommendedShaftFit: string;
  recommendedHousingFit: string;
  estimatedOperatingClearanceUm: number;
};
