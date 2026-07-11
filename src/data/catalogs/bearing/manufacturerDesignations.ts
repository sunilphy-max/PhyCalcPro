/**
 * OEM-specific catalog designations (SKF 6205-2RS1, NSK 6205DDU, FAG 6205-2RSR, …).
 */

import type { BearingManufacturer, BearingSealType, SeriesTemplate } from "./types";

const CAGE_BY_FAMILY: Record<string, string> = {
  deep_groove_ball: "Pressed steel",
  angular_contact_ball: "Machined brass",
  cylindrical_roller: "Pressed steel",
  tapered_roller: "Pressed steel",
  spherical_roller: "Machined brass",
  needle_roller: "Pressed steel",
  self_aligning_ball: "Pressed steel",
  thrust_ball: "Pressed steel",
};

/** Screening mass estimate from geometry (kg). */
export function estimateBearingMassKg(boreMm: number, outerMm: number, widthMm: number): number {
  const dm = (boreMm + outerMm) / 2 / 1000;
  const w = widthMm / 1000;
  return Math.round(dm * w * w * 7800 * 0.32 * 100) / 100;
}

export function cageTypeForFamily(family: SeriesTemplate["family"]): string {
  return CAGE_BY_FAMILY[family] ?? "Pressed steel";
}

function baseSizeFromDesignation(seriesDesignation: string): string {
  return seriesDesignation.replace(/\s+B$/i, "").replace(/-2RS$/i, "").trim();
}

export function formatOemDesignation(
  manufacturer: BearingManufacturer,
  template: SeriesTemplate
): string {
  const seal = template.sealType ?? "open";
  const base = baseSizeFromDesignation(template.seriesDesignation);

  if (seal === "sealed" || seal === "contact_sealed") {
    switch (manufacturer) {
      case "SKF":
        return `${base}-2RS1`;
      case "NSK":
        return `${base}DDU`;
      case "FAG":
        return `${base}-2RSR`;
      case "NTN":
        return `${base}LLU`;
      case "TIMKEN":
        return `${base}-2RS`;
    }
  }

  if (seal === "shielded") {
    switch (manufacturer) {
      case "SKF":
        return `${base}-Z`;
      case "NSK":
        return `${base}ZZ`;
      case "FAG":
        return `${base}-2Z`;
      case "NTN":
        return `${base}ZZ`;
      case "TIMKEN":
        return `${base}-Z`;
    }
  }

  // Open / angular contact / rollers — manufacturer-specific spacing
  if (template.type === "angular_contact") {
    switch (manufacturer) {
      case "NSK":
        return base.replace(/\s+/g, "");
      case "FAG":
        return base.replace(/\s+B$/, "-B");
      case "SKF":
        return template.seriesDesignation;
      default:
        return `${manufacturer} ${base.replace(/\s+/g, "")}`;
    }
  }

  // Open deep groove / rollers: SKF uses bare ISO size; other OEMs keep a unique key.
  if (manufacturer === "SKF") return base;
  return `${manufacturer} ${base}`;
}

export function sealLabelForOem(
  manufacturer: BearingManufacturer,
  sealType: BearingSealType
): string {
  if (sealType === "open") return "Open";
  if (sealType === "shielded") {
    return manufacturer === "NSK" ? "ZZ (shielded)" : "Z (shielded)";
  }
  if (sealType === "sealed" || sealType === "contact_sealed") {
    const map: Record<BearingManufacturer, string> = {
      SKF: "2RS1 (contact sealed)",
      NSK: "DDU (contact sealed)",
      FAG: "2RSR (contact sealed)",
      NTN: "LLU (contact sealed)",
      TIMKEN: "2RS (sealed)",
    };
    return map[manufacturer];
  }
  return sealType;
}

export const AVAILABILITY_LABEL = "Catalog screening — verify stock with distributor";
