/**
 * Orchestrate life-model ceiling factors (ISO 281 / 16281 screen / stress-life + hybrid).
 */

import type {
  AdvancedLifeFactors,
  BearingConfig,
  BearingLifeMethod,
} from "./types";
import { calculateMisalignmentFactors } from "./misalignmentFactors";
import { calculateIso16281Screen } from "./iso16281Screen";
import { calculateStressLifeFactor } from "./stressLifeScreen";
import { hybridCeramicFactors } from "./hybridCeramic";

export type LifeCeilingInput = {
  config: BearingConfig;
  equivalentLoadN: number;
  dynamicRatingN: number;
  meanDiameterMm: number;
  kappa: number;
  eC: number;
  puOverP: number;
};

export type LifeCeilingResult = {
  lifeMethod: BearingLifeMethod;
  /** Equivalent load used for Lnm / required C. */
  equivalentLoadForLifeN: number;
  /** Effective dynamic rating after hybrid factor (before temp already applied). */
  dynamicRatingForLifeN: number;
  /** Multiplier on aISO for Lnm (aMis · aStress · hybridLife). */
  aAdvanced: number;
  /** Speed limit multiplier from hybrid. */
  speedFactor: number;
  /** Friction scale from hybrid. */
  frictionFactor: number;
  factors: AdvancedLifeFactors;
};

export function resolveLifeModelCeiling(input: LifeCeilingInput): LifeCeilingResult {
  const lifeMethod: BearingLifeMethod = input.config.lifeMethod ?? "iso281";
  const mis = calculateMisalignmentFactors({
    bearingType: input.config.bearingType,
    misalignmentAngleMrad: input.config.misalignmentAngleMrad,
    stationSlopesMrad: input.config.stationSlopesMrad,
  });
  const hybrid = hybridCeramicFactors(input.config.rollingElementMaterial);

  let fClearance = 1;
  let fMisalign = 1;
  let fDistrib = 1;
  let PadjN = input.equivalentLoadN;
  let aStress = 1;
  let aMis = 1;
  let contactPressureProxyMpa: number | null = null;
  const notes: string[] = [];

  if (lifeMethod === "iso16281_screen") {
    const screen = calculateIso16281Screen({
      bearingType: input.config.bearingType,
      equivalentLoadN: input.equivalentLoadN,
      radialLoadN: input.config.radialLoad,
      axialLoadN: input.config.axialLoad,
      boreMm: input.config.boreMm ?? input.meanDiameterMm * 0.6,
      speedRpm: input.config.speed,
      clearance: input.config.clearance,
      operatingClearanceUm: input.config.operatingClearanceUm,
      misalignmentAngleMrad: input.config.misalignmentAngleMrad,
      stationSlopesMrad: input.config.stationSlopesMrad,
      fitOperatingClearanceUm: input.config.fitRecommendation?.estimatedOperatingClearanceUm,
    });
    fClearance = screen.fClearance;
    fMisalign = screen.fMisalign;
    fDistrib = screen.fDistrib;
    PadjN = screen.PadjN;
    aMis = 1; // folded into P
    notes.push(screen.note);
  } else {
    // ISO 281 or stress-life: keep P, apply aMis from misalignment
    aMis = mis.aMis;
    fMisalign = mis.fMisalign;
    if (mis.angleMrad > 0) notes.push(mis.note);

    if (lifeMethod === "stress_life_screen") {
      const stress = calculateStressLifeFactor({
        bearingType: input.config.bearingType,
        equivalentLoadN: input.equivalentLoadN,
        dynamicRatingN: input.dynamicRatingN,
        meanDiameterMm: input.meanDiameterMm,
        kappa: input.kappa > 0 ? input.kappa : 1,
        eC: input.eC > 0 ? input.eC : 0.5,
        puOverP: input.puOverP,
      });
      aStress = stress.aStress;
      contactPressureProxyMpa = stress.contactPressureProxyMpa;
      notes.push(stress.note);
    } else {
      notes.push("ISO 281:2007 basic / modified rating life path.");
    }
  }

  if (hybrid.material !== "steel") notes.push(hybrid.note);

  const aAdvanced = aMis * aStress * hybrid.lifeFactor;
  const dynamicRatingForLifeN = input.dynamicRatingN * hybrid.dynamicRatingFactor;

  const factors: AdvancedLifeFactors = {
    lifeMethod,
    misalignmentUsedMrad: mis.angleMrad,
    misalignmentCapacityMrad: mis.capacityMrad,
    fClearance,
    fMisalign,
    fDistrib,
    PbaseN: input.equivalentLoadN,
    PadjN,
    aStress,
    aMis,
    hybridLifeFactor: hybrid.lifeFactor,
    hybridDynamicRatingFactor: hybrid.dynamicRatingFactor,
    hybridSpeedFactor: hybrid.speedFactor,
    aAdvanced,
    contactPressureProxyMpa,
    note: notes.join(" "),
  };

  return {
    lifeMethod,
    equivalentLoadForLifeN: lifeMethod === "iso16281_screen" ? PadjN : input.equivalentLoadN,
    dynamicRatingForLifeN,
    aAdvanced,
    speedFactor: hybrid.speedFactor,
    frictionFactor: hybrid.frictionFactor,
    factors,
  };
}
