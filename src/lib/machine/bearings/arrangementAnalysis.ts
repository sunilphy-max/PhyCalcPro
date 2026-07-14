/**
 * First-class bearing arrangement analysis (O / X / T duplex).
 *
 * Bundles screening for:
 * - preload
 * - axial / radial / moment stiffness
 * - axial displacement δa = Fa / Ka
 * - thermal growth → preload shift
 * - rigidity comparison across O / X / T
 *
 * Screening-grade (MITCalc / SKF catalogue practice) — not Hertzian OEM tables.
 */

import type { BearingArrangement, BearingPreloadClass } from "./types";
import {
  calculateDuplexStiffness,
  type DuplexPreloadClass,
  type DuplexStiffnessInput,
  type DuplexStiffnessResult,
} from "./duplexStiffness";

export type ArrangementRigidityRow = {
  arrangement: Exclude<BearingArrangement, "single">;
  arrangementLabel: string;
  axialStiffnessNPerUm: number;
  radialStiffnessNPerUm: number;
  momentStiffnessNmPerMrad: number;
  /** δa under the same external Fa (µm). */
  axialDisplacementUm: number;
  /** Moment stiffness relative to O arrangement (1 = O). */
  momentStiffnessRatioVsO: number;
  isSelected: boolean;
};

export type ArrangementAxialDisplacement = {
  /** Screening δa = |Fa_external| / Ka (µm). */
  underExternalFaUm: number;
  /** Screening δa using preload-augmented Fa (µm). */
  underEffectiveFaUm: number;
  externalFaN: number;
  effectiveFaN: number;
  status: "ok" | "warning" | "critical";
  note: string;
};

export type ArrangementThermalEffect = {
  deltaTempK: number;
  /** Pair / support span used for differential growth (mm). */
  spanMm: number;
  /** Relative axial growth |Δα|·L·ΔT (µm). */
  thermalGrowthUm: number;
  /** Approximate preload change Ka · δ_thermal (N). Positive = increase. */
  thermalPreloadChangeN: number;
  /** Preload after thermal shift (N), floored at 0. */
  preloadAfterThermalN: number;
  note: string;
};

export type ArrangementAnalysis = {
  arrangement: Exclude<BearingArrangement, "single">;
  arrangementLabel: string;
  preloadForceN: number;
  preloadClass: BearingPreloadClass;
  axialStiffnessNPerUm: number;
  radialStiffnessNPerUm: number;
  momentStiffnessNmPerMrad: number;
  axialDisplacement: ArrangementAxialDisplacement;
  thermal: ArrangementThermalEffect | null;
  rigidityComparison: ArrangementRigidityRow[];
  comparisonNote: string;
  status: "ok" | "warning" | "critical";
  note: string;
};

export type ArrangementAnalysisInput = DuplexStiffnessInput & {
  arrangement: Exclude<BearingArrangement, "single">;
  /** External axial load on the pair (N). */
  externalAxialLoadN: number;
  /** Effective Fa used for life (external + preload share). */
  effectiveAxialLoadN?: number;
  operatingTempC?: number;
  ambientTempC?: number;
  /** Pair spacing / bearing span for thermal growth (mm). */
  spanMm?: number;
  alphaShaftPerK?: number;
  alphaHousingPerK?: number;
};

const STEEL_ALPHA = 12e-6;
const CAST_IRON_ALPHA = 10.5e-6;

/** Soft limits for screening axial displacement (µm). */
const DISPLACEMENT_WARN_UM = 25;
const DISPLACEMENT_CRIT_UM = 60;

function displacementStatus(um: number): ArrangementAxialDisplacement["status"] {
  if (um >= DISPLACEMENT_CRIT_UM) return "critical";
  if (um >= DISPLACEMENT_WARN_UM) return "warning";
  return "ok";
}

function displacementNote(um: number, status: ArrangementAxialDisplacement["status"]): string {
  if (status === "critical") {
    return `Axial displacement ≈ ${um.toFixed(1)} µm under Fa — excessive for precision spindles; increase preload class, select higher-C pair, or switch to O arrangement.`;
  }
  if (status === "warning") {
    return `Axial displacement ≈ ${um.toFixed(1)} µm — verify application accuracy; consider medium preload or larger contact angle.`;
  }
  return `Axial displacement ≈ ${um.toFixed(1)} µm under external Fa (screening δa = Fa/Ka).`;
}

export function calculateAxialDisplacementUm(
  axialLoadN: number,
  axialStiffnessNPerUm: number
): number {
  const ka = Math.max(axialStiffnessNPerUm, 1e-9);
  return Math.abs(axialLoadN) / ka;
}

/**
 * Differential thermal growth of shaft vs housing across duplex pair span
 * → approximate preload change via Ka.
 */
export function estimateDuplexThermalEffect(input: {
  axialStiffnessNPerUm: number;
  preloadForceN: number;
  operatingTempC: number;
  ambientTempC?: number;
  spanMm: number;
  alphaShaftPerK?: number;
  alphaHousingPerK?: number;
}): ArrangementThermalEffect {
  const ambient = input.ambientTempC ?? 20;
  const deltaTempK = input.operatingTempC - ambient;
  const alphaShaft = input.alphaShaftPerK ?? STEEL_ALPHA;
  const alphaHousing = input.alphaHousingPerK ?? CAST_IRON_ALPHA;
  const L_m = Math.max(input.spanMm, 0) / 1000;
  // Relative approach of rings (µm); sign omitted — magnitude for screening.
  const thermalGrowthUm = Math.abs((alphaShaft - alphaHousing) * L_m * deltaTempK) * 1e6;
  // Positive ΔT with α_shaft > α_housing tends to increase O-arrangement preload.
  const signedGrowthUm =
    (alphaShaft - alphaHousing) * L_m * deltaTempK * 1e6;
  const thermalPreloadChangeN = input.axialStiffnessNPerUm * signedGrowthUm;
  const preloadAfterThermalN = Math.max(0, input.preloadForceN + thermalPreloadChangeN);

  const note =
    Math.abs(deltaTempK) < 1
      ? "Negligible ΔT — thermal preload shift not significant."
      : Math.abs(thermalPreloadChangeN) < 0.05 * Math.max(input.preloadForceN, 1)
        ? "Thermal preload shift is small relative to selected preload class."
        : thermalPreloadChangeN > 0
          ? "Warm-up increases preload (shaft grows more than housing) — verify heavy-preload heat generation."
          : "Warm-up reduces preload — recheck stiffness and clearance at operating temperature.";

  return {
    deltaTempK,
    spanMm: input.spanMm,
    thermalGrowthUm,
    thermalPreloadChangeN,
    preloadAfterThermalN,
    note,
  };
}

function buildRigidityComparison(
  base: Omit<DuplexStiffnessInput, "arrangement">,
  selected: Exclude<BearingArrangement, "single">,
  externalFaN: number
): ArrangementRigidityRow[] {
  const arrangements: Exclude<BearingArrangement, "single">[] = [
    "back_to_back",
    "face_to_face",
    "tandem",
  ];
  const results = arrangements.map((arrangement) =>
    calculateDuplexStiffness({ ...base, arrangement })
  );
  const oKm = results[0]!.momentStiffnessNmPerMrad;

  return arrangements.map((arrangement, i) => {
    const r = results[i]!;
    return {
      arrangement,
      arrangementLabel: r.arrangementLabel,
      axialStiffnessNPerUm: r.axialStiffnessNPerUm,
      radialStiffnessNPerUm: r.radialStiffnessNPerUm,
      momentStiffnessNmPerMrad: r.momentStiffnessNmPerMrad,
      axialDisplacementUm: calculateAxialDisplacementUm(externalFaN, r.axialStiffnessNPerUm),
      momentStiffnessRatioVsO: r.momentStiffnessNmPerMrad / Math.max(oKm, 1e-9),
      isSelected: arrangement === selected,
    };
  });
}

/**
 * Full duplex arrangement analysis: preload · stiffness · δa · thermal · rigidity compare.
 */
export function calculateArrangementAnalysis(
  input: ArrangementAnalysisInput
): ArrangementAnalysis {
  const stiffnessInput: DuplexStiffnessInput = {
    arrangement: input.arrangement,
    dynamicRatingN: input.dynamicRatingN,
    meanDiameterMm: input.meanDiameterMm,
    contactAngleDeg: input.contactAngleDeg,
    preloadClass: input.preloadClass,
    preloadForceN: input.preloadForceN,
    bearingType: input.bearingType,
  };

  const duplex: DuplexStiffnessResult = calculateDuplexStiffness(stiffnessInput);
  const externalFaN = Math.abs(input.externalAxialLoadN);
  const effectiveFaN = Math.abs(input.effectiveAxialLoadN ?? externalFaN);
  const underExternalFaUm = calculateAxialDisplacementUm(
    externalFaN,
    duplex.axialStiffnessNPerUm
  );
  const underEffectiveFaUm = calculateAxialDisplacementUm(
    effectiveFaN,
    duplex.axialStiffnessNPerUm
  );
  const dispStatus = displacementStatus(underExternalFaUm);

  const axialDisplacement: ArrangementAxialDisplacement = {
    underExternalFaUm,
    underEffectiveFaUm,
    externalFaN,
    effectiveFaN,
    status: dispStatus,
    note: displacementNote(underExternalFaUm, dispStatus),
  };

  const defaultSpanMm = Math.max(input.meanDiameterMm * 0.35, 20);
  const spanMm = input.spanMm != null && input.spanMm > 0 ? input.spanMm : defaultSpanMm;
  const thermal =
    input.operatingTempC != null
      ? estimateDuplexThermalEffect({
          axialStiffnessNPerUm: duplex.axialStiffnessNPerUm,
          preloadForceN: duplex.preloadForceN,
          operatingTempC: input.operatingTempC,
          ambientTempC: input.ambientTempC,
          spanMm,
          alphaShaftPerK: input.alphaShaftPerK,
          alphaHousingPerK: input.alphaHousingPerK,
        })
      : null;

  const rigidityComparison = buildRigidityComparison(
    {
      dynamicRatingN: input.dynamicRatingN,
      meanDiameterMm: input.meanDiameterMm,
      contactAngleDeg: input.contactAngleDeg,
      preloadClass: (input.preloadClass ?? "none") as DuplexPreloadClass,
      preloadForceN: input.preloadForceN,
      bearingType: input.bearingType,
    },
    input.arrangement,
    externalFaN
  );

  let status: ArrangementAnalysis["status"] = "ok";
  if (dispStatus === "critical") status = "critical";
  else if (dispStatus === "warning") status = "warning";
  else if (
    thermal &&
    duplex.preloadForceN > 0 &&
    Math.abs(thermal.thermalPreloadChangeN) > 0.4 * duplex.preloadForceN
  ) {
    status = "warning";
  }

  const noteParts = [
    duplex.comparisonNote,
    axialDisplacement.note,
    thermal?.note,
  ].filter(Boolean);

  return {
    arrangement: input.arrangement,
    arrangementLabel: duplex.arrangementLabel,
    preloadForceN: duplex.preloadForceN,
    preloadClass: duplex.preloadClass,
    axialStiffnessNPerUm: duplex.axialStiffnessNPerUm,
    radialStiffnessNPerUm: duplex.radialStiffnessNPerUm,
    momentStiffnessNmPerMrad: duplex.momentStiffnessNmPerMrad,
    axialDisplacement,
    thermal,
    rigidityComparison,
    comparisonNote: duplex.comparisonNote,
    status,
    note: noteParts.join(" "),
  };
}

/** Map analysis → legacy DuplexStiffnessCheck shape (plus new fields). */
export function toDuplexStiffnessCheck(analysis: ArrangementAnalysis) {
  return {
    preloadForceN: analysis.preloadForceN,
    preloadClass: analysis.preloadClass,
    axialStiffnessNPerUm: analysis.axialStiffnessNPerUm,
    radialStiffnessNPerUm: analysis.radialStiffnessNPerUm,
    momentStiffnessNmPerMrad: analysis.momentStiffnessNmPerMrad,
    arrangementLabel: analysis.arrangementLabel,
    comparisonNote: analysis.comparisonNote,
    axialDisplacementUm: analysis.axialDisplacement.underExternalFaUm,
    axialDisplacementStatus: analysis.axialDisplacement.status,
    thermalGrowthUm: analysis.thermal?.thermalGrowthUm,
    thermalPreloadChangeN: analysis.thermal?.thermalPreloadChangeN,
    rigidityComparison: analysis.rigidityComparison,
  };
}
