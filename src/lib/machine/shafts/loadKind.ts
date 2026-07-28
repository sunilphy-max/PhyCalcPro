import type { LoadCase, ShaftLoadKind } from "./types";

/** Infer diagram station kind from load components when `kind` is omitted. */
export function inferShaftLoadKind(load: LoadCase): ShaftLoadKind {
  if (load.kind) return load.kind;
  const t = Math.abs(load.torque ?? 0);
  const m = Math.abs(load.bendingMoment ?? 0);
  const f = Math.abs(load.transverseForce ?? 0);
  const hasTorque = t > 0;
  const hasRadial = m > 0 || f > 0;
  if (hasTorque && hasRadial) return "gear";
  if (hasTorque) return "torque";
  if (f > 0) return "pulley";
  if (m > 0) return "bending";
  if (Math.abs(load.axialForce ?? 0) > 0) return "force";
  return "force";
}

export function shaftLoadKindLabel(kind: ShaftLoadKind): string {
  switch (kind) {
    case "gear":
      return "Gear";
    case "pulley":
      return "Pulley";
    case "torque":
      return "Torque";
    case "bending":
      return "Bending";
    case "force":
      return "Force";
  }
}

export const SHAFT_LOAD_KINDS: ShaftLoadKind[] = [
  "gear",
  "pulley",
  "torque",
  "bending",
  "force",
];

/**
 * Default station values for library placement (display units as entered by user).
 * Gear = torque + radial force; pulley = belt pull; etc.
 */
export function createShaftStation(
  kind: ShaftLoadKind,
  position: number,
  span: number
): LoadCase {
  const x = Math.min(Math.max(0, position), Math.max(span, 0));
  switch (kind) {
    case "gear":
      return { position: x, kind, torque: 100, transverseForce: 1500 };
    case "pulley":
      return { position: x, kind, transverseForce: 800 };
    case "torque":
      return { position: x, kind, torque: 100 };
    case "bending":
      return { position: x, kind, bendingMoment: 200 };
    case "force":
      return { position: x, kind, transverseForce: 500 };
  }
}
