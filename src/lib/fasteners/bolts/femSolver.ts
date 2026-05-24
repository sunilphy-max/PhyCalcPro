/**
 * Screw Analysis Solver
 * Improved power screw and ball screw calculations with geometry and material awareness
 */

import type { ScrewConfig, ScrewResult, PowerScrewConfig, BallScrewConfig } from "./types";

const DEFAULT_MATERIAL = {
  E: 210e9,
  yieldStrength: 300e6,
  shearStrength: 0.577 * 300e6,
  density: 7850,
};

function threadDepth(threadType: string, pitch: number) {
  switch (threadType) {
    case "acme":
      return 0.4 * pitch;
    case "buttress":
      return 0.45 * pitch;
    case "square":
    default:
      return 0.5 * pitch;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function solveScrewFEM(config: ScrewConfig): ScrewResult {
  const material = {
    ...DEFAULT_MATERIAL,
    ...(config.material ?? {}),
  };

  const majorDiameter = config.majorDiameter;
  const pitch = config.pitch;
  const lead = config.lead > 0 ? config.lead : pitch * (config as PowerScrewConfig).starts || pitch;
  const rootDiameter = Math.max(majorDiameter - 2 * threadDepth((config as PowerScrewConfig).threadType ?? "square", pitch), 0);
  const pitchDiameter = (majorDiameter + rootDiameter) / 2;
  const radius = pitchDiameter / 2;

  const polarMoment = Math.PI * (Math.pow(majorDiameter / 2, 4) - Math.pow(rootDiameter / 2, 4)) / 32;
  const tensileArea = Math.PI * (Math.pow(majorDiameter / 2, 2) - Math.pow(rootDiameter / 2, 2));

  const axialForce = config.axialForce;
  const friction = clamp(config.frictionCoefficient, 0, 1);

  const isPower = config.screwType === "power_screw";

  let torque = 0;
  let efficiency = 0;
  let helixAngle = 0;
  let criticalSpeed = 0;
  let bucklingLoad = 0;
  let power = 0;

  if (isPower) {
    const screw = config as PowerScrewConfig;
    const effectiveLead = screw.lead > 0 ? screw.lead : pitch * (screw.starts || 1);
    const dm = pitchDiameter;
    torque = screw.torque ?? axialForce * (effectiveLead / 2 + friction * dm / 2);
    helixAngle = Math.atan(effectiveLead / (Math.PI * dm)) * (180 / Math.PI);
    efficiency = effectiveLead > 0 ? (effectiveLead / (effectiveLead + Math.PI * friction * dm)) * 100 : 0;
    const K = 1.0;
    const secondMoment = Math.PI * (Math.pow(majorDiameter, 4) - Math.pow(rootDiameter, 4)) / 64;
    bucklingLoad = (Math.PI * Math.PI * material.E * secondMoment) / Math.pow(screw.length * K, 2);
    criticalSpeed = (torque > 0 && screw.speed) ? torque * screw.speed / 1000 : 0;
  } else {
    const screw = config as BallScrewConfig;
    torque = screw.speed ? screw.speed * 0 : axialForce * (lead / (2 * Math.PI) + friction * pitchDiameter / 2);
    helixAngle = Math.atan(lead / (Math.PI * pitchDiameter)) * (180 / Math.PI);
    efficiency = lead > 0 ? (lead / (lead + Math.PI * friction * pitchDiameter)) * 100 : 0;
    const K = 1.0;
    const secondMoment = Math.PI * (Math.pow(majorDiameter, 4) - Math.pow(rootDiameter, 4)) / 64;
    bucklingLoad = (Math.PI * Math.PI * material.E * secondMoment) / Math.pow(screw.lead * K, 2);
    criticalSpeed = (screw.speed > 0) ? screw.speed : 0;
  }

  const tensileStress = axialForce / Math.max(tensileArea, 1e-12);
  const shearStress = torque / Math.max(polarMoment, 1e-12) * radius;
  const vonMisesStress = Math.sqrt(tensileStress * tensileStress + 3 * shearStress * shearStress);

  const safetyFactor = Math.max(material.yieldStrength / Math.max(vonMisesStress, 1e-12), 0.01);
  const designStatus = safetyFactor >= 1.5 ? "safe" : safetyFactor >= 1.2 ? "warning" : "critical";

  power = torque * ((config as BallScrewConfig).speed ? ((config as BallScrewConfig).speed * Math.PI / 30) : 0);

  const recommendations: string[] = [];
  if (safetyFactor < 1.5) {
    recommendations.push("Increase shaft diameter or select higher strength material.");
  }
  if (efficiency < 35) {
    recommendations.push(isPower ? "Consider ball screw or lower friction thread form for higher efficiency." : "Improve lubrication and reduce friction coefficient.");
  }
  if (helixAngle > 15) {
    recommendations.push("High helix angle reduces self-locking stability and increases nut wear.");
  }

  return {
    screwType: config.screwType,
    threadType: (config as PowerScrewConfig).threadType,
    majorDiameter,
    minorDiameter: rootDiameter,
    pitchDiameter,
    pitch,
    lead,
    helixAngle,
    axialForce,
    torque,
    efficiency: clamp(efficiency, 0, 100),
    shearStress,
    compressiveStress: tensileStress,
    vonMisesStress,
    safetyFactor,
    fatigueSafetyFactor: safetyFactor * 0.8,
    power: Math.max(power, 0),
    speed: (config as BallScrewConfig).speed,
    criticalSpeed: Math.max(criticalSpeed, 0),
    bucklingLoad: Math.max(bucklingLoad, 0),
    designStatus,
    recommendations,
  };
}
