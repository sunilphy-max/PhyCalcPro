/**
 * Grease life L10h vs relubrication interval tf (SKF-style screening).
 * Sealed-for-life → grease life; open / replenishable → relubrication interval.
 */

import { isRollerBearingType } from "@/data/catalogs/bearing/types";
import type { BearingType, ContaminationLevel, LubricantType } from "./types";
import {
  calculateRelubricationInterval,
  type RelubricationInput,
  type RelubricationResult,
} from "./relubrication";

export type GreaseServiceInput = RelubricationInput & {
  /** Grease fill fraction 0.2–0.5 typical; default 0.3. */
  greaseFillFraction?: number;
};

export type GreaseServiceResult = {
  mode: "grease_life" | "relubrication" | "oil_service" | "none";
  /** Sealed / for-life grease L10h estimate (hours). */
  greaseLifeHours: number | null;
  /** Relubrication / replenishment interval tf (hours). */
  relubricationIntervalHours: number | null;
  /** Governing interval shown in status (hours). */
  governingIntervalHours: number;
  speedFactorNdm: number;
  temperatureFactor: number;
  loadFactor: number;
  contaminationFactor: number;
  fillFactor: number;
  status: RelubricationResult["status"];
  note: string;
};

function fillFactor(fraction?: number): number {
  const f = fraction ?? 0.3;
  // Underfill reduces life; overfill increases churning (mild derate above 0.4)
  if (f <= 0.25) return 0.85;
  if (f <= 0.35) return 1;
  if (f <= 0.45) return 0.95;
  return 0.85;
}

/**
 * Compute both grease life and relubrication interval; pick governing mode.
 */
export function calculateGreaseService(input: GreaseServiceInput): GreaseServiceResult {
  const base = calculateRelubricationInterval(input);
  const fFill = fillFactor(input.greaseFillFraction);
  const sealed = input.sealed === true;
  const roller = isRollerBearingType(input.bearingType);

  if (input.lubricantType === "none") {
    return {
      mode: "none",
      greaseLifeHours: null,
      relubricationIntervalHours: null,
      governingIntervalHours: 0,
      speedFactorNdm: base.speedFactorNdm,
      temperatureFactor: base.temperatureFactor,
      loadFactor: base.loadFactor,
      contaminationFactor: base.contaminationFactor,
      fillFactor: fFill,
      status: "ok",
      note: base.note,
    };
  }

  if (input.lubricantType === "oil") {
    return {
      mode: "oil_service",
      greaseLifeHours: null,
      relubricationIntervalHours: base.intervalHours,
      governingIntervalHours: base.intervalHours,
      speedFactorNdm: base.speedFactorNdm,
      temperatureFactor: base.temperatureFactor,
      loadFactor: base.loadFactor,
      contaminationFactor: base.contaminationFactor,
      fillFactor: 1,
      status: base.status,
      note: base.note,
    };
  }

  // Grease path: rebuild base without sealed bonus for tf, with bonus for L10h
  const openInput = { ...input, sealed: false };
  const tfBase = calculateRelubricationInterval(openInput);
  const relubHours = Math.round(tfBase.intervalHours * fFill);

  // Grease life L10h: longer than tf; sealed bearings use ~1.5–2× open tf × fill
  const lifeMul = sealed ? (roller ? 1.8 : 2.2) : roller ? 1.2 : 1.4;
  const greaseLifeHours = Math.round(tfBase.intervalHours * lifeMul * fFill);

  const mode: GreaseServiceResult["mode"] = sealed ? "grease_life" : "relubrication";
  const governing = mode === "grease_life" ? greaseLifeHours : relubHours;

  let status: GreaseServiceResult["status"] = "ok";
  if (governing > 0 && governing < 500) status = "critical";
  else if (governing > 0 && governing < 2000) status = "frequent";

  const note =
    mode === "grease_life"
      ? `Sealed grease life L₁₀h ≈ ${greaseLifeHours.toLocaleString()} h (screening). Relub interval N/A — replace bearing at end of grease life.`
      : `Relubricate every ≈ ${relubHours.toLocaleString()} h; estimated grease fatigue life ≈ ${greaseLifeHours.toLocaleString()} h if not replenished (SKF-style screening).`;

  return {
    mode,
    greaseLifeHours,
    relubricationIntervalHours: sealed ? null : relubHours,
    governingIntervalHours: governing,
    speedFactorNdm: base.speedFactorNdm,
    temperatureFactor: base.temperatureFactor,
    loadFactor: base.loadFactor,
    contaminationFactor: base.contaminationFactor,
    fillFactor: fFill,
    status,
    note,
  };
}
