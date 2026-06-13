export type SpringWireType =
  | "music"
  | "hard-drawn"
  | "oil-tempered"
  | "chrome-vanadium"
  | "chrome-silicon"
  | "custom";

export type CompressionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  freeLength: number;
  /** Shear modulus G (Pa). Steel spring wire ≈ 79–81.5 GPa. */
  modulus: number;
  deflection: number;
  /** Wire ultimate tensile strength Rm (Pa); used when wireType is "custom" */
  ultimateStrength: number;
  /** Standard wire grade; derives Rm from the Shigley A/d^m size-effect fit */
  wireType?: SpringWireType;
  /** Wire density (kg/m³) for the surge frequency; default steel */
  density?: number;
};

export type CompressionSpringResult = {
  springRate: number;
  solidHeight: number;
  maxLoad: number;
  shearStress: number;
  /** EN 13906-1 static allowable τ_zul = 0.56·Rm */
  allowableShearStress: number;
  /** Wire Rm used (after any size-effect fit) */
  wireUltimateStrength: number;
  safetyFactor: number;
  naturalFrequency: number;
  springIndex: number;
  wahlFactor: number;
  /** L0/D slenderness for the EN 13906 buckling screen */
  slenderness: number;
  /** True when L0/D exceeds the buckle-proof limit for guided ends */
  bucklingRisk: boolean;
};
