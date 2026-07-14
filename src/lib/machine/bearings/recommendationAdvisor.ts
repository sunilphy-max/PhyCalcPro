/**
 * Engineering Advisor — contextual explanations for bearing recommendations.
 *
 * Deterministic, duty-aware prose (not an LLM). Differentiator vs MITCalc / OEM tools:
 * explains *why* a designation was preferred, not only metrics.
 */

import type { BearingCatalogEntry, BearingSealType } from "@/data/catalogs/bearingCatalog";
import { BEARING_MANUFACTURER_LABELS, BEARING_TYPE_LABELS } from "@/data/catalogs/bearingCatalog";
import { sealLabelForOem } from "@/data/catalogs/bearing/manufacturerDesignations";
import type { ContaminationLevel } from "./iso281Life";
import type { BearingResult, BearingType } from "./types";
import type { RankedBearing } from "./catalogSelection";

/** Angular-contact preference screening threshold (Fa/Fr). */
export const ANGULAR_CONTACT_FA_FR_THRESHOLD = 0.35;

export type CostBand = "Low" | "Medium" | "High";

export type RecommendationAdvisor = {
  /** One-line headline under Recommended. */
  summary: string;
  /** Full “Explain Recommendation” paragraph. */
  narrative: string;
  /** Structured bullets for the advisor panel. */
  reasons: string[];
  costBand: CostBand;
  /** Short differentiators for alternative OEMs. */
  alternativeNotes: Array<{
    designation: string;
    manufacturerLabel: string;
    note: string;
    costBand: CostBand;
  }>;
};

export type RecommendationAdvisorContext = {
  primary: RankedBearing;
  alternatives: RankedBearing[];
  result: Pick<
    BearingResult,
    | "bearingType"
    | "modifiedLife"
    | "expectedLife"
    | "lifeUtilization"
    | "lifeSafetyFactor"
    | "designStatus"
    | "staticSafetyFactor"
    | "dynamicUtilization"
    | "speedMargin"
    | "designation"
  >;
  radialLoadN: number;
  axialLoadN: number;
  requiredLifeHours: number;
  contamination?: ContaminationLevel;
  sealFilter?: BearingSealType | "all";
  preferredManufacturer?: string;
};

const CONTAMINATION_NEEDS_SEAL: ContaminationLevel[] = [
  "slight_contamination",
  "typical_contamination",
  "heavy_contamination",
];

export function costBandFromIndex(costIndex: number | undefined): CostBand {
  if (costIndex == null || costIndex <= 1.08) return "Low";
  if (costIndex <= 1.28) return "Medium";
  return "High";
}

function familyPhrase(type: BearingType): string {
  const label = BEARING_TYPE_LABELS[type] ?? type;
  // Prefer conversational phrasing for common families.
  if (type === "deep_groove") return "deep groove ball bearing";
  if (type === "angular_contact") return "angular contact bearing";
  if (type === "tapered_roller") return "tapered roller bearing";
  if (type === "cylindrical_roller") return "cylindrical roller bearing";
  if (type === "spherical_roller") return "spherical roller bearing";
  return label.toLowerCase();
}

function isSealed(entry: BearingCatalogEntry): boolean {
  return entry.sealType === "sealed" || entry.sealType === "shielded";
}

function lifeSafety(result: RecommendationAdvisorContext["result"]): number {
  if (result.lifeSafetyFactor != null && result.lifeSafetyFactor > 0) {
    return result.lifeSafetyFactor;
  }
  if (result.lifeUtilization > 0 && Number.isFinite(result.lifeUtilization)) {
    return 1 / result.lifeUtilization;
  }
  return 0;
}

function contaminationPhrase(level: ContaminationLevel | undefined): string | null {
  if (!level) return null;
  if (level === "heavy_contamination") return "heavy contamination";
  if (level === "typical_contamination") return "typical / severe contamination";
  if (level === "slight_contamination") return "slight contamination";
  if (level === "normal_clean") return "normal industrial cleanliness";
  if (level === "high_clean" || level === "extreme_clean") return "clean operating conditions";
  return null;
}

/**
 * Build a contextual Engineering Advisor explanation for the ranked recommendation.
 */
export function explainBearingRecommendation(
  ctx: RecommendationAdvisorContext
): RecommendationAdvisor {
  const { primary, alternatives, result } = ctx;
  const entry = primary.entry;
  const oem = BEARING_MANUFACTURER_LABELS[entry.manufacturer];
  const costBand = costBandFromIndex(entry.costIndex);
  const faFr =
    Math.abs(ctx.radialLoadN) > 1e-9
      ? Math.abs(ctx.axialLoadN) / Math.abs(ctx.radialLoadN)
      : Math.abs(ctx.axialLoadN) > 0
        ? Infinity
        : 0;
  const sf = lifeSafety(result);
  const reasons: string[] = [];
  const sentences: string[] = [];

  // Family / load path
  if (entry.type === "deep_groove" && faFr < ANGULAR_CONTACT_FA_FR_THRESHOLD) {
    reasons.push(
      `Fa/Fr = ${faFr.toFixed(2)} is below the angular-contact screening threshold (${ANGULAR_CONTACT_FA_FR_THRESHOLD}) — deep groove is appropriate.`
    );
    sentences.push(
      `The ${familyPhrase(entry.type)} was selected because the axial load ratio (Fa/Fr = ${faFr.toFixed(2)}) is below the angular-contact screening threshold of ${ANGULAR_CONTACT_FA_FR_THRESHOLD}.`
    );
  } else if (entry.type === "angular_contact" || entry.type === "tapered_roller") {
    reasons.push(
      `Combined load Fa/Fr = ${Number.isFinite(faFr) ? faFr.toFixed(2) : "∞"} favors ${familyPhrase(entry.type)} capacity.`
    );
    sentences.push(
      `An ${familyPhrase(entry.type)} was preferred for the combined load path (Fa/Fr = ${Number.isFinite(faFr) ? faFr.toFixed(2) : "high"}).`
    );
  } else if (entry.type === "deep_groove" && faFr >= ANGULAR_CONTACT_FA_FR_THRESHOLD) {
    reasons.push(
      `Fa/Fr = ${faFr.toFixed(2)} is elevated for a deep groove — verify thrust capacity or consider angular contact.`
    );
    sentences.push(
      `A ${familyPhrase(entry.type)} is ranked under the current filters, but Fa/Fr = ${faFr.toFixed(2)} approaches the angular-contact threshold — confirm axial capacity for the duty.`
    );
  } else {
    sentences.push(
      `${oem} ${entry.designation} (${familyPhrase(entry.type)}) is the preferred match for the entered duty and filters.`
    );
  }

  // Seal / contamination
  const contPhrase = contaminationPhrase(ctx.contamination);
  if (
    ctx.contamination &&
    CONTAMINATION_NEEDS_SEAL.includes(ctx.contamination) &&
    isSealed(entry)
  ) {
    const sealLabel = sealLabelForOem(entry.manufacturer, entry.sealType);
    reasons.push(
      `${sealLabel} sealing matches ${contPhrase ?? "contaminated"} duty (eC screening).`
    );
    sentences.push(
      `A sealed version (${sealLabel}) is recommended due to ${contPhrase ?? "the contamination level"}.`
    );
  } else if (
    ctx.contamination &&
    (ctx.contamination === "high_clean" || ctx.contamination === "extreme_clean") &&
    entry.sealType === "open"
  ) {
    reasons.push("Open bearing suits clean lubrication path — lower friction and cost.");
    sentences.push(
      "An open bearing is acceptable given the clean contamination class, improving friction and cost versus sealed units."
    );
  } else if (isSealed(entry) && ctx.sealFilter && ctx.sealFilter !== "all") {
    reasons.push(
      `Seal filter matched: ${sealLabelForOem(entry.manufacturer, entry.sealType)}.`
    );
  } else if (isSealed(entry)) {
    reasons.push(
      `Sealed/shielded execution (${sealLabelForOem(entry.manufacturer, entry.sealType)}) for maintenance-friendly service.`
    );
  }

  // Life margin
  if (sf >= 1 && result.modifiedLife > 0) {
    reasons.push(
      `Predicted Lnm ≈ ${Math.round(result.modifiedLife).toLocaleString()} h exceeds L_req = ${ctx.requiredLifeHours.toLocaleString()} h (life SF ≈ ${sf.toFixed(1)}).`
    );
    sentences.push(
      `The predicted modified rating life Lnm exceeds your design requirement with a safety margin of ${sf.toFixed(1)}.`
    );
  } else if (sf > 0 && sf < 1) {
    reasons.push(
      `Life SF ≈ ${sf.toFixed(2)} is below 1 — Lnm does not yet meet L_req; select a higher-C designation or relax duty.`
    );
    sentences.push(
      `Caution: life safety factor is only ${sf.toFixed(2)} — the predicted Lnm does not fully cover the required life.`
    );
  }

  // Utilization / sizing
  if (primary.passes) {
    reasons.push(
      `Passes ISO 281/76 screens: P/C = ${primary.dynamicUtilization.toFixed(2)}, n_lim/n = ${primary.speedMargin.toFixed(2)}.`
    );
  } else {
    reasons.push(
      `Closest catalog size under filters, but does not fully pass (P/C = ${primary.dynamicUtilization.toFixed(2)}, n_lim/n = ${primary.speedMargin.toFixed(2)}).`
    );
  }

  if (primary.dynamicUtilization <= 0.7 && primary.passes) {
    reasons.push("Dynamic capacity provides comfortable headroom without oversizing excessively.");
  }

  // Cost
  reasons.push(
    `Relative cost band: ${costBand} (index ${entry.costIndex?.toFixed(2) ?? "1.00"} vs open deep-groove baseline).`
  );
  if (alternatives[0]?.entry.costIndex != null && entry.costIndex != null) {
    const altCost = alternatives[0].entry.costIndex;
    if (entry.costIndex + 0.02 < altCost) {
      sentences.push(
        `It is also the lower-cost option versus the next OEM alternative (cost index ${entry.costIndex.toFixed(2)} vs ${altCost.toFixed(2)}).`
      );
      reasons.push("Lower relative cost index than the leading alternative OEM.");
    } else if (entry.costIndex > altCost + 0.05) {
      reasons.push(
        `Slightly higher cost than ${BEARING_MANUFACTURER_LABELS[alternatives[0].entry.manufacturer]} alternative — preferred on capacity/OEM match.`
      );
    }
  }

  // Preferred OEM
  if (
    ctx.preferredManufacturer &&
    entry.manufacturer === ctx.preferredManufacturer
  ) {
    reasons.push(`Matches preferred manufacturer (${oem}).`);
  }

  const summary = `${oem} ${entry.designation} · Lnm ${Math.round(result.modifiedLife).toLocaleString()} h · life SF ${sf > 0 ? sf.toFixed(1) : "—"} · cost ${costBand}`;

  const narrative =
    sentences.length > 0
      ? sentences.join(" ")
      : `${oem} ${entry.designation} is recommended as the best passing catalog match for the entered duty.`;

  const alternativeNotes = alternatives.slice(0, 4).map((alt) => {
    const altOem = BEARING_MANUFACTURER_LABELS[alt.entry.manufacturer];
    const altBand = costBandFromIndex(alt.entry.costIndex);
    const sameSize =
      alt.entry.boreMm === entry.boreMm &&
      alt.entry.outerDiameterMm === entry.outerDiameterMm &&
      alt.entry.widthMm === entry.widthMm;
    const bits: string[] = [];
    if (sameSize) bits.push("same ISO envelope");
    bits.push(`${sealLabelForOem(alt.entry.manufacturer, alt.entry.sealType)} seal`);
    bits.push(`cost ${altBand}`);
    if (alt.passes && alt.dynamicUtilization > primary.dynamicUtilization + 0.05) {
      bits.push("tighter dynamic margin");
    } else if (alt.passes && alt.dynamicUtilization + 0.05 < primary.dynamicUtilization) {
      bits.push("more dynamic headroom");
    }
    return {
      designation: alt.entry.designation,
      manufacturerLabel: altOem,
      note: bits.join(" · "),
      costBand: altBand,
    };
  });

  return {
    summary,
    narrative,
    reasons,
    costBand,
    alternativeNotes,
  };
}
