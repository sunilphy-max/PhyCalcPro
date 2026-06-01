import type { GearConfig, GearResult } from "./types";

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

  const pitchLineVelocity = (Math.PI * pitchDiameterPinion * config.speed) / 60000;
  const scuffingIndex = tangentialForce * pitchLineVelocity / Math.max(config.faceWidth, 1e-9);
  const scuffingLimit = 5000;
  const scuffingSafetyFactor = scuffingLimit / Math.max(scuffingIndex, 1e-9);

  const bendingFatigueLimit = allowableStress * 0.4;
  const bendingFatigueSafetyFactor = bendingFatigueLimit / Math.max(bendingStress, 1e-9);
  const contactFatigueLimit = allowableStress * 0.35;
  const contactFatigueSafetyFactor = contactFatigueLimit / Math.max(contactStress, 1e-9);

  const oilFilmParam = pitchLineVelocity * Math.sqrt(contactStress / 1e6);
  const micropittingLimit = 8;
  const micropittingIndex = oilFilmParam / Math.max(config.faceWidth * 1000, 1e-9);
  const micropittingSafetyFactor = micropittingLimit / Math.max(micropittingIndex, 1e-9);

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
    scuffingSafetyFactor,
    bendingFatigueSafetyFactor,
    contactFatigueSafetyFactor,
    micropittingSafetyFactor,
    micropittingIndex,
  };
}
