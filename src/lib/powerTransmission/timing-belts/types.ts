export type TimingBeltConfig = {
  power: number;
  speedDriver: number;
  pitch: number;
  teethDriver: number;
  teethDriven: number;
  beltWidth: number;
  serviceFactor: number;
};

export type TimingBeltResult = {
  ratio: number;
  drivenSpeed: number;
  pitchDiameterDriver: number;
  pitchDiameterDriven: number;
  centerDistance: number;
  beltLengthTeeth: number;
  beltLength: number;
  tangentialForce: number;
  shaftLoadEstimate: number;
  powerUtilization: number;
};
