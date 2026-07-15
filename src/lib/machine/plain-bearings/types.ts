export type PlainBearingType = "journal" | "thrust_pad" | "tilting_pad";

/** @deprecated Prefer materialId from plainBearingMaterials catalog. */
export type PlainBearingMaterial = "bronze" | "babbitt" | "steel" | "ptfe";

export type PlainBearingConfig = {
  bearingType: PlainBearingType;
  load: number;
  speed: number;
  diameter: number;
  length: number;
  clearance: number;
  /** Dynamic viscosity Pa·s (used when oilId is omitted). */
  viscosity: number;
  operatingTempC?: number;
  ambientTempC?: number;
  material?: PlainBearingMaterial;
  /** Catalog material id from plainBearingMaterials. */
  materialId?: string;
  /** Catalog oil id from plainBearingOils — overrides viscosity at ambient. */
  oilId?: string;
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
  /** Surface speed · specific load (Pa·m/s) for material PV check. */
  pvPaMs?: number;
  lengthOverDiameter?: number;
  temperatureRiseC?: number;
  outletTempC?: number;
  shaftFit?: string;
  housingFit?: string;
  minRecommendedClearanceUm?: number;
  oilId?: string;
  materialId?: string;
  status: string;
  designStatus: "safe" | "warning" | "critical";
  isSafe: boolean;
};
