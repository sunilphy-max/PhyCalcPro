export type InternalGearsRackMaterial = {
  name: string;
  E: number;
  yieldStress: number;
  poisson: number;
};

export type InternalGearsRackConfig = {
  gearType: "internal" | "rack";
  power: number;
  speed: number;
  module: number;
  pinionTeeth: number;
  gearTeeth: number;
  faceWidth: number;
  material: InternalGearsRackMaterial;
};

export type InternalGearsRackResult = {
  gearType: "internal" | "rack";
  pinionTeeth: number;
  gearTeeth: number;
  actualRatio: number;
  pitchDiameterPinion: number;
  pitchDiameterGear: number;
  tangentialForce: number;
  lewisY: number;
  bendingStress: number;
  safetyFactor: number;
  contactStress: number;
  contactSafetyFactor: number;
  pitchLineVelocity: number;
  material: InternalGearsRackMaterial;
};
