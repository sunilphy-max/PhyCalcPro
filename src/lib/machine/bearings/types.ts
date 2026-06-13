export type BearingType = "deep_groove" | "angular_contact" | "cylindrical_roller";

export type BearingMaterial = {
  name: string;
  dynamicRatingFactor: number;
  staticRatingFactor: number;
  allowableLife: number;
};

export type BearingReliability = 90 | 95 | 96 | 97 | 98 | 99;

export type BearingConfig = {
  radialLoad: number;
  axialLoad: number;
  speed: number;
  lifeHours: number;
  safetyFactor: number;
  bearingType: BearingType;
  /** Basic dynamic load rating C (N). Overrides material.dynamicRatingFactor. */
  dynamicLoadRatingN?: number;
  /** Catalog designation when a standard bearing is selected */
  designation?: string;
  /** ISO 281 reliability level for the a1 factor (default 90 → a1 = 1) */
  reliabilityPercent?: BearingReliability;
  /** Legacy material entry; dynamicRatingFactor is used as C when set */
  material: BearingMaterial;
};

export type BearingResult = {
  radialLoad: number;
  axialLoad: number;
  equivalentLoad: number;
  /** Required C to reach lifeHours at the given speed and reliability (N) */
  requiredDynamicRating: number;
  /** L10(mr) adjusted rating life in hours at the given reliability */
  expectedLife: number;
  /** Basic dynamic rating used for the life estimate (N) */
  dynamicLoadRatingN: number;
  /** ISO 281 life exponent (3 ball, 10/3 roller) */
  lifeExponent: number;
  /** ISO 281 a1 reliability factor */
  a1: number;
  /** Life utilization: required life / expected life */
  lifeUtilization: number;
  safetyFactor: number;
  bearingType: BearingType;
  designation?: string;
  material: BearingMaterial;
};
