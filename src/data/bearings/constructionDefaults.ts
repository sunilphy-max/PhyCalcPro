/**
 * Construction / material defaults by bearing family for suite construction cards.
 */

import type { CatalogBearingType } from "@/data/catalogs/bearing/types";

export type BearingConstructionInfo = {
  ringMaterial: string;
  rollingElement: string;
  cage: string;
  seal: string;
  lubricant: string;
  operatingTemperature: string;
  typicalApplications: string[];
  standards: string[];
};

const STEEL_RING = "Through-hardened chromium steel (e.g. 100Cr6 / AISI 52100)";
const STEEL_BALL = "Bearing-quality chromium steel rolling elements";
const STEEL_ROLLER = "Bearing-quality chromium steel rollers";

export function constructionForType(
  type: CatalogBearingType,
  sealLabel?: string,
  cageType?: string
): BearingConstructionInfo {
  const seal = sealLabel ?? "Open / ZZ / 2RS per designation";
  const cage = cageType ?? "Pressed steel or polyamide (series-dependent)";
  const base = {
    ringMaterial: STEEL_RING,
    lubricant: "Grease-filled sealed; oil bath / circulating oil for open high-speed",
    operatingTemperature: "Typical −20 °C to +120 °C (derate C above ~120 °C)",
    standards: ["ISO 281", "ISO 76", "ISO 492"],
  };

  switch (type) {
    case "deep_groove":
      return {
        ...base,
        rollingElement: STEEL_BALL,
        cage,
        seal,
        typicalApplications: ["Electric motors", "Pumps", "Conveyors", "Gearboxes"],
      };
    case "angular_contact":
      return {
        ...base,
        rollingElement: STEEL_BALL,
        cage,
        seal,
        typicalApplications: ["Ballscrews", "Spindles", "Pumps", "Gearboxes"],
      };
    case "cylindrical_roller":
    case "cylindrical_nj":
    case "cylindrical_nup":
      return {
        ...base,
        rollingElement: STEEL_ROLLER,
        cage,
        seal,
        typicalApplications: ["Gearboxes", "Electric motors", "Rolling mills"],
      };
    case "tapered_roller":
      return {
        ...base,
        rollingElement: STEEL_ROLLER,
        cage,
        seal,
        typicalApplications: ["Wheel hubs", "Gearboxes", "Axles"],
      };
    case "spherical_roller":
      return {
        ...base,
        rollingElement: STEEL_ROLLER,
        cage,
        seal,
        typicalApplications: ["Conveyors", "Screens", "Paper machines", "Fans"],
      };
    case "needle_roller":
      return {
        ...base,
        rollingElement: "Needle rollers (high length/diameter)",
        cage,
        seal,
        typicalApplications: ["Transmissions", "Pivots", "Compact gearboxes"],
      };
    case "thrust_ball":
    case "thrust_cylindrical_roller":
    case "thrust_spherical_roller":
      return {
        ...base,
        rollingElement: type.includes("ball") ? STEEL_BALL : STEEL_ROLLER,
        cage,
        seal,
        typicalApplications: ["Vertical shafts", "Turntables", "Screw jacks"],
      };
    default:
      return {
        ...base,
        rollingElement: STEEL_BALL,
        cage,
        seal,
        typicalApplications: ["General machine design"],
      };
  }
}

export type RatingProvenance = "datasheet" | "oem_scaled" | "estimated" | "user_override";

export function provenanceLabel(kind: RatingProvenance): string {
  switch (kind) {
    case "datasheet":
      return "Datasheet";
    case "oem_scaled":
      return "OEM-scaled catalog";
    case "estimated":
      return "Estimated";
    case "user_override":
      return "User override";
  }
}

/** Resolve C / C₀ / Pu provenance for trust chips (no false vendor accuracy claims). */
export function resolveRatingsProvenance(opts: {
  ratingsOverrideEnabled?: boolean;
  entry?: {
    fatigueLoadLimitFromDatasheet?: boolean;
    puSource?: "datasheet" | "c0_ratio" | "c_ratio";
  } | null;
}): RatingProvenance {
  if (opts.ratingsOverrideEnabled) return "user_override";
  if (opts.entry?.fatigueLoadLimitFromDatasheet || opts.entry?.puSource === "datasheet") {
    return "datasheet";
  }
  if (opts.entry?.puSource === "c0_ratio" || opts.entry?.puSource === "c_ratio") {
    return "estimated";
  }
  // Expanded catalog C/C₀ from series templates scaled per OEM designation.
  return "oem_scaled";
}
