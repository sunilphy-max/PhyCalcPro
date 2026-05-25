export type SuspensionConfig = {
  sprungMass: number;
  trackWidth: number;
  rollStiffness: number;
  wheelbase: number;
  lateralAcceleration: number;
  cgHeight: number;
};

export type SuspensionResult = {
  lateralForce: number;
  rollMoment: number;
  rollAngleDegrees: number;
  loadTransfer: number;
  designStatus: "stable" | "moderate" | "high";
};
