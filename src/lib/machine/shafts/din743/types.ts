/**
 * DIN 743 worksheet types — multi-station EU shaft load-capacity check.
 */

import type { Din743HeatTreatment, Din743NotchKind, Din743SurfaceProcess } from "@/data/catalogs/din743/types";

/** Mean-stress case per DIN 743-1. */
export type Din743MeanStressCase = 1 | 2;

export type Din743WorksheetOptions = {
  enabled?: boolean;
  /** Catalog material id; auto-matched from Su if omitted */
  materialId?: string;
  heatTreatmentOverride?: Din743HeatTreatment;
  /** Average roughness Rz (µm) */
  Rz_um?: number;
  surfaceProcess?: Din743SurfaceProcess;
  meanStressCase?: Din743MeanStressCase;
  /** Minimum required fatigue safety (default 1.2 per DIN 743-1) */
  SminFatigue?: number;
  /** Minimum required static safety (default 1.2) */
  SminStatic?: number;
  /** Manual γF override (else computed) */
  gammaFOverride?: number;
  /** Manual Kσ / Kτ overrides (else from β, KF, KV, K2) */
  K_sigmaOverride?: number;
  K_tauOverride?: number;
};

export type Din743StationInput = {
  id: string;
  label: string;
  position_m: number;
  diameter_m: number;
  notchKind: Din743NotchKind;
  largerDiameter_m?: number;
  filletRadius_m?: number;
  grooveDepth_m?: number;
  grooveWidth_m?: number;
  /** Nominal bending stress amplitude (Pa) — rotating bending typically |σb| */
  sigmaBendingA_Pa: number;
  /** Nominal bending mean (Pa) — usually ~0 for pure rotating bending */
  sigmaBendingM_Pa: number;
  /** Axial stress amplitude (Pa) */
  sigmaAxialA_Pa?: number;
  /** Axial mean (Pa) */
  sigmaAxialM_Pa?: number;
  /** Torsion amplitude (Pa) */
  tauA_Pa: number;
  /** Torsion mean (Pa) */
  tauM_Pa: number;
  /** Peak bending for static check (Pa) */
  sigmaBendingMax_Pa: number;
  /** Peak torsion for static check (Pa) */
  tauMax_Pa: number;
  /** Peak axial for static check (Pa) */
  sigmaAxialMax_Pa?: number;
  customAlphaBending?: number;
  customAlphaTorsion?: number;
};

export type Din743StationResult = {
  id: string;
  label: string;
  position_m: number;
  diameter_m: number;
  notchKind: Din743NotchKind;
  alphaBending: number;
  alphaTorsion: number;
  betaBending: number;
  betaTorsion: number;
  K2_bending: number;
  K2_torsion: number;
  KFsigma: number;
  KFtau: number;
  KV: number;
  K_sigma: number;
  K_tau: number;
  gammaF: number;
  /** Notched fatigue limits σbWK, τtWK (Pa) */
  sigmaBWK_Pa: number;
  tauTWK_Pa: number;
  /** Allowable amplitudes after mean-stress correction */
  sigmaBADK_Pa: number;
  tauTADK_Pa: number;
  /** Static allowables */
  sigmaFzulB_Pa: number;
  tauFzul_Pa: number;
  fatigueSafetyFactor: number;
  staticSafetyFactor: number;
  overloadSafetyFactor: number | null;
  fatigueStatus: "safe" | "warning" | "critical";
  staticStatus: "safe" | "warning" | "critical";
  notchSource: string;
  meanStressSensitivity_psiSigma: number;
  meanStressSensitivity_psiTau: number;
};

export type Din743WorksheetResult = {
  standard: "DIN 743";
  parts: ("DIN 743-1" | "DIN 743-2" | "DIN 743-3")[];
  materialId: string;
  materialDesignation: string;
  heatTreatment: Din743HeatTreatment;
  sigmaB_Pa: number;
  sigmaS_Pa: number;
  K1_strength: number;
  K1_yield: number;
  Rz_um: number;
  KV: number;
  meanStressCase: Din743MeanStressCase;
  SminFatigue: number;
  SminStatic: number;
  stations: Din743StationResult[];
  governingStationId: string;
  governingFatigueSF: number;
  governingStaticSF: number;
  governingOverloadSF: number | null;
  designStatus: "safe" | "warning" | "critical";
  /** Auto factors at governing station for UI / legacy fields */
  autoK_sigma: number;
  autoK_tau: number;
  autoGamma_F: number;
  notes: string[];
};
