/** Classical and narrow V-belt sections (screening factors — not manufacturer power tables). */
export type VBeltSection = {
  section: string;
  family: "classical" | "narrow";
  /** kW capacity scale per m/s belt speed at full wrap (screening). */
  beltFactor: number;
  minPulleyMm: number;
};

export const VBELT_SECTION_CATALOG: VBeltSection[] = [
  { section: "A", family: "classical", beltFactor: 0.12, minPulleyMm: 75 },
  { section: "B", family: "classical", beltFactor: 0.18, minPulleyMm: 125 },
  { section: "C", family: "classical", beltFactor: 0.28, minPulleyMm: 200 },
  { section: "D", family: "classical", beltFactor: 0.42, minPulleyMm: 300 },
  { section: "E", family: "classical", beltFactor: 0.56, minPulleyMm: 450 },
  { section: "3V", family: "narrow", beltFactor: 0.22, minPulleyMm: 90 },
  { section: "5V", family: "narrow", beltFactor: 0.38, minPulleyMm: 140 },
  { section: "8V", family: "narrow", beltFactor: 0.55, minPulleyMm: 280 },
];

export type ServiceFactorPreset = {
  id: string;
  label: string;
  factor: number;
};

export const VBELT_SERVICE_FACTOR_PRESETS: ServiceFactorPreset[] = [
  { id: "light", label: "Light duty", factor: 1.0 },
  { id: "normal", label: "Normal duty", factor: 1.2 },
  { id: "heavy", label: "Heavy duty", factor: 1.4 },
  { id: "shock", label: "Shock / intermittent", factor: 1.6 },
  { id: "severe", label: "Severe shock", factor: 2.0 },
];

export function beltFactorForSection(section: string): number {
  return VBELT_SECTION_CATALOG.find((item) => item.section === section)?.beltFactor ?? 0.18;
}

export function resolveBeltSections(selection: string): VBeltSection[] {
  if (selection === "auto") return VBELT_SECTION_CATALOG;
  const match = VBELT_SECTION_CATALOG.find((item) => item.section === selection);
  return match ? [match] : VBELT_SECTION_CATALOG;
}

/** Snap open belt length to a nominal catalog increment (mm). */
export function snapStandardBeltLengthMm(lengthM: number): number {
  const mm = lengthM * 1000;
  if (mm <= 1000) return Math.ceil(mm / 25) * 25;
  return Math.ceil(mm / 50) * 50;
}

export function normalizePowerKw(power: number, unit: string): number {
  const u = unit.toLowerCase();
  if (u === "kw") return power;
  if (u === "w") return power / 1000;
  if (u === "hp") return power * 0.7457;
  return power;
}
