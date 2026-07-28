import type { BeamSupport, SupportType } from "./types";

/** Seed supports from a classic end-condition preset. */
export function supportsFromPreset(
  support: SupportType,
  length: number
): BeamSupport[] {
  if (support === "cantilever") {
    return [{ id: "fixed-left", x: 0, kind: "fixed" }];
  }
  if (support === "fixed_fixed") {
    return [
      { id: "fixed-left", x: 0, kind: "fixed" },
      { id: "fixed-right", x: length, kind: "fixed" },
    ];
  }
  // simply_supported
  return [
    { id: "pin-left", x: 0, kind: "pin" },
    { id: "roller-right", x: length, kind: "roller" },
  ];
}

export function resolveSupports(args: {
  length: number;
  support?: SupportType;
  supports?: BeamSupport[];
}): BeamSupport[] {
  if (args.supports && args.supports.length > 0) {
    return args.supports.map((s) => ({
      ...s,
      x: Math.max(0, Math.min(args.length, s.x)),
    }));
  }
  return supportsFromPreset(args.support ?? "simply_supported", args.length);
}

/** Infer a display preset label from an explicit support list when possible. */
export function inferSupportPreset(
  supports: BeamSupport[],
  length: number,
  tol = 1e-9
): SupportType | "continuous" {
  const sorted = [...supports].sort((a, b) => a.x - b.x);
  if (
    sorted.length === 1 &&
    Math.abs(sorted[0]!.x) <= tol &&
    sorted[0]!.kind === "fixed"
  ) {
    return "cantilever";
  }
  if (
    sorted.length === 2 &&
    Math.abs(sorted[0]!.x) <= tol &&
    Math.abs(sorted[1]!.x - length) <= tol &&
    sorted[0]!.kind === "fixed" &&
    sorted[1]!.kind === "fixed"
  ) {
    return "fixed_fixed";
  }
  if (
    sorted.length === 2 &&
    Math.abs(sorted[0]!.x) <= tol &&
    Math.abs(sorted[1]!.x - length) <= tol &&
    (sorted[0]!.kind === "pin" || sorted[0]!.kind === "roller") &&
    (sorted[1]!.kind === "pin" || sorted[1]!.kind === "roller")
  ) {
    return "simply_supported";
  }
  return "continuous";
}

export function validateSupports(
  supports: BeamSupport[],
  length: number
): string[] {
  const warnings: string[] = [];
  if (supports.length === 0) {
    warnings.push("At least one support is required.");
    return warnings;
  }
  const hasVertical = supports.some(
    (s) => s.kind === "pin" || s.kind === "roller" || s.kind === "fixed"
  );
  if (!hasVertical) {
    warnings.push("At least one vertical restraint is required.");
  }
  const sorted = [...supports].sort((a, b) => a.x - b.x);
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i]!.x - sorted[i - 1]!.x) < length * 1e-6) {
      warnings.push("Supports are too close together.");
      break;
    }
  }
  return warnings;
}
