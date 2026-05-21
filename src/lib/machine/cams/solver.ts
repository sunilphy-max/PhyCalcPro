import type { CamConfig, CamResult } from "./types";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function motionLawDisplacement(
  theta: number,
  riseAngle: number,
  lift: number,
  law: CamConfig["motionLaw"]
) {
  const t = clamp(theta / riseAngle, 0, 1);

  switch (law) {
    case "cycloidal":
      return lift * (t - Math.sin(2 * Math.PI * t) / (2 * Math.PI));
    case "polynomial":
      return lift * (3 * t * t - 2 * t * t * t);
    default:
      return (lift / 2) * (1 - Math.cos(Math.PI * t));
  }
}

function motionLawVelocity(
  theta: number,
  riseAngle: number,
  lift: number,
  law: CamConfig["motionLaw"]
) {
  const t = clamp(theta / riseAngle, 0, 1);

  switch (law) {
    case "cycloidal":
      return (lift / riseAngle) * (1 - Math.cos(2 * Math.PI * t));
    case "polynomial":
      return (lift / riseAngle) * (6 * t - 6 * t * t);
    default:
      return (lift / riseAngle) * (Math.PI / 2) * Math.sin(Math.PI * t);
  }
}

function motionLawAcceleration(
  theta: number,
  riseAngle: number,
  lift: number,
  law: CamConfig["motionLaw"]
) {
  const t = clamp(theta / riseAngle, 0, 1);

  switch (law) {
    case "cycloidal":
      return (lift / (riseAngle * riseAngle)) * (2 * Math.PI * Math.sin(2 * Math.PI * t));
    case "polynomial":
      return (lift / (riseAngle * riseAngle)) * (6 - 12 * t);
    default:
      return (lift / (riseAngle * riseAngle)) * (Math.PI * Math.PI / 2) * Math.cos(Math.PI * t);
  }
}

function pressureAngle(
  radius: number,
  baseCircle: number,
  displacementVelocity: number,
  omega: number,
  isRoller: boolean
) {
  const effectiveRadius = baseCircle + (isRoller ? radius : 0);
  return Math.abs(Math.atan2(displacementVelocity, effectiveRadius * omega));
}

export function solveCamDesign(config: CamConfig): CamResult {
  const riseAngle = clamp(360 - config.dwellAngle, 30, 360);
  const omega = (config.speed * 2 * Math.PI) / 60;
  const steps = 121;

  const displacement: number[] = [];
  const velocity: number[] = [];
  const acceleration: number[] = [];
  const angleDegrees: number[] = [];

  let peakVelocity = 0;
  let peakAcceleration = 0;
  let peakPressureAngle = 0;

  const isRoller = config.profileType === "roller_follower";

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const angle = t * 2 * Math.PI;
    const angleDeg = t * 360;
    const camTheta = angleDeg <= riseAngle ? angle : riseAngle * (Math.PI / 180);

    const disp =
      angleDeg <= riseAngle
        ? motionLawDisplacement(camTheta, riseAngle * (Math.PI / 180), config.lift, config.motionLaw)
        : config.lift;
    const vel =
      angleDeg <= riseAngle
        ? motionLawVelocity(camTheta, riseAngle * (Math.PI / 180), config.lift, config.motionLaw)
        : 0;
    const acc =
      angleDeg <= riseAngle
        ? motionLawAcceleration(camTheta, riseAngle * (Math.PI / 180), config.lift, config.motionLaw)
        : 0;

    const pressure = pressureAngle(config.radius, config.baseCircle, vel, omega, isRoller);

    displacement.push(disp);
    velocity.push(vel);
    acceleration.push(acc);
    angleDegrees.push(angleDeg);

    peakVelocity = Math.max(peakVelocity, Math.abs(vel));
    peakAcceleration = Math.max(peakAcceleration, Math.abs(acc));
    peakPressureAngle = Math.max(peakPressureAngle, pressure);
  }

  return {
    lift: config.lift,
    baseCircle: config.baseCircle,
    radius: config.radius,
    speed: config.speed,
    riseAngle,
    peakVelocity,
    peakAcceleration,
    peakPressureAngle,
    motionLaw: config.motionLaw,
    profileType: config.profileType,
    displacement,
    velocity,
    acceleration,
    angleDegrees,
  };
}
