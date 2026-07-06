export type GearMaterial = {
  name: string;
  E: number;
  yieldStress: number;
  poisson: number;
};

/** ISO 6336 worksheet factors (MITCalc-style rating inputs). */
export type GearRatingOptions = {
  applicationFactor?: number;
  faceLoadFactor?: number;
  qualityGrade?: number;
  lubrication?: "oil_bath" | "oil_mist" | "grease" | "dry";
  enableScuffingScreen?: boolean;
  enableMicropittingScreen?: boolean;
};

export type GearConfig = {
  power: number;
  speed: number;
  module: number;
  pinionTeeth: number;
  gearRatio: number;
  faceWidth: number;
  material: GearMaterial;
  rating?: GearRatingOptions;
};

export type GearIso6336Factors = {
  KA: number;
  KV: number;
  KHbeta: number;
  ZH: number;
  ZE: number;
  Zeps: number;
  YFS: number;
  Yeps: number;
  contactRatio: number;
};

export type GearResult = {
  pinionTeeth: number;
  gearTeeth: number;
  actualRatio: number;
  module: number;
  faceWidth: number;
  pitchDiameterPinion: number;
  pitchDiameterGear: number;
  torque: number;
  tangentialForce: number;
  lewisY: number;
  bendingStress: number;
  allowableStress: number;
  safetyFactor: number;
  contactStress: number;
  contactSafetyFactor: number;
  pitchLineVelocity: number;
  bendingFatigueSafetyFactor: number;
  contactFatigueSafetyFactor: number;
  material: GearMaterial;
  /** ISO 6336 factor breakdown when rating options are used */
  iso6336?: GearIso6336Factors;
  iso6336BendingSafetyFactor?: number;
  iso6336ContactSafetyFactor?: number;
  scuffingSafetyFactor?: number | null;
  micropittingSafetyFactor?: number | null;
};
