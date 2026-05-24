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
};

export type CompositeResult = {
  fiberVolumeFraction: number;
  matrixVolumeFraction: number;
  E_longitudinal: number;
  E_transverse: number;
  strength_longitudinal: number;
  strength_transverse: number;
  density: number;
  poissonRatio: number;
  stiffnessRatio: number;
};
