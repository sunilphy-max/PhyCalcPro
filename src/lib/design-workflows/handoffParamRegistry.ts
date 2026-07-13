/**
 * Canonical SI parameter keys for cross-module power-train handoffs.
 * Publishers and consumers should use these keys; legacy aliases are normalized on apply.
 */

export type HandoffParamKey =
  | "power"
  | "speed"
  | "rpm"
  | "serviceFactor"
  | "torque"
  | "radialForce"
  | "radialLoad"
  | "axialLoad"
  | "transverseForce"
  | "bendingMoment"
  | "shaftDiameter"
  | "boreMm"
  | "station0Radial"
  | "station1Radial"
  | "bearingSpanMm"
  | "station0Slope"
  | "station1Slope"
  | "maxBearingSlope"
  | "diameterDriver"
  | "diameterDriven"
  | "centerDistance"
  | "tension"
  | "shear"
  | "boltCount"
  | "patternDiameter"
  | "reactionForce"
  | "moment";

export type HandoffEdge = {
  from: string;
  to: string;
  params: HandoffParamKey[];
};

/** Documented power-train handoff edges. */
export const POWER_TRAIN_HANDOFF_EDGES: HandoffEdge[] = [
  { from: "motor", to: "v-belts", params: ["power", "speed", "serviceFactor"] },
  { from: "multi-pulley", to: "v-belts", params: ["diameterDriver", "diameterDriven", "centerDistance"] },
  { from: "v-belts", to: "shafts", params: ["torque", "radialForce", "speed"] },
  { from: "v-belts", to: "bearings", params: ["radialLoad", "speed"] },
  { from: "shafts", to: "keys-splines", params: ["torque", "shaftDiameter"] },
  { from: "shafts", to: "bearings", params: ["radialLoad", "axialLoad", "speed", "shaftDiameter", "station0Radial", "station1Radial", "bearingSpanMm", "station0Slope", "station1Slope", "maxBearingSlope"] },
  { from: "bearings", to: "housing", params: ["boreMm", "radialLoad", "axialLoad", "speed"] },
  { from: "housing", to: "bolts", params: ["tension", "shear", "boltCount", "patternDiameter"] },
  { from: "bolts", to: "frames", params: ["reactionForce", "moment"] },
];

/** Normalize legacy/alternate param keys to canonical SI map. */
export function normalizeHandoffParams(params: Record<string, number>): Record<string, number> {
  const out = { ...params };
  if (out.speed != null && out.rpm == null) out.rpm = out.speed;
  if (out.rpm != null && out.speed == null) out.speed = out.rpm;
  if (out.radialForce != null && out.radialLoad == null) out.radialLoad = out.radialForce;
  if (out.radialLoad != null && out.radialForce == null) out.radialForce = out.radialLoad;
  if (out.boreMm != null && out.shaftDiameter == null) out.shaftDiameter = out.boreMm;
  if (out.shaftDiameter != null && out.boreMm == null) out.boreMm = out.shaftDiameter;
  return out;
}

export function pickHandoffParams(
  params: Record<string, number>,
  keys: HandoffParamKey[]
): Record<string, number> {
  const normalized = normalizeHandoffParams(params);
  const picked: Record<string, number> = {};
  for (const key of keys) {
    if (normalized[key] != null) picked[key] = normalized[key]!;
  }
  return picked;
}

/** Operating speed from handoff params (rpm). */
export function handoffSpeedRpm(params: Record<string, number>): number | undefined {
  const n = normalizeHandoffParams(params);
  return n.speed ?? n.rpm;
}
