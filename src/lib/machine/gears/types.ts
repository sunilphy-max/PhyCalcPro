export type GearMaterial = {
  name: string;
  E: number;
  yieldStress: number;
  poisson: number;
};

export type GearConfig = {
  power: number;
  speed: number;
  module: number;
  pinionTeeth: number;
  gearRatio: number;
  faceWidth: number;
  material: GearMaterial;
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
  scuffingSafetyFactor: number;
  bendingFatigueSafetyFactor: number;
  contactFatigueSafetyFactor: number;
  micropittingSafetyFactor: number;
  micropittingIndex: number;
};
