/**
 * ISO 281-1 variable load spectrum — equivalent load and combined life.
 */

import type { BearingType } from "./types";
import { lifeExponentFor } from "./equivalentLoad";

export type LoadSpectrumStep = {
  /** Fraction of total operating time (0–1); steps should sum to 1. */
  durationFraction: number;
  radialLoad: number;
  axialLoad: number;
  /** Optional speed for this step; defaults to base speed. */
  speedRpm?: number;
};

/** ISO 281-1 equivalent constant load for variable duty. */
export function equivalentLoadFromSpectrum(
  steps: LoadSpectrumStep[],
  bearingType: BearingType,
  calcP: (Fr: number, Fa: number) => number
): number {
  const p = lifeExponentFor(bearingType);
  let weighted = 0;
  let totalFrac = 0;
  for (const step of steps) {
    const frac = Math.max(step.durationFraction, 0);
    if (frac <= 0) continue;
    const P = calcP(Math.abs(step.radialLoad), Math.abs(step.axialLoad));
    weighted += frac * Math.pow(P, p);
    totalFrac += frac;
  }
  if (totalFrac <= 0 || weighted <= 0) return 0;
  return Math.pow(weighted / totalFrac, 1 / p);
}

/** Palmgren-Miner style combined life from per-step lives (hours). */
export function combinedLifeFromSpectrum(
  steps: LoadSpectrumStep[],
  lifeHoursAtStep: (step: LoadSpectrumStep) => number
): number {
  let damage = 0;
  for (const step of steps) {
    const frac = Math.max(step.durationFraction, 0);
    const L = lifeHoursAtStep(step);
    if (frac > 0 && L > 0) damage += frac / L;
  }
  return damage > 0 ? 1 / damage : Infinity;
}

export function normalizeSpectrumSteps(steps: LoadSpectrumStep[]): LoadSpectrumStep[] {
  const total = steps.reduce((s, x) => s + Math.max(x.durationFraction, 0), 0);
  if (total <= 0) return steps;
  return steps.map((s) => ({ ...s, durationFraction: s.durationFraction / total }));
}
