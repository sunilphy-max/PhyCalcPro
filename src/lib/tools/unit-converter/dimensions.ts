import {
  getUnitsForDimension,
  type PhysicsDimension,
  unitFactors,
} from "@/lib/physics/units";

/** Engineering dimensions exposed in the unit converter UI (excludes dimensionless). */
export const UNIT_CONVERTER_DIMENSIONS = [
  "length",
  "area",
  "mass",
  "force",
  "stress",
  "pressure",
  "moment",
  "torque",
  "forcePerLength",
  "inertia",
  "energy",
  "power",
  "velocity",
  "volumeFlow",
  "density",
  "frequency",
  "time",
  "temperature",
  "inverseTemperature",
  "lengthPerTime",
] as const satisfies readonly PhysicsDimension[];

export type UnitConverterDimensionKey = (typeof UNIT_CONVERTER_DIMENSIONS)[number];

export type DimensionGroupId = "geometry" | "mechanics" | "energy" | "fluids" | "other";

export const DIMENSION_GROUPS: {
  id: DimensionGroupId;
  label: string;
  dimensions: UnitConverterDimensionKey[];
}[] = [
  {
    id: "geometry",
    label: "Geometry",
    dimensions: ["length", "area", "inertia"],
  },
  {
    id: "mechanics",
    label: "Mechanics",
    dimensions: ["mass", "force", "stress", "moment", "torque", "forcePerLength"],
  },
  {
    id: "energy",
    label: "Energy & motion",
    dimensions: ["energy", "power", "velocity", "frequency", "time"],
  },
  {
    id: "fluids",
    label: "Fluids & thermal",
    dimensions: ["pressure", "volumeFlow", "density", "temperature", "inverseTemperature"],
  },
  {
    id: "other",
    label: "Other",
    dimensions: ["lengthPerTime"],
  },
];

export const DIMENSION_LABELS: Record<UnitConverterDimensionKey, string> = {
  length: "Length",
  area: "Area",
  mass: "Mass",
  force: "Force",
  stress: "Stress",
  pressure: "Pressure",
  moment: "Moment",
  torque: "Torque",
  forcePerLength: "Force / length",
  inertia: "Area moment of inertia",
  energy: "Energy",
  power: "Power",
  velocity: "Velocity",
  volumeFlow: "Volume flow",
  density: "Density",
  frequency: "Frequency",
  time: "Time",
  temperature: "Temperature",
  inverseTemperature: "1 / temperature",
  lengthPerTime: "Length / time (rate)",
};

/** Preferred from/to defaults when switching dimension (SI-ish → common US pair). */
export const DIMENSION_DEFAULT_UNITS: Record<
  UnitConverterDimensionKey,
  { from: string; to: string; value: number }
> = {
  length: { from: "mm", to: "in", value: 25.4 },
  area: { from: "mm2", to: "in2", value: 100 },
  mass: { from: "kg", to: "lb", value: 1 },
  force: { from: "N", to: "lbf", value: 1000 },
  stress: { from: "MPa", to: "psi", value: 100 },
  pressure: { from: "bar", to: "psi", value: 1 },
  moment: { from: "N·m", to: "lbf·ft", value: 100 },
  torque: { from: "N·m", to: "lbf·ft", value: 50 },
  forcePerLength: { from: "N/m", to: "lbf/ft", value: 1000 },
  inertia: { from: "mm4", to: "in4", value: 1e6 },
  energy: { from: "J", to: "ft·lbf", value: 1000 },
  power: { from: "kW", to: "hp", value: 1 },
  velocity: { from: "m/s", to: "ft/s", value: 10 },
  volumeFlow: { from: "L/min", to: "gpm", value: 100 },
  density: { from: "kg/m3", to: "lb/ft3", value: 7850 },
  frequency: { from: "Hz", to: "rpm", value: 60 },
  time: { from: "s", to: "min", value: 60 },
  temperature: { from: "C", to: "F", value: 20 },
  inverseTemperature: { from: "1/C", to: "1/F", value: 1.2e-5 },
  lengthPerTime: { from: "mm/year", to: "in/year", value: 0.1 },
};

export function unitsForConverterDimension(dimension: UnitConverterDimensionKey): string[] {
  const keys = getUnitsForDimension(dimension);
  // Prefer registry order; drop duplicate micro symbol if both um and µm exist
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of keys) {
    const canonical = key === "\u00b5m" ? "um" : key;
    if (seen.has(canonical)) continue;
    seen.add(canonical);
    out.push(key === "\u00b5m" ? "um" : key);
  }
  return out;
}

export function isConverterDimension(value: string): value is UnitConverterDimensionKey {
  return (UNIT_CONVERTER_DIMENSIONS as readonly string[]).includes(value);
}

/** Ensure unit-converter profiles stay aligned with the physics registry. */
export function buildUnitConverterProfiles(): Record<
  UnitConverterDimensionKey,
  { dimension: PhysicsDimension; defaultUnit: string; units: string[]; label: string }
> {
  const profiles = {} as Record<
    UnitConverterDimensionKey,
    { dimension: PhysicsDimension; defaultUnit: string; units: string[]; label: string }
  >;
  for (const key of UNIT_CONVERTER_DIMENSIONS) {
    const defaults = DIMENSION_DEFAULT_UNITS[key];
    const units = unitsForConverterDimension(key);
    const defaultUnit =
      units.includes(defaults.from) ? defaults.from : (Object.keys(unitFactors[key] ?? {})[0] ?? defaults.from);
    profiles[key] = {
      dimension: key,
      defaultUnit,
      units,
      label: DIMENSION_LABELS[key],
    };
  }
  return profiles;
}
