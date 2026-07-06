import type { GearConfig, GearResult } from "./types";
import { runIso6336Rating } from "@/lib/standards/codeChecks/iso6336";

export function getLewisFormFactor(z: number) {
  return Math.max(0.1, 0.484 - 2.87 / z);
}

export function solveGearDesign(config: GearConfig): GearResult {
  const pinionTeeth = Math.max(8, Math.round(config.pinionTeeth));
  const gearTeeth = Math.max(1, Math.round(pinionTeeth * Math.max(config.gearRatio, 1)));
  const actualRatio = gearTeeth / pinionTeeth;
  const pitchDiameterPinion = config.module * pinionTeeth;
  const pitchDiameterGear = config.module * gearTeeth;
  const torque = (60 * config.power) / (2 * Math.PI * Math.max(config.speed, 1));
  const tangentialForce = (2 * torque) / Math.max(pitchDiameterPinion, 1e-9);

  const lewisY = getLewisFormFactor(pinionTeeth);
  const bendingStress = tangentialForce / (config.faceWidth * config.module * lewisY);
  const allowableStress = config.material.yieldStress;
  const safetyFactor = allowableStress / Math.max(bendingStress, 1e-9);

  const radiusPinion = pitchDiameterPinion / 2;
  const radiusGear = pitchDiameterGear / 2;
  const effectiveElastic = config.material.E / (1 - config.material.poisson * config.material.poisson);
  const contactStress = Math.sqrt(
    (tangentialForce / (config.faceWidth * Math.PI)) *
      effectiveElastic *
      (1 / Math.max(radiusPinion, 1e-6) + 1 / Math.max(radiusGear, 1e-6))
  );
  const contactSafetyFactor = allowableStress / Math.max(contactStress, 1e-9);

  // Pitch line velocity v = π·d·n/60 (d in m, n in rpm)
  const pitchLineVelocity = (Math.PI * pitchDiameterPinion * config.speed) / 60;

  // Estimated ultimate strength for steels when only yield is known (S_u ≈ 1.5·S_y)
  const ultimateStrength = allowableStress * 1.5;

  // Tooth-bending endurance: 0.5·S_u rotating-bending limit with ~0.9 combined
  // surface/size knockdown → 0.45·S_u (screening level; ISO 6336-5 σ_FE in Phase 2)
  const bendingFatigueLimit = 0.45 * ultimateStrength;
  const bendingFatigueSafetyFactor = bendingFatigueLimit / Math.max(bendingStress, 1e-9);

  // Contact (pitting) endurance from hardness: HB ≈ S_u/3.45 MPa, and the
  // ISO 6336-5 through-hardened steel fit σ_H,lim ≈ (2·HB + 200) MPa
  const brinellHardness = ultimateStrength / 3.45e6;
  const contactFatigueLimit = (2 * brinellHardness + 200) * 1e6;
  const contactFatigueSafetyFactor = contactFatigueLimit / Math.max(contactStress, 1e-9);

  const ratingOpts = config.rating;
  let iso6336: GearResult["iso6336"];
  let iso6336BendingSafetyFactor: number | undefined;
  let iso6336ContactSafetyFactor: number | undefined;
  let scuffingSafetyFactor: number | null = null;
  let micropittingSafetyFactor: number | null = null;

  if (ratingOpts) {
    const iso = runIso6336Rating({
      tangentialForceN: tangentialForce,
      faceWidthM: config.faceWidth,
      moduleM: config.module,
      z1: pinionTeeth,
      z2: gearTeeth,
      pinionDiameterM: pitchDiameterPinion,
      pitchVelocityMs: pitchLineVelocity,
      ePa: config.material.E,
      poisson: config.material.poisson,
      ultimatePa: ultimateStrength,
      applicationFactor: ratingOpts.applicationFactor,
      faceLoadFactor: ratingOpts.faceLoadFactor,
      qualityGrade: ratingOpts.qualityGrade,
    });
    iso6336 = iso.factors;
    iso6336BendingSafetyFactor = iso.bendingSafetyFactor;
    iso6336ContactSafetyFactor = iso.contactSafetyFactor;

    if (ratingOpts.enableScuffingScreen) {
      const lubricationFactor =
        ratingOpts.lubrication === "oil_bath"
          ? 1.0
          : ratingOpts.lubrication === "oil_mist"
            ? 0.85
            : ratingOpts.lubrication === "grease"
              ? 0.7
              : 0.5;
      const scuffingLimit = 850e6 * lubricationFactor;
      scuffingSafetyFactor = scuffingLimit / Math.max(iso.contactStressPa, 1e-9);
    }
    if (ratingOpts.enableMicropittingScreen) {
      const micropittingLimit = 0.65 * contactFatigueLimit;
      micropittingSafetyFactor = micropittingLimit / Math.max(iso.contactStressPa, 1e-9);
    }
  }

  return {
    pinionTeeth,
    gearTeeth,
    actualRatio,
    module: config.module,
    faceWidth: config.faceWidth,
    pitchDiameterPinion,
    pitchDiameterGear,
    torque,
    tangentialForce,
    lewisY,
    bendingStress,
    allowableStress,
    safetyFactor,
    contactStress,
    contactSafetyFactor,
    pitchLineVelocity,
    bendingFatigueSafetyFactor,
    contactFatigueSafetyFactor,
    material: config.material,
    iso6336,
    iso6336BendingSafetyFactor,
    iso6336ContactSafetyFactor,
    scuffingSafetyFactor,
    micropittingSafetyFactor,
  };
}
