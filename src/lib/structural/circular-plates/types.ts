export type CircularPlateConfig = {
  radius: number;
  thickness: number;
  pressure: number;
  modulus: number;
  poisson: number;
  boundary: "simply_supported" | "clamped";
  /** Radial mesh segments for axisymmetric FDM (4–64). */
  meshSegments?: number;
  annularInnerRadius?: number;
};

export type CircularPlateResult = {
  maxDeflection: number;
  maxStress: number;
  rigidity: number;
  roarkMaxDeflection: number;
  roarkMaxStress: number;
  meshSegments: number;
  femDeflectionErrorPercent: number;
};
