export type KeysSplinesConfig = { torque: number; shaftDiameter: number; keyWidth: number; keyHeight: number; keyLength: number; yieldStress: number; keyType: "parallel" | "spline"; splineTeeth?: number; };
export type KeysSplinesResult = { shearStress: number; bearingStress: number; shearSafety: number; bearingSafety: number; capacityTorque: number; };
