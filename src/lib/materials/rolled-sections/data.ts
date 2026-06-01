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

export const ROLLED_SECTION_FAMILIES = ["W", "S", "C", "L", "IPE", "UPN", "L-EN"] as const;

export function sectionsByFamily(family: string) {
  return Object.entries(ROLLED_SECTIONS)
    .filter(([, p]) => p.family === family)
    .map(([d]) => d)
    .sort();
}
