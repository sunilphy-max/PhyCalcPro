import { SECTION_ROWS } from "./catalogEntries";

export type RolledSectionProps = {
  area: number;
  ix: number;
  iy: number;
  sx: number;
  sy: number;
  depth: number;
  flangeWidth: number;
  weight: number;
  family: string;
};

function inferFamily(designation: string, family?: string): string {
  if (family) return family;
  if (designation.startsWith("W")) return "W";
  if (designation.startsWith("S")) return "S";
  if (designation.startsWith("C")) return "C";
  if (designation.startsWith("IPE")) return "IPE";
  if (designation.startsWith("UPN")) return "UPN";
  if (designation.startsWith("L")) return designation.includes("x") && designation.split("x").length > 3 ? "L-EN" : "L";
  return "L";
}

export const ROLLED_SECTIONS: Record<string, RolledSectionProps> = Object.fromEntries(
  SECTION_ROWS.map((row) => {
    const [designation, area, ix, iy, sx, sy, depth, flangeWidth, weight, family] = row;
    const fam = inferFamily(designation, family);
    return [
      designation,
      { area, ix, iy, sx, sy, depth, flangeWidth, weight, family: fam },
    ];
  })
);

export const ROLLED_SECTION_FAMILIES = ["W", "S", "C", "L", "IPE", "UPN", "L-EN", "UK"] as const;

/** EN/UK designation aliases → canonical catalog key */
export const ROLLED_SECTION_ALIASES: Record<string, string> = {
  "305x165x40": "W310x60",
  "305x165x46": "W310x52",
  "305x165x54": "W310x44",
  "UB305x165x40": "W310x60",
  "UB305x165x46": "W310x52",
  "HEA600": "IPE600",
  "HEA550": "IPE550",
  "HEA500": "IPE500",
  "HEA400": "IPE400",
  "HEA300": "IPE300",
  "HEA200": "IPE200",
  "HEB300": "IPE300",
  "HEB200": "IPE200",
};

export function resolveRolledSectionDesignation(designation: string): string {
  const key = designation.trim();
  if (ROLLED_SECTIONS[key]) return key;
  const alias = ROLLED_SECTION_ALIASES[key];
  if (alias && ROLLED_SECTIONS[alias]) return alias;
  const normalized = key.replace(/\s+/g, "").replace(/×/g, "x");
  if (ROLLED_SECTIONS[normalized]) return normalized;
  const aliasNorm = ROLLED_SECTION_ALIASES[normalized];
  if (aliasNorm && ROLLED_SECTIONS[aliasNorm]) return aliasNorm;
  return "W310x97";
}

export function sectionsByFamily(family: string) {
  return Object.entries(ROLLED_SECTIONS)
    .filter(([, p]) => p.family === family)
    .map(([d]) => d)
    .sort();
}
