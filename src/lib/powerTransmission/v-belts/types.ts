export type VBeltConfig = {
  /** Motor / driver shaft power (kW, before service factor). */
  power: number;
  speedDriver: number;
  /** Used to verify ratio when diameters are supplied. */
  speedDriven?: number;
  diameterDriver: number;
  diameterDriven: number;
  centerDistance: number;
  serviceFactor: number;
  beltFactor: number;
  frictionCoeff: number;
  beltSection: string;
};

export type VBeltApplicationInsights = import("./applications").VBeltApplicationInsights;

export type VBeltResult = {
  beltSection: string;
  ratio: number;
  diameterDriver: number;
  diameterDriven: number;
  centerDistance: number;
  beltLength: number;
  standardBeltLengthMm: number;
  wrapAngleDriver: number;
  wrapAngleDriven: number;
  beltSpeed: number;
  designPowerKw: number;
  powerCapacityPerBelt: number;
  numberOfBelts: number;
  powerUtilization: number;
  tightSideTension: number;
  slackSideTension: number;
  pretensionEstimate: number;
  radialLoadDriver: number;
  radialLoadDriven: number;
  driverTorque: number;
  drivenSpeed: number;
  speedRatioFromRpm: number | null;
  applicationInsights?: VBeltApplicationInsights;
};
