/**
 * Shared helical spring utilities — Shigley Ch. 10 / EN 13906 screening.
 */

export type SpringEndCondition = "guided" | "fixed_hinged" | "hinged" | "fixed_free";

const BUCKLING_NU: Record<SpringEndCondition, number> = {
  guided: 0.5,
  fixed_hinged: 0.707,
  hinged: 1.0,
  fixed_free: 2.0,
};

export function springIndex(meanDiameter: number, wireDiameter: number): number {
  return meanDiameter / Math.max(wireDiameter, 1e-12);
}

export function wahlFactor(C: number): number {
  if (C <= 1) return 2;
  return (4 * C - 1) / (4 * C - 4) + 0.615 / C;
}

export function bergstrasserFactor(C: number): number {
  if (C <= 1) return 2;
  return (4 * C + 2) / (4 * C - 3);
}

export function torsionCurvatureFactor(C: number): number {
  if (C <= 1) return 1.5;
  return (4 * C * C - C - 1) / (4 * C * (C - 1));
}

export function helicalSpringRate(
  shearModulus: number,
  wireDiameter: number,
  meanDiameter: number,
  activeCoils: number
): number {
  const d = wireDiameter;
  const D = meanDiameter;
  const n = activeCoils;
  return (shearModulus * d ** 4) / (8 * D ** 3 * n);
}

export function helicalShearStress(
  force: number,
  meanDiameter: number,
  wireDiameter: number,
  wahl: number
): number {
  return (wahl * 8 * force * meanDiameter) / (Math.PI * wireDiameter ** 3);
}

export function solidHeightCompression(activeCoils: number, wireDiameter: number): number {
  return activeCoils * wireDiameter + 2 * wireDiameter;
}

export function activeCoilMass(
  wireDiameter: number,
  meanDiameter: number,
  activeCoils: number,
  density = 7850
): number {
  const wireArea = (Math.PI * wireDiameter ** 2) / 4;
  const wireLength = Math.PI * meanDiameter * activeCoils;
  return wireArea * wireLength * density;
}

export function surgeFrequencyHz(springRate: number, activeMass: number): number {
  return 0.5 * Math.sqrt(springRate / Math.max(activeMass, 1e-12));
}

export function bucklingSlendernessLimit(endCondition: SpringEndCondition): number {
  return 2.63 / BUCKLING_NU[endCondition];
}

export function isBucklingRisk(
  freeLength: number,
  meanDiameter: number,
  endCondition: SpringEndCondition
): boolean {
  const slenderness = freeLength / Math.max(meanDiameter, 1e-12);
  return slenderness > bucklingSlendernessLimit(endCondition);
}

export function en13906AllowableShear(ultimateStrength: number): number {
  return 0.56 * ultimateStrength;
}

export function allowableBendingStress(ultimateStrength: number): number {
  return 0.8 * ultimateStrength;
}

export function determineSpringStatus(params: {
  safetyFactor: number;
  targetSf: number;
  bucklingRisk: boolean;
  solidClearance: number;
  surgeMargin: number | null;
  targetSurgeMargin: number;
  indexInRange: boolean;
  fatiguePass?: boolean | null;
}): { designStatus: "safe" | "warning" | "critical"; isSafe: boolean; governing: string } {
  const issues: { label: string; severity: number }[] = [];

  if (params.safetyFactor < params.targetSf) {
    issues.push({ label: "Shear/bending stress", severity: params.targetSf / params.safetyFactor });
  }
  if (params.fatiguePass === false) {
    issues.push({ label: "Fatigue (EN 13906)", severity: 2.5 });
  }
  if (params.bucklingRisk) {
    issues.push({ label: "Buckling", severity: 2 });
  }
  if (params.solidClearance < 0) {
    issues.push({ label: "Solid height clash", severity: 3 });
  }
  if (params.surgeMargin != null && params.surgeMargin < params.targetSurgeMargin) {
    issues.push({ label: "Surge frequency", severity: params.targetSurgeMargin / params.surgeMargin });
  }
  if (!params.indexInRange) {
    issues.push({ label: "Spring index C", severity: 1.5 });
  }

  if (issues.length === 0) {
    return { designStatus: "safe", isSafe: true, governing: "All checks pass" };
  }

  issues.sort((a, b) => b.severity - a.severity);
  const worst = issues[0]!;
  const critical =
    worst.severity >= 2 ||
    params.safetyFactor < params.targetSf * 0.8 ||
    params.solidClearance < 0;
  const warning = !critical && (issues.length > 0 || params.safetyFactor < params.targetSf * 1.1);

  return {
    designStatus: critical ? "critical" : warning ? "warning" : "safe",
    isSafe: !critical && params.safetyFactor >= params.targetSf && params.solidClearance >= 0,
    governing: worst.label,
  };
}
