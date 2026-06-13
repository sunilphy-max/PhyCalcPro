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
    E: config.material?.E ?? DEFAULT_MATERIAL.E,
    yieldStrength: config.material?.yieldStrength ?? DEFAULT_MATERIAL.yieldStrength,
    ultimateStrength: config.material?.ultimateStrength,
    shearStrength: config.material?.shearStrength ?? DEFAULT_MATERIAL.shearStrength,
    density: config.material?.density ?? DEFAULT_MATERIAL.density,
  };

  const majorDiameter = config.majorDiameter;
  const pitch = config.pitch;
  const lead = config.lead > 0 ? config.lead : pitch * (config as PowerScrewConfig).starts || pitch;
  const rootDiameter = Math.max(majorDiameter - 2 * threadDepth((config as PowerScrewConfig).threadType ?? "square", pitch), 0);
  const pitchDiameter = (majorDiameter + rootDiameter) / 2;
  // Outer fiber of the core section, where torsional shear peaks
  const radius = rootDiameter / 2;

  // Torsional shear is carried by the core of the screw, not the thread; use the
  // root-diameter section (J = π·d_r⁴/32).
  const polarMoment = Math.PI * Math.pow(rootDiameter, 4) / 32;
  // Tensile-stress area per Shigley: A_t = (π/4)·((d_p + d_r)/2)², the area of a
  // circle whose diameter is the mean of pitch and root diameters.
  const tensileDiameter = (pitchDiameter + rootDiameter) / 2;
  const tensileArea = (Math.PI / 4) * Math.pow(tensileDiameter, 2);

  const axialForce = config.axialForce;
  const friction = clamp(config.frictionCoefficient, 0, 1);

  const isPower = config.screwType === "power_screw";

  let torque = 0;
  let efficiency = 0;
  let helixAngle = 0;
  let criticalSpeed = 0;
  let bucklingLoad = 0;
  let power = 0;

  // Lateral (whirling) critical speed of a shaft of length L, simply supported:
  // ω_cr = (π/L)²·√(E·I/(ρ·A)), N_cr [rpm] = 60·ω_cr/(2π). Core section used.
  const whirlingSpeedRpm = (length: number) => {
    if (!(length > 0)) return 0;
    const coreArea = (Math.PI / 4) * Math.pow(rootDiameter, 2);
    const coreI = (Math.PI / 64) * Math.pow(rootDiameter, 4);
    const omega = Math.pow(Math.PI / length, 2) * Math.sqrt((material.E * coreI) / (material.density * coreArea));
    return (60 * omega) / (2 * Math.PI);
  };

  if (isPower) {
    const screw = config as PowerScrewConfig;
    const effectiveLead = screw.lead > 0 ? screw.lead : pitch * (screw.starts || 1);
    const dm = pitchDiameter;
    // Raising torque per Shigley: T = F·dm/2 · (l + π·μ·dm)/(π·dm − μ·l)
    torque = screw.torque ?? (axialForce * dm / 2) *
      ((effectiveLead + Math.PI * friction * dm) / (Math.PI * dm - friction * effectiveLead));
    helixAngle = Math.atan(effectiveLead / (Math.PI * dm)) * (180 / Math.PI);
    // η = F·l / (2π·T): useful work per revolution over input work
    efficiency = torque > 0 ? ((axialForce * effectiveLead) / (2 * Math.PI * torque)) * 100 : 0;
    const K = 1.0; // pinned-pinned end condition
    const secondMoment = (Math.PI / 64) * Math.pow(rootDiameter, 4);
    bucklingLoad = (Math.PI * Math.PI * material.E * secondMoment) / Math.pow(screw.length * K, 2);
    criticalSpeed = whirlingSpeedRpm(screw.length);
  } else {
    // Ideal driving torque F·l/(2π) plus a rolling-friction term on the pitch radius
    torque = axialForce * (lead / (2 * Math.PI) + friction * pitchDiameter / 2);
    helixAngle = Math.atan(lead / (Math.PI * pitchDiameter)) * (180 / Math.PI);
    efficiency = torque > 0 ? ((axialForce * lead) / (2 * Math.PI * torque)) * 100 : 0;
    // Ball screw config carries no unsupported length, so buckling and whirling
    // speed cannot be evaluated; leave them unset rather than report bogus values.
    bucklingLoad = 0;
    criticalSpeed = 0;
  }

  const tensileStress = axialForce / Math.max(tensileArea, 1e-12);
  const shearStress = torque / Math.max(polarMoment, 1e-12) * radius;
  const vonMisesStress = Math.sqrt(tensileStress * tensileStress + 3 * shearStress * shearStress);

  const safetyFactor = Math.max(material.yieldStrength / Math.max(vonMisesStress, 1e-12), 0.01);
  const designStatus = safetyFactor >= 1.5 ? "safe" : safetyFactor >= 1.2 ? "warning" : "critical";

  // Fatigue: treat the duty as pulsating (R = 0), so σ_a = σ_m = σ_vm/2, and apply
  // modified Goodman: 1/n_f = σ_a/S_e + σ_m/S_u. S_e ≈ 0.45·S_u folds a 0.5·S_u
  // endurance limit with ~0.9 combined Marin (surface/size) knockdown.
  const ultimateStrength = material.ultimateStrength ?? 1.5 * material.yieldStrength;
  const enduranceLimit = 0.45 * ultimateStrength;
  const alternatingStress = vonMisesStress / 2;
  const meanStress = vonMisesStress / 2;
  const fatigueSafetyFactor = Math.max(
    1 / Math.max(alternatingStress / enduranceLimit + meanStress / ultimateStrength, 1e-12),
    0.01,
  );

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
    fatigueSafetyFactor,
    power: Math.max(power, 0),
    speed: (config as BallScrewConfig).speed,
    criticalSpeed: Math.max(criticalSpeed, 0),
    bucklingLoad: Math.max(bucklingLoad, 0),
    designStatus,
    recommendations,
  };
}
