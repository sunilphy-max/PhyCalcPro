/**
 * Engineering Decision Dashboard — status strip + advisor answers for bearing selection.
 * Deterministic screening (not LLM).
 */

import { A1_BY_RELIABILITY } from "./iso281Life";
import { lifeExponentFor, equivalentLoadFromRadialAxial } from "./equivalentLoad";
import type { BearingResult, BearingType } from "./types";

export type DashboardTone = "safe" | "warning" | "critical" | "neutral";

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  tone: DashboardTone;
};

export type DesignLever =
  | "larger_bearing"
  | "lower_speed"
  | "lower_load"
  | "better_lubrication"
  | "different_arrangement"
  | "none";

export type BearingDecisionDashboard = {
  metrics: DashboardMetric[];
  meetsTargetLife: boolean;
  meetsTargetLifeAnswer: string;
  governingLimitation: string;
  governingLimitationAnswer: string;
  designMarginAnswer: string;
  /** Smallest headroom among life SF, 1/(P/C), s₀, speed margin. */
  limitingMargin: number | null;
  bestLever: DesignLever;
  bestLeverAnswer: string;
  estimatedLifeGainFactor: number;
  requiredLifeHours: number;
  reliabilityPercent: number;
  staticUtilization: number;
};

function toneFromUtil(util: number, warnAt = 0.85, failAt = 1): DashboardTone {
  if (!(util >= 0) || !Number.isFinite(util)) return "neutral";
  if (util >= failAt) return "critical";
  if (util >= warnAt) return "warning";
  return "safe";
}

function toneFromSf(sf: number, warnAt = 1.2, failAt = 1): DashboardTone {
  if (!(sf > 0) || !Number.isFinite(sf)) return "neutral";
  if (sf < failAt) return "critical";
  if (sf < warnAt) return "warning";
  return "safe";
}

function lifeSf(result: BearingResult): number {
  if (result.lifeSafetyFactor != null && result.lifeSafetyFactor > 0) {
    return result.lifeSafetyFactor;
  }
  if (result.lifeUtilization > 0 && Number.isFinite(result.lifeUtilization)) {
    return 1 / result.lifeUtilization;
  }
  return 0;
}

/** Invert ISO 281 a1 table to nearest reliability %. */
export function reliabilityPercentFromA1(a1: number): number {
  let best = 90;
  let bestErr = Number.POSITIVE_INFINITY;
  for (const [pct, factor] of Object.entries(A1_BY_RELIABILITY)) {
    const err = Math.abs(factor - a1);
    if (err < bestErr) {
      bestErr = err;
      best = Number(pct);
    }
  }
  return best;
}

export function buildOperatingEnvelope(
  result: BearingResult,
  catalogFactors?: { X: number; Y: number; e: number }
): { frN: number[]; faN: number[]; allowPN: number } {
  const pExp = result.lifeExponent;
  const P = Math.max(result.equivalentLoad, 1e-9);
  const Lreq =
    result.lifeUtilization > 0
      ? result.lifeUtilization * result.modifiedLife
      : result.modifiedLife;
  const allowPN =
    Lreq > 0 && result.modifiedLife > 0
      ? P * Math.pow(result.modifiedLife / Lreq, 1 / pExp)
      : result.dynamicLoadRatingN;

  const type = result.bearingType;
  const coeffs =
    catalogFactors ??
    ({
      deep_groove: { X: 0.56, Y: 1.6, e: 0.3 },
      angular_contact: { X: 0.35, Y: 0.57, e: 1.14 },
      cylindrical_roller: { X: 1.0, Y: 0.0, e: Infinity },
      cylindrical_nj: { X: 1.0, Y: 0.35, e: 0.4 },
      cylindrical_nup: { X: 1.0, Y: 0.45, e: 0.4 },
      tapered_roller: { X: 0.4, Y: 1.0, e: 0.4 },
      spherical_roller: { X: 1.0, Y: 2.1, e: 0.65 },
      toroidal_roller: { X: 1.0, Y: 0.0, e: Infinity },
      needle_roller: { X: 1.0, Y: 0.0, e: Infinity },
      self_aligning_ball: { X: 1.0, Y: 2.3, e: 0.65 },
      thrust_ball: { X: 0.0, Y: 1.0, e: 0.0 },
      thrust_cylindrical_roller: { X: 0.0, Y: 1.0, e: 0.0 },
      thrust_spherical_roller: { X: 0.0, Y: 1.0, e: 0.0 },
    }[type] ?? { X: 0.56, Y: 1.6, e: 0.3 });

  const frN: number[] = [];
  const faN: number[] = [];

  if (type.startsWith("thrust_")) {
    for (let i = 0; i <= 20; i++) {
      frN.push((allowPN * i) / 20);
      faN.push(allowPN);
    }
    return { frN, faN, allowPN };
  }

  const e = coeffs.e;
  const X = coeffs.X;
  const Y = Math.max(coeffs.Y, 1e-9);
  const frRadial = allowPN;
  const steps = 24;

  for (let i = 0; i <= steps; i++) {
    if (!Number.isFinite(e) || e === Infinity) {
      frN.push(allowPN);
      faN.push(0);
      break;
    }
    frN.push(frRadial);
    faN.push((e * frRadial * i) / steps);
  }

  if (Number.isFinite(e) && Y > 0) {
    for (let i = 1; i <= steps; i++) {
      const fr = frRadial * (1 - i / steps);
      const fa = (allowPN - X * fr) / Y;
      if (fr <= 0 || fa < 0) continue;
      if (fa / fr <= e) continue;
      frN.push(fr);
      faN.push(fa);
    }
  }

  return { frN, faN, allowPN };
}

export function reliabilityLifeCurve(result: BearingResult): {
  reliabilityPercent: number[];
  lifeHours: number[];
} {
  const baseA1 = Math.max(result.a1, 1e-9);
  const baseLife = result.modifiedLife;
  const pcts = Object.keys(A1_BY_RELIABILITY)
    .map(Number)
    .sort((a, b) => a - b);
  return {
    reliabilityPercent: pcts,
    lifeHours: pcts.map((pct) => {
      const a1 = A1_BY_RELIABILITY[pct] ?? 1;
      return (baseLife * a1) / baseA1;
    }),
  };
}

function rankLevers(result: BearingResult): {
  lever: DesignLever;
  gain: number;
  answer: string;
} {
  const p = lifeExponentFor(result.bearingType);
  const kappa = result.modifiedLifeFactors.kappa;
  const hasLube = result.modifiedLifeFactors.nu1Cst > 0 || result.aIso !== 1;
  const faFr =
    Math.abs(result.radialLoad) > 1e-9
      ? Math.abs(result.axialLoad) / Math.abs(result.radialLoad)
      : result.axialLoad > 0
        ? Infinity
        : 0;

  const candidates: { lever: DesignLever; gain: number; answer: string }[] = [
    {
      lever: "larger_bearing",
      gain: Math.pow(1.1, p),
      answer: `Upsize catalog C by ~10% (next series / larger bore fit) → estimated Lnm ×${Math.pow(1.1, p).toFixed(2)} via (C/P)^p.`,
    },
    {
      lever: "lower_load",
      gain: Math.pow(1 / 0.9, p),
      answer: `Reduce equivalent load P by ~10% (duty, shock factor, or load share) → estimated Lnm ×${Math.pow(1 / 0.9, p).toFixed(2)}.`,
    },
    {
      lever: "lower_speed",
      gain: 1 / 0.9,
      answer: "Reduce speed by ~10% → life hours scale ≈ n_old/n_new (≈ ×1.11) at the same C/P.",
    },
  ];

  if (hasLube && kappa > 0 && kappa < 1) {
    const gain = Math.min(2.5, Math.max(1.15, 1 / Math.max(kappa, 0.2)));
    candidates.push({
      lever: "better_lubrication",
      gain,
      answer: `Raise viscosity ratio κ (now ${kappa.toFixed(2)}) toward ≥1 via higher VG / cooler oil / cleaner eC — often the largest Lnm gain when film is thin.`,
    });
  } else if (!hasLube) {
    candidates.push({
      lever: "better_lubrication",
      gain: 1.3,
      answer:
        "Enable full ISO 281 lubrication inputs (VG, temperature, cleanliness) — modified life aISO may be well below 1 under grease/contamination.",
    });
  }

  if (
    faFr > 0.35 &&
    (result.bearingType === "deep_groove" || result.arrangement === "single")
  ) {
    candidates.push({
      lever: "different_arrangement",
      gain: 1.25,
      answer:
        "High Fa/Fr — consider angular-contact or duplex O/X arrangement so axial capacity and stiffness match the duty (life and rigidity).",
    });
  }

  candidates.sort((a, b) => b.gain - a.gain);
  const best = candidates[0]!;
  if (result.designStatus === "safe" && lifeSf(result) >= 1.5 && best.gain < 1.2) {
    return {
      lever: "none",
      gain: 1,
      answer:
        "Margins look healthy — no urgent single lever. Prefer confirming OEM datasheet C/C₀/Pu and fits before changing the design.",
    };
  }
  return best;
}

export function buildBearingDecisionDashboard(result: BearingResult): BearingDecisionDashboard {
  const sf = lifeSf(result);
  const requiredLifeHours =
    result.lifeUtilization > 0 ? result.lifeUtilization * result.modifiedLife : 0;
  const reliabilityPercent = reliabilityPercentFromA1(result.a1);
  const staticUtilization =
    result.staticSafetyFactor > 0 ? 1 / result.staticSafetyFactor : Number.POSITIVE_INFINITY;

  const f = result.modifiedLifeFactors;
  const hasLube = f.nu1Cst > 0 || result.aIso !== 1;

  let lubeTone: DashboardTone = "neutral";
  let lubeValue = "Not assessed";
  let lubeDetail = "Enter lubricant VG / temperature for κ screening";
  if (hasLube && f.kappa > 0) {
    if (f.kappa >= 1) {
      lubeTone = "safe";
      lubeValue = "Suitable";
    } else if (f.kappa >= 0.5) {
      lubeTone = "warning";
      lubeValue = "Marginal";
    } else {
      lubeTone = "critical";
      lubeValue = "Insufficient";
    }
    lubeDetail = `κ = ${f.kappa.toFixed(2)}, eC = ${f.eC.toFixed(2)}, aISO = ${result.aIso.toFixed(2)}`;
  }

  const derate = result.temperatureDeratingFactor;
  let tempTone: DashboardTone = "neutral";
  let tempValue = "—";
  let tempDetail = "No derating applied";
  if (derate > 0 && derate < 1) {
    if (derate >= 0.95) {
      tempTone = "safe";
      tempValue = "Acceptable";
    } else if (derate >= 0.85) {
      tempTone = "warning";
      tempValue = "Derated";
    } else {
      tempTone = "critical";
      tempValue = "High derating";
    }
    tempDetail = `C derating factor ${(derate * 100).toFixed(0)}%`;
  } else if (derate >= 1) {
    tempTone = "safe";
    tempValue = "Acceptable";
    tempDetail = "No temperature derating on C";
  }
  if (result.thermalExpansion) {
    if (result.thermalExpansion.status === "insufficient") {
      tempTone = "critical";
      tempValue = "Float fail";
      tempDetail = "Thermal expansion float insufficient";
    } else if (result.thermalExpansion.status === "marginal" && tempTone === "safe") {
      tempTone = "warning";
      tempValue = "Float marginal";
    }
  }

  const speedTone =
    result.speedMargin == null
      ? ("neutral" as const)
      : result.speedMargin < 1
        ? ("critical" as const)
        : result.speedMargin < 1.25
          ? ("warning" as const)
          : ("safe" as const);

  const metrics: DashboardMetric[] = [
    {
      id: "life",
      label: "Bearing Life",
      value: `${Math.round(result.modifiedLife).toLocaleString()} h`,
      detail: requiredLifeHours > 0 ? `Target ${Math.round(requiredLifeHours).toLocaleString()} h Lnm` : "Lnm",
      tone: toneFromUtil(result.lifeUtilization),
    },
    {
      id: "dyn",
      label: "Dynamic Load Utilization",
      value: `${Math.round(result.dynamicUtilization * 100)}%`,
      detail: "P / C",
      tone: toneFromUtil(result.dynamicUtilization),
    },
    {
      id: "static",
      label: "Static Load Utilization",
      value: Number.isFinite(staticUtilization)
        ? `${Math.round(staticUtilization * 100)}%`
        : "—",
      detail: `s₀ = ${result.staticSafetyFactor.toFixed(2)}`,
      tone: toneFromSf(result.staticSafetyFactor),
    },
    {
      id: "reliability",
      label: "Reliability",
      value: `${reliabilityPercent}%`,
      detail: `a₁ = ${result.a1.toFixed(2)}`,
      tone:
        result.lifeUtilization > 1
          ? "critical"
          : result.lifeUtilization > 0.85
            ? "warning"
            : "safe",
    },
    {
      id: "sf",
      label: "Safety Factor",
      value: sf > 0 ? sf.toFixed(2) : "—",
      detail: "Lnm / L_req",
      tone: toneFromSf(sf),
    },
    {
      id: "speed",
      label: "Speed Limit",
      value:
        result.speedMargin == null
          ? "N/A"
          : result.speedMargin >= 1
            ? "Within Limit"
            : "Over Limit",
      detail:
        result.speedMargin != null ? `n_lim/n = ${result.speedMargin.toFixed(2)}` : undefined,
      tone: speedTone,
    },
    {
      id: "lube",
      label: "Lubrication",
      value: lubeValue,
      detail: lubeDetail,
      tone: lubeTone,
    },
    {
      id: "temp",
      label: "Temperature",
      value: tempValue,
      detail: tempDetail,
      tone: tempTone,
    },
  ];

  const meetsTargetLife = result.lifeUtilization <= 1;
  const meetsTargetLifeAnswer = meetsTargetLife
    ? `Yes — modified life Lnm ≈ ${Math.round(result.modifiedLife).toLocaleString()} h meets the target${
        requiredLifeHours > 0 ? ` (${Math.round(requiredLifeHours).toLocaleString()} h)` : ""
      } with life SF ≈ ${sf > 0 ? sf.toFixed(2) : "—"}.`
    : `No — Lnm ≈ ${Math.round(result.modifiedLife).toLocaleString()} h is below the required life${
        requiredLifeHours > 0 ? ` (${Math.round(requiredLifeHours).toLocaleString()} h)` : ""
      } (life utilization ${(result.lifeUtilization * 100).toFixed(0)}%).`;

  const governing = result.governingFailureMode || "All checks pass";
  const governingLimitationAnswer =
    governing === "All checks pass"
      ? "No single check is governing — life, load, static, and speed screens all pass."
      : `Governing limitation: ${governing}. Address this mode first before chasing secondary margins.`;

  const margins: number[] = [];
  if (sf > 0) margins.push(sf);
  if (result.dynamicUtilization > 0) margins.push(1 / result.dynamicUtilization);
  if (result.staticSafetyFactor > 0) margins.push(result.staticSafetyFactor);
  if (result.speedMargin != null && result.speedMargin > 0) margins.push(result.speedMargin);
  const limitingMargin = margins.length ? Math.min(...margins) : null;

  const designMarginAnswer =
    limitingMargin == null
      ? "Design margin could not be consolidated — check that loads, C, and life target are set."
      : `Smallest screening headroom ≈ ${limitingMargin.toFixed(2)}× (min of life SF, 1/(P/C), s₀, and speed margin where available).`;

  const ranked = rankLevers(result);

  return {
    metrics,
    meetsTargetLife,
    meetsTargetLifeAnswer,
    governingLimitation: governing,
    governingLimitationAnswer,
    designMarginAnswer,
    limitingMargin,
    bestLever: ranked.lever,
    bestLeverAnswer: ranked.answer,
    estimatedLifeGainFactor: ranked.gain,
    requiredLifeHours,
    reliabilityPercent,
    staticUtilization,
  };
}

/** Duty-point check helper for envelope plots. */
export function dutyPointOnEnvelope(
  Fr: number,
  Fa: number,
  type: BearingType,
  allowPN: number,
  catalogFactors?: { X: number; Y: number; e: number }
): boolean {
  const P = equivalentLoadFromRadialAxial(Fr, Fa, type, catalogFactors);
  return P <= allowPN * 1.001;
}
