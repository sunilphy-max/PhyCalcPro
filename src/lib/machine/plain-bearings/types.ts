export type PlainBearingType = "journal" | "thrust_pad" | "tilting_pad";

export type PlainBearingMaterial = "bronze" | "babbitt" | "steel" | "ptfe";

export type PlainBearingConfig = {
  bearingType: PlainBearingType;
  load: number;
  speed: number;
  diameter: number;
  length: number;
  clearance: number;
  /** Dynamic viscosity Pa·s */
  viscosity: number;
  operatingTempC?: number;
  ambientTempC?: number;
  material?: PlainBearingMaterial;
  padDiameterRatio?: number;
  padCount?: number;
};

export type PlainBearingResult = {
  bearingType: PlainBearingType;
  sommerfeldNumber: number;
  eccentricityRatio: number;
  minFilmThickness: number;
  powerLoss: number;
  unitLoad?: number;
  specificLoadPa?: number;
  temperatureRiseC?: number;
  outletTempC?: number;
  shaftFit?: string;
  housingFit?: string;
  minRecommendedClearanceUm?: number;
  status: string;
  designStatus: "safe" | "warning" | "critical";
  isSafe: boolean;
};
