/**
 * Mounted solution BOM — bearing + housing + seal + grease (screening).
 */

import {
  findHousingSku,
  housingsForBoreMm,
  nearestHousingForBore,
  type HousingCatalogEntry,
  type HousingSealOption,
} from "@/data/catalogs/housing";

export type MountedBomLine = {
  kind: "bearing" | "housing" | "seal" | "grease" | "accessory";
  sku: string;
  description: string;
  qty: number;
};

export type MountedBomInput = {
  bearingDesignation?: string;
  bearingTypeLabel?: string;
  boreMm: number;
  housingSku?: string;
  seal?: HousingSealOption;
  seriesClassPrefer?: HousingCatalogEntry["seriesClass"];
};

export type MountedBomResult = {
  housing: HousingCatalogEntry;
  seal: HousingSealOption;
  lines: MountedBomLine[];
  boltSpanMm: number;
  baseHeightMm: number;
  stiffnessFactor: number;
  mountStyle: HousingCatalogEntry["mountStyle"];
  note: string;
};

const SEAL_LABEL: Record<HousingSealOption, string> = {
  labyrinth: "Labyrinth seal set",
  contact: "Contact seal (RS-class)",
  end_cover: "End cover / blanking plate",
  open: "Open (no seal)",
};

export function buildMountedBom(input: MountedBomInput): MountedBomResult | null {
  if (input.boreMm <= 0) return null;

  let housing =
    (input.housingSku ? findHousingSku(input.housingSku) : undefined) ??
    housingsForBoreMm(input.boreMm)[0] ??
    nearestHousingForBore(input.boreMm);

  if (!housing) return null;

  if (input.seriesClassPrefer) {
    const preferred = housingsForBoreMm(input.boreMm).find(
      (h) => h.seriesClass === input.seriesClassPrefer
    );
    if (preferred) housing = preferred;
  }

  const seal =
    input.seal && housing.sealOptions.includes(input.seal)
      ? input.seal
      : housing.defaultSeal;

  const lines: MountedBomLine[] = [];
  if (input.bearingDesignation) {
    lines.push({
      kind: "bearing",
      sku: input.bearingDesignation,
      description: input.bearingTypeLabel
        ? `${input.bearingTypeLabel} rolling bearing`
        : "Rolling bearing",
      qty: 1,
    });
  }
  lines.push({
    kind: "housing",
    sku: housing.sku,
    description: housing.note,
    qty: 1,
  });
  if (seal !== "open") {
    lines.push({
      kind: "seal",
      sku: `${housing.sku}-${seal}`,
      description: SEAL_LABEL[seal],
      qty: seal === "end_cover" ? 1 : 2,
    });
  }
  lines.push({
    kind: "grease",
    sku: housing.greaseId,
    description: housing.greaseLabel,
    qty: 1,
  });
  lines.push({
    kind: "accessory",
    sku: `${housing.sku}-BOLT`,
    description: `Foundation bolts (${housing.boltCount}×) — size from housing check`,
    qty: housing.boltCount,
  });

  return {
    housing,
    seal,
    lines,
    boltSpanMm: housing.boltSpanMm,
    baseHeightMm: housing.baseHeightMm,
    stiffnessFactor: housing.stiffnessFactor,
    mountStyle: housing.mountStyle,
    note: "Mounted kit screening BOM — verify stock and seal kits with distributor. Not an e-commerce cart.",
  };
}
