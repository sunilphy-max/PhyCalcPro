/**
 * DIN 743-1 load-capacity worksheet (fatigue + static + overload screening).
 */

import {
  findDin743Material,
  matchDin743MaterialFromUltimate,
  type Din743MaterialEntry,
} from "@/data/catalogs/din743/materials";
import {
  rzFromSurfaceFinish,
  surfaceConditioningKV,
  surfaceRoughnessFactorKF,
} from "@/data/catalogs/din743/surface";
import { resolveDin743NotchFactors } from "./notchFactors";
import { geometricalSizeFactorK2, staticSupportFactorK2F } from "./sizeFactors";
import { din743StrengthAtDiameter } from "./strength";
import type {
  Din743StationInput,
  Din743StationResult,
  Din743WorksheetOptions,
  Din743WorksheetResult,
} from "./types";

function statusFromSf(sf: number, smin: number): "safe" | "warning" | "critical" {
  if (sf >= smin) return "safe";
  if (sf >= smin * 0.85) return "warning";
  return "critical";
}

/**
 * Overall influence factors:
 *   Kσ = (βσ / K2 + 1/KFσ − 1) / KV
 *   Kτ = (βτ / K2 + 1/KFτ − 1) / KV
 */
export function overallInfluenceFactor(params: {
  beta: number;
  K2: number;
  KF: number;
  KV: number;
}): number {
  const { beta, K2, KF, KV } = params;
  const raw = beta / Math.max(K2, 1e-9) + 1 / Math.max(KF, 1e-9) - 1;
  return Math.max(raw / Math.max(KV, 1e-9), 1e-6);
}

/** Mean-stress sensitivity ψ (DIN 743-1). */
export function meanStressSensitivity(params: {
  sigmaB_Pa: number;
  K1: number;
  sigmaW_Pa: number;
}): number {
  const denom = 2 * params.K1 * Math.max(params.sigmaW_Pa, 1) - params.sigmaB_Pa;
  if (denom <= 0) return 0.3;
  return Math.min(Math.max(params.sigmaB_Pa / denom, 0), 1);
}

function allowableAmplitude(params: {
  WK: number;
  mean: number;
  amp: number;
  psi: number;
  meanCase: 1 | 2;
}): number {
  const { WK, mean, amp, psi, meanCase } = params;
  if (meanCase === 2 && amp > 1e-6) {
    return WK / (1 + psi * (Math.abs(mean) / amp));
  }
  // Case 1: constant mean
  return Math.max(WK - psi * Math.abs(mean), 0.01 * WK);
}

function gammaFFromNotch(alphaB: number, alphaT: number, override?: number): number {
  if (override != null && override > 0) return override;
  const a = Math.max(alphaB, alphaT, 1);
  if (a <= 1.01) return 1;
  return Math.min(1.3, 1 + 0.12 * (a - 1));
}

export function evaluateDin743Station(
  station: Din743StationInput,
  material: Din743MaterialEntry,
  options: Din743WorksheetOptions
): Din743StationResult {
  const d_mm = station.diameter_m * 1000;
  const strength = din743StrengthAtDiameter(material, d_mm);
  const Rz = options.Rz_um ?? 6.3;
  const { KFsigma, KFtau } = surfaceRoughnessFactorKF({
    Rz_um: Rz,
    sigmaB_MPa: strength.sigmaB_Pa / 1e6,
  });
  const KV = surfaceConditioningKV(options.surfaceProcess ?? "none");

  const notch = resolveDin743NotchFactors({
    kind: station.notchKind,
    d_m: station.diameter_m,
    D_m: station.largerDiameter_m,
    r_m: station.filletRadius_m,
    grooveDepth_m: station.grooveDepth_m,
    grooveWidth_m: station.grooveWidth_m,
    sigmaB_MPa: strength.sigmaB_Pa / 1e6,
    customAlphaBending: station.customAlphaBending,
    customAlphaTorsion: station.customAlphaTorsion,
  });

  const K2b = geometricalSizeFactorK2(d_mm, "bending");
  const K2t = geometricalSizeFactorK2(d_mm, "torsion");

  let K_sigma = overallInfluenceFactor({
    beta: notch.betaBending,
    K2: K2b,
    KF: KFsigma,
    KV,
  });
  let K_tau = overallInfluenceFactor({
    beta: notch.betaTorsion,
    K2: K2t,
    KF: KFtau,
    KV,
  });
  if (options.K_sigmaOverride != null) K_sigma = options.K_sigmaOverride;
  if (options.K_tauOverride != null) K_tau = options.K_tauOverride;

  const gammaF = gammaFFromNotch(notch.alphaBending, notch.alphaTorsion, options.gammaFOverride);

  const sigmaBWK = strength.sigmaBW_Pa / K_sigma;
  const tauTWK = strength.tauTW_Pa / K_tau;

  const psiSigma = meanStressSensitivity({
    sigmaB_Pa: strength.sigmaB_Pa,
    K1: strength.K1_strength,
    sigmaW_Pa: strength.sigmaBW_Pa,
  });
  const psiTau = meanStressSensitivity({
    sigmaB_Pa: strength.sigmaB_Pa,
    K1: strength.K1_strength,
    sigmaW_Pa: strength.tauTW_Pa * Math.sqrt(3),
  });

  const meanCase = options.meanStressCase ?? 1;
  const sigmaBADK = allowableAmplitude({
    WK: sigmaBWK,
    mean: station.sigmaBendingM_Pa + (station.sigmaAxialM_Pa ?? 0),
    amp: Math.hypot(station.sigmaBendingA_Pa, station.sigmaAxialA_Pa ?? 0),
    psi: psiSigma,
    meanCase,
  });
  const tauTADK = allowableAmplitude({
    WK: tauTWK,
    mean: station.tauM_Pa,
    amp: station.tauA_Pa,
    psi: psiTau,
    meanCase,
  });

  const sigmaA_eq = Math.hypot(station.sigmaBendingA_Pa, station.sigmaAxialA_Pa ?? 0);
  const tauA = Math.abs(station.tauA_Pa);
  const fatigueSF =
    1 /
    Math.sqrt(
      Math.pow(sigmaA_eq / Math.max(sigmaBADK, 1), 2) + Math.pow(tauA / Math.max(tauTADK, 1), 2)
    );

  const K2Fb = staticSupportFactorK2F(d_mm, "bending");
  const K2Ft = staticSupportFactorK2F(d_mm, "torsion");
  const sigmaFzulB = strength.K1_yield * K2Fb * gammaF * strength.sigmaS_Pa;
  const tauFzul = (strength.K1_yield * K2Ft * gammaF * strength.sigmaS_Pa) / Math.sqrt(3);

  const sigmaMax = Math.hypot(station.sigmaBendingMax_Pa, station.sigmaAxialMax_Pa ?? 0);
  const tauMax = Math.abs(station.tauMax_Pa);
  const staticSF =
    1 /
    Math.sqrt(
      Math.pow(sigmaMax / Math.max(sigmaFzulB, 1), 2) + Math.pow(tauMax / Math.max(tauFzul, 1), 2)
    );

  // Overload / crack initiation for high-strength notched sections (α path)
  let overloadSF: number | null = null;
  if (strength.sigmaB_Pa >= 1300e6 || notch.alphaBending > 1.5) {
    const num = strength.sigmaB_Pa;
    const den = Math.hypot(
      notch.alphaBending * sigmaMax,
      notch.alphaTorsion * tauMax * Math.sqrt(3)
    );
    overloadSF = num / Math.max(den, 1);
  }

  const SminF = options.SminFatigue ?? 1.2;
  const SminS = options.SminStatic ?? 1.2;

  return {
    id: station.id,
    label: station.label,
    position_m: station.position_m,
    diameter_m: station.diameter_m,
    notchKind: station.notchKind,
    alphaBending: notch.alphaBending,
    alphaTorsion: notch.alphaTorsion,
    betaBending: notch.betaBending,
    betaTorsion: notch.betaTorsion,
    K2_bending: K2b,
    K2_torsion: K2t,
    KFsigma,
    KFtau,
    KV,
    K_sigma,
    K_tau,
    gammaF,
    sigmaBWK_Pa: sigmaBWK,
    tauTWK_Pa: tauTWK,
    sigmaBADK_Pa: sigmaBADK,
    tauTADK_Pa: tauTADK,
    sigmaFzulB_Pa: sigmaFzulB,
    tauFzul_Pa: tauFzul,
    fatigueSafetyFactor: fatigueSF,
    staticSafetyFactor: staticSF,
    overloadSafetyFactor: overloadSF,
    fatigueStatus: statusFromSf(fatigueSF, SminF),
    staticStatus: statusFromSf(staticSF, SminS),
    notchSource: notch.source,
    meanStressSensitivity_psiSigma: psiSigma,
    meanStressSensitivity_psiTau: psiTau,
  };
}

export function runDin743Worksheet(params: {
  stations: Din743StationInput[];
  ultimateStrength_Pa: number;
  options?: Din743WorksheetOptions;
  surfaceFinish?: string;
}): Din743WorksheetResult {
  const options = params.options ?? {};
  const material: Din743MaterialEntry =
    (options.materialId ? findDin743Material(options.materialId) : undefined) ??
    matchDin743MaterialFromUltimate(params.ultimateStrength_Pa);

  const materialResolved: Din743MaterialEntry = options.heatTreatmentOverride
    ? { ...material, heatTreatment: options.heatTreatmentOverride }
    : material;

  const Rz =
    options.Rz_um ??
    rzFromSurfaceFinish((params.surfaceFinish as never) ?? "machined");

  const opts: Din743WorksheetOptions = {
    ...options,
    Rz_um: Rz,
    surfaceProcess: options.surfaceProcess ?? "none",
    meanStressCase: options.meanStressCase ?? 1,
    SminFatigue: options.SminFatigue ?? 1.2,
    SminStatic: options.SminStatic ?? 1.2,
  };

  const stations =
    params.stations.length > 0
      ? params.stations.map((s) => evaluateDin743Station(s, materialResolved, opts))
      : [];

  const refStrength = din743StrengthAtDiameter(
    materialResolved,
    stations[0] ? stations[0].diameter_m * 1000 : 16
  );

  let governing = stations[0];
  for (const s of stations) {
    if (!governing || s.fatigueSafetyFactor < governing.fatigueSafetyFactor) governing = s;
  }

  const govFatigue = governing?.fatigueSafetyFactor ?? Number.POSITIVE_INFINITY;
  const govStatic = governing
    ? Math.min(...stations.map((s) => s.staticSafetyFactor))
    : Number.POSITIVE_INFINITY;
  const govOverload = stations.reduce<number | null>((best, s) => {
    if (s.overloadSafetyFactor == null) return best;
    if (best == null) return s.overloadSafetyFactor;
    return Math.min(best, s.overloadSafetyFactor);
  }, null);

  const SminF = opts.SminFatigue ?? 1.2;
  const SminS = opts.SminStatic ?? 1.2;
  let designStatus: Din743WorksheetResult["designStatus"] = "safe";
  if (govFatigue < SminF * 0.85 || govStatic < SminS * 0.85) designStatus = "critical";
  else if (govFatigue < SminF || govStatic < SminS) designStatus = "warning";
  if (govOverload != null && govOverload < 1.1) designStatus = "critical";

  const notes: string[] = [
    "DIN 743 Method-C style screening using Parts 1–3 formulas and catalog tables.",
    "Verify critical shafts against the licensed DIN 743 text and measured material data before release.",
  ];
  if (stations.length === 0) notes.push("No DIN stations — add loads/features or solve FEM first.");

  return {
    standard: "DIN 743",
    parts: ["DIN 743-1", "DIN 743-2", "DIN 743-3"],
    materialId: materialResolved.id,
    materialDesignation: materialResolved.designation,
    heatTreatment: materialResolved.heatTreatment,
    sigmaB_Pa: refStrength.sigmaB_Pa,
    sigmaS_Pa: refStrength.sigmaS_Pa,
    K1_strength: refStrength.K1_strength,
    K1_yield: refStrength.K1_yield,
    Rz_um: Rz,
    KV: surfaceConditioningKV(opts.surfaceProcess ?? "none"),
    meanStressCase: opts.meanStressCase ?? 1,
    SminFatigue: SminF,
    SminStatic: SminS,
    stations,
    governingStationId: governing?.id ?? "n/a",
    governingFatigueSF: Number.isFinite(govFatigue) ? govFatigue : 0,
    governingStaticSF: Number.isFinite(govStatic) ? govStatic : 0,
    governingOverloadSF: govOverload,
    designStatus,
    autoK_sigma: governing?.K_sigma ?? 1,
    autoK_tau: governing?.K_tau ?? 1,
    autoGamma_F: governing?.gammaF ?? 1,
    notes,
  };
}
