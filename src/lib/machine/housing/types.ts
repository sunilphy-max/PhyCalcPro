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
  /** Catalog SKU (SNL / UCP / …) when selected. */
  housingSku?: string;
  /** Relative stiffness vs generic cantilever (from housing catalog). */
  stiffnessFactor?: number;
  /** Catalog base / center height (m) — scales section estimate. */
  baseHeightM?: number;
};

export type HousingResult = {
  bodyStress: number;
  bodySafetyFactor: number;
  /** Body stress / yield (1 = at yield). */
  bodyUtilization: number;
  boltTensionPerBolt: number;
  boltShearPerBolt: number;
  /** Bolt von Mises / (0.7·yield) on recommended size. */
  boltUtilization: number;
  boltVonMisesPa: number;
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
  housingSku?: string;
  catalogStiffnessFactor?: number;
};
