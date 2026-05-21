export type BearingType = "deep_groove" | "angular_contact";

export type BearingMaterial = {
  name: string;
  dynamicRatingFactor: number;
  staticRatingFactor: number;
  allowableLife: number;
};

export type BearingConfig = {
  radialLoad: number;
  axialLoad: number;
  speed: number;
  lifeHours: number;
  safetyFactor: number;
  bearingType: BearingType;
  material: BearingMaterial;
};

export type BearingResult = {
  radialLoad: number;
  axialLoad: number;
  equivalentLoad: number;
  requiredDynamicRating: number;
  expectedLife: number;
  safetyFactor: number;
  bearingType: BearingType;
  material: BearingMaterial;
};
