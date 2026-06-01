export type VBeltConfig = {
  power: number;
  speedDriver: number;
  diameterDriver: number;
  diameterDriven: number;
  centerDistance: number;
  serviceFactor: number;
  beltFactor: number;
  frictionCoeff: number;
};

export type VBeltResult = {
  beltLength: number;
  wrapAngleDriver: number;
  wrapAngleDriven: number;
  beltSpeed: number;
  powerCapacity: number;
  powerUtilization: number;
  pretensionEstimate: number;
  drivenSpeed: number;
  ratio: number;
};
