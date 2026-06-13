export type SurfaceFinish = "ground" | "machined" | "hot-rolled" | "as-forged";

export type FatigueLoadType = "bending" | "axial" | "torsion";

export type FatigueConfig = {
  alternatingStress: number;
  meanStress: number;
  ultimateStrength: number;
  /** Unmodified specimen endurance limit Se' (before Marin factors) */
  enduranceLimit: number;
  meanStressMethod?: "goodman" | "gerber" | "morrow";
  /** Marin surface-condition factor input (defaults to "machined") */
  surfaceFinish?: SurfaceFinish;
  /** Marin load factor input (defaults to "bending") */
  loadType?: FatigueLoadType;
  /** Characteristic section diameter in metres for the Marin size factor */
  characteristicDiameter?: number;
};

export type FatigueResult = {
  allowableStress: number;
  /** Endurance limit after Marin modification: Se = ka·kb·kc·Se' */
  correctedEndurance: number;
  predictedCycles: number;
  infiniteLife: boolean;
  safetyFactor: number;
  surfaceFactor: number;
  sizeFactor: number;
  loadFactor: number;
  designStatus: "safe" | "warning" | "critical";
};
