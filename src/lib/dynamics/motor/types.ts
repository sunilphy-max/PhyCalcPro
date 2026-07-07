export type MotorServiceClass = "continuous" | "intermittent" | "short_time";

export type MotorConfig = {
  /** Required mechanical shaft power (W). */
  power: number;
  poles: number;
  lineFrequencyHz: 50 | 60;
  serviceClass: MotorServiceClass;
  /** Starting torque as multiple of rated torque (typical 1.5–2.5 for induction). */
  startingTorqueFactor: number;
  /** Motor efficiency at rated load (0–1). */
  efficiency: number;
  /** Electrical power factor at rated load (0–1). */
  powerFactor: number;
};

export type MotorResult = {
  synchronousSpeedRpm: number;
  ratedSpeedRpm: number;
  slipPercent: number;
  ratedTorque: number;
  startingTorque: number;
  electricalPower: number;
  apparentPower: number;
  frameClass: string;
  nemaFrame: string;
  iecFrame: string;
  /** Suggested belt-drive service factor for downstream v-belt sizing. */
  serviceFactor: number;
  thermalMarginOk: boolean;
  isSafe: boolean;
  designStatus: "safe" | "warning" | "critical";
  governingFailureMode: string;
};
