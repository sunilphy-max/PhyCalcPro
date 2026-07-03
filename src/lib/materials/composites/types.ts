export type CompositeConfig = {
  fiberVolumeFraction: number;
  fiberModulus: number;
  matrixModulus: number;
  fiberStrength: number;
  matrixStrength: number;
  fiberDensity: number;
  matrixDensity: number;
  fiberPoisson: number;
  matrixPoisson: number;
  /** Ply angle from load axis (degrees) for transformed stiffness / Tsai-Hill screening. */
  plyAngleDeg?: number;
  /** Applied in-plane stress for failure screening (MPa). */
  appliedStress?: number;
};

export type CompositeResult = {
  fiberVolumeFraction: number;
  matrixVolumeFraction: number;
  E_longitudinal: number;
  E_transverse: number;
  E_atPlyAngle: number;
  strength_longitudinal: number;
  strength_transverse: number;
  density: number;
  poissonRatio: number;
  stiffnessRatio: number;
  tsaiHillUtilization: number;
};
