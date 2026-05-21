export type RotationConfig = {
  mass: number;
  radius: number;
  speedRPM: number;
  power: number;
};

export type RotationResult = {
  inertia: number;
  omega: number;
  kineticEnergy: number;
  centripetalAcceleration: number;
  centripetalForce: number;
  torque: number;
};
