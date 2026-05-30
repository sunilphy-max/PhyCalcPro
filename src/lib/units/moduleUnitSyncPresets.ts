/**
 * Common applyUnitMap presets per module — import in page.tsx setters.
 * Keys must match moduleUnitProfiles field keys.
 */
export const moduleUnitSyncPresets = {
  shafts: ["length", "diameter", "torque", "stress"] as const,
  vessels: ["radius", "pressure"] as const,
  welds: ["length", "force", "stress"] as const,
  rivets: ["diameter", "thickness", "force", "stress"] as const,
  hydraulics: ["diameter", "pressure", "flow"] as const,
  flywheels: ["mass", "radius", "speed"] as const,
  cams: ["radius", "velocity"] as const,
  bearings: ["load", "speed", "life"] as const,
  plates: ["length", "thickness", "pressure", "stress"] as const,
  frames: ["length", "force", "stress"] as const,
  trusses: ["length", "force"] as const,
  vibrations: ["length", "modulus", "area", "inertia", "density"] as const,
  rotation: ["speed", "torque", "inertia"] as const,
  composites: ["stress", "density"] as const,
  sections: ["length", "area", "inertia"] as const,
  profiles: ["length", "area", "inertia"] as const,
  tolerance: ["nominalSize", "tolerance"] as const,
  corrosion: ["initialThickness", "corrosionRate", "designLife", "safetyMargin"] as const,
  fatigue: ["alternatingStress", "meanStress", "ultimateStrength", "enduranceLimit"] as const,
} as const;
