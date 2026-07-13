/**
 * Screening housing catalog — SNL / SNLF / UCP / FY / SAF class SKUs.
 * Representative sizes for mounted-solution BOM, not full OEM databases.
 */

export type HousingSeriesClass = "SNL" | "SNLF" | "UCP" | "FY" | "SAF";

export type HousingSealOption = "labyrinth" | "contact" | "end_cover" | "open";

export type HousingCatalogEntry = {
  sku: string;
  seriesClass: HousingSeriesClass;
  /** Nominal shaft / bearing bore (mm). */
  boreMm: number;
  /** Bolt circle / span (mm). */
  boltSpanMm: number;
  boltCount: number;
  /** Base / center height (mm). */
  baseHeightMm: number;
  /** Relative stiffness factor vs generic cantilever (1 = baseline). */
  stiffnessFactor: number;
  mountStyle: "pillow_block" | "flange" | "foot";
  sealOptions: HousingSealOption[];
  defaultSeal: HousingSealOption;
  /** Suggested grease ISO VG / NLGI note. */
  greaseId: string;
  greaseLabel: string;
  note: string;
};

const GREASE_LGHP2 = { greaseId: "LGHP2", greaseLabel: "High-temp polyurea (LGHP 2 class)" };
const GREASE_LGMT2 = { greaseId: "LGMT2", greaseLabel: "General mineral (LGMT 2 class)" };
const GREASE_LGEP2 = { greaseId: "LGEP2", greaseLabel: "EP mineral (LGEP 2 class)" };

function snl(bore: number, boltSpan: number, baseH: number): HousingCatalogEntry {
  return {
    sku: `SNL ${bore}`,
    seriesClass: "SNL",
    boreMm: bore,
    boltSpanMm: boltSpan,
    boltCount: 2,
    baseHeightMm: baseH,
    stiffnessFactor: 1.15,
    mountStyle: "pillow_block",
    sealOptions: ["labyrinth", "contact", "end_cover"],
    defaultSeal: "labyrinth",
    ...GREASE_LGMT2,
    note: "Split plummer block (SNL-class screening).",
  };
}

function ucp(bore: number, boltSpan: number, baseH: number): HousingCatalogEntry {
  return {
    sku: `UCP ${bore}`,
    seriesClass: "UCP",
    boreMm: bore,
    boltSpanMm: boltSpan,
    boltCount: 2,
    baseHeightMm: baseH,
    stiffnessFactor: 0.95,
    mountStyle: "pillow_block",
    sealOptions: ["contact", "open"],
    defaultSeal: "contact",
    ...GREASE_LGMT2,
    note: "Cast iron pillow unit (UCP-class) with insert bearing.",
  };
}

function fy(bore: number, boltSpan: number): HousingCatalogEntry {
  return {
    sku: `FY ${bore}`,
    seriesClass: "FY",
    boreMm: bore,
    boltSpanMm: boltSpan,
    boltCount: 4,
    baseHeightMm: bore * 0.9,
    stiffnessFactor: 1.05,
    mountStyle: "flange",
    sealOptions: ["contact", "labyrinth"],
    defaultSeal: "contact",
    ...GREASE_LGHP2,
    note: "Square flange unit (FY-class screening).",
  };
}

function saf(bore: number, boltSpan: number, baseH: number): HousingCatalogEntry {
  return {
    sku: `SAF ${bore}`,
    seriesClass: "SAF",
    boreMm: bore,
    boltSpanMm: boltSpan,
    boltCount: 4,
    baseHeightMm: baseH,
    stiffnessFactor: 1.25,
    mountStyle: "pillow_block",
    sealOptions: ["labyrinth", "end_cover", "contact"],
    defaultSeal: "labyrinth",
    ...GREASE_LGEP2,
    note: "Heavy split pillow (SAF-class screening).",
  };
}

export const HOUSING_CATALOG: HousingCatalogEntry[] = [
  snl(20, 130, 40),
  snl(25, 140, 45),
  snl(30, 155, 50),
  snl(35, 165, 55),
  snl(40, 180, 60),
  snl(50, 205, 70),
  snl(60, 230, 80),
  { ...snl(50, 210, 72), sku: "SNLF 50", seriesClass: "SNLF", note: "SNL with flange feet (SNLF-class)." },
  { ...snl(60, 240, 85), sku: "SNLF 60", seriesClass: "SNLF", note: "SNL with flange feet (SNLF-class)." },
  ucp(20, 95, 33),
  ucp(25, 105, 36),
  ucp(30, 119, 42),
  ucp(35, 126, 47),
  ucp(40, 137, 49),
  ucp(50, 163, 57),
  fy(25, 70),
  fy(30, 83),
  fy(35, 95),
  fy(40, 102),
  fy(50, 111),
  saf(40, 220, 75),
  saf(50, 250, 90),
  saf(60, 280, 100),
  saf(70, 310, 110),
  saf(80, 340, 120),
];

export function housingsForBoreMm(boreMm: number, tolMm = 0.5): HousingCatalogEntry[] {
  return HOUSING_CATALOG.filter((h) => Math.abs(h.boreMm - boreMm) <= tolMm).sort((a, b) =>
    a.sku.localeCompare(b.sku)
  );
}

export function findHousingSku(sku: string): HousingCatalogEntry | undefined {
  return HOUSING_CATALOG.find((h) => h.sku === sku);
}

export function nearestHousingForBore(boreMm: number): HousingCatalogEntry | undefined {
  let best: HousingCatalogEntry | undefined;
  let bestDelta = Infinity;
  for (const h of HOUSING_CATALOG) {
    const d = Math.abs(h.boreMm - boreMm);
    if (d < bestDelta) {
      bestDelta = d;
      best = h;
    }
  }
  return best;
}

export const HOUSING_SERIES_LABELS: Record<HousingSeriesClass, string> = {
  SNL: "SNL plummer block",
  SNLF: "SNLF flanged plummer",
  UCP: "UCP pillow unit",
  FY: "FY flange unit",
  SAF: "SAF heavy pillow",
};
