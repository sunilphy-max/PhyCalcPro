import type { InternalGearsRackConfig, InternalGearsRackResult } from "./types";

function lewisFormFactorExternal(z: number) {
  return Math.max(0.1, 0.484 - 2.87 / z);
}

/** Internal gears use a higher form factor (pinion works on concave flank). */
function lewisFormFactorInternal(z: number) {
  return Math.max(0.15, 0.55 - 2.2 / z);
}

function lewisFormFactorRack() {
  return 0.32;
}

export function solveInternalGearsRackEngine(
  config: InternalGearsRackConfig
): InternalGearsRackResult {
  const pinionTeeth = Math.max(8, Math.round(config.pinionTeeth));
  const gearTeeth = Math.max(pinionTeeth + 4, Math.round(config.gearTeeth));
  const m = config.module;
  const pitchDiameterPinion = m * pinionTeeth;
  const pitchDiameterGear =
    config.gearType === "rack" ? Infinity : m * gearTeeth;
  const actualRatio =
    config.gearType === "rack" ? Infinity : gearTeeth / pinionTeeth;

  const torque = (60 * config.power) / (2 * Math.PI * Math.max(config.speed, 1));
  const tangentialForce = (2 * torque) / Math.max(pitchDiameterPinion, 1e-9);

  const lewisY =
    config.gearType === "rack"
      ? lewisFormFactorRack()
      : config.gearType === "internal"
        ? lewisFormFactorInternal(pinionTeeth)
        : lewisFormFactorExternal(pinionTeeth);

  const bendingStress = tangentialForce / (config.faceWidth * m * lewisY);
  const allowableStress = config.material.yieldStress;
  const safetyFactor = allowableStress / Math.max(bendingStress, 1e-9);

  const radiusPinion = pitchDiameterPinion / 2;
  const radiusGear =
    config.gearType === "rack" ? radiusPinion * 10 : pitchDiameterGear / 2;
  const effectiveElastic =
    config.material.E / (1 - config.material.poisson * config.material.poisson);
  const contactStress = Math.sqrt(
    (tangentialForce / (config.faceWidth * Math.PI)) *
      effectiveElastic *
      (1 / Math.max(radiusPinion, 1e-6) + 1 / Math.max(radiusGear, 1e-6))
  );
  const contactSafetyFactor = allowableStress / Math.max(contactStress, 1e-9);
  const pitchLineVelocity = (Math.PI * pitchDiameterPinion * config.speed) / 60;

  return {
    gearType: config.gearType,
    pinionTeeth,
    gearTeeth: config.gearType === "rack" ? 0 : gearTeeth,
    actualRatio,
    pitchDiameterPinion,
    pitchDiameterGear: config.gearType === "rack" ? 0 : pitchDiameterGear,
    tangentialForce,
    lewisY,
    bendingStress,
    safetyFactor,
    contactStress,
    contactSafetyFactor,
    pitchLineVelocity,
    material: config.material,
  };
}
