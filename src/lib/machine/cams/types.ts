export type CamProfileType = "flat_follower" | "roller_follower";
export type MotionLaw = "simple_harmonic" | "cycloidal" | "polynomial";

export type CamConfig = {
  lift: number;
  baseCircle: number;
  radius: number;
  speed: number;
  dwellAngle: number;
  motionLaw: MotionLaw;
  profileType: CamProfileType;
};

export type CamResult = {
  lift: number;
  baseCircle: number;
  radius: number;
  speed: number;
  riseAngle: number;
  peakVelocity: number;
  peakAcceleration: number;
  peakPressureAngle: number;
  motionLaw: MotionLaw;
  profileType: CamProfileType;
  displacement: number[];
  velocity: number[];
  acceleration: number[];
  angleDegrees: number[];
};
