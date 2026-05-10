/**
 * Screw Design Solver
 * Implements power screw and ball screw calculations
 */

import type { ScrewConfig, ScrewResult } from "./types";

export function solvePowerScrew(config: ScrewConfig): ScrewResult {
  if (config.screwType !== "power_screw") {
    throw new Error("Invalid screw type for power screw solver");
  }

  const c = config as any; // Type assertion for power screw config

  // Thread geometry calculations
  const D = c.majorDiameter; // Major diameter
  const p = c.pitch; // Pitch
  const L = c.lead || p; // Lead (default to pitch for single start)
  const n = c.starts || 1; // Number of starts

  // Thread dimensions (simplified)
  const d = D - 2 * (5/8) * p; // Minor diameter approximation
  const d_m = (D + d) / 2; // Pitch diameter

  // Helix angle
  const phi = Math.atan(L / (Math.PI * d_m)) * (180 / Math.PI);

  // Force analysis
  const F = c.axialForce;
  const mu = c.frictionCoefficient;

  // Torque calculation for lifting (simplified)
  const T = (F * d_m / 2) * ((L + Math.PI * mu * d_m) / (Math.PI * d_m - mu * L));

  // Efficiency
  const eta = (L / (L + Math.PI * mu * d_m)) * 100;

  // Stress analysis (simplified)
  const tau = (2 * T) / (Math.PI * d_m * d_m * d_m); // Torsional shear stress
  const sigma_c = F / (Math.PI * d * d / 4); // Compressive stress
  const sigma_vm = Math.sqrt(sigma_c * sigma_c + 3 * tau * tau); // Von Mises

  // Safety factors (simplified - would need material properties)
  const SF = 2.0; // Placeholder
  const SF_fatigue = 1.5; // Placeholder

  // Power calculation
  const omega = (2 * Math.PI * (c.speed || 0)) / 60; // Angular velocity (rad/s)
  const P = T * omega;

  // Critical speed (simplified)
  const N_cr = (3e8 * d) / (L * L); // Rough approximation

  // Buckling load (Euler)
  const E = 200e9; // Steel modulus (Pa)
  const I = Math.PI * d * d * d * d / 64;
  const F_cr = (Math.PI * Math.PI * E * I) / (L * L);

  // Design status
  const designStatus = SF > 1.5 ? "safe" : SF > 1.2 ? "warning" : "critical";

  const recommendations = [];
  if (SF < 1.5) recommendations.push("Increase safety factor by reducing load or increasing diameter");
  if (eta < 30) recommendations.push("Consider ball screw for higher efficiency");
  if (phi > 15) recommendations.push("High helix angle may cause self-locking issues");

  return {
    screwType: "power_screw",
    threadType: c.threadType,
    majorDiameter: D,
    minorDiameter: d,
    pitchDiameter: d_m,
    pitch: p,
    lead: L,
    helixAngle: phi,
    axialForce: F,
    torque: T,
    efficiency: eta,
    shearStress: tau,
    compressiveStress: sigma_c,
    vonMisesStress: sigma_vm,
    safetyFactor: SF,
    fatigueSafetyFactor: SF_fatigue,
    power: P,
    speed: c.speed || 0,
    criticalSpeed: N_cr,
    bucklingLoad: F_cr,
    designStatus,
    recommendations,
  };
}

export function solveBallScrew(config: ScrewConfig): ScrewResult {
  if (config.screwType !== "ball_screw") {
    throw new Error("Invalid screw type for ball screw solver");
  }

  const c = config as any; // Type assertion for ball screw config

  // Thread geometry
  const D = c.majorDiameter;
  const p = c.pitch;
  const L = c.lead || p;
  const d_b = c.ballDiameter;
  const alpha = c.contactAngle * (Math.PI / 180); // Convert to radians

  // Thread dimensions (simplified)
  const d = D - 2 * (5/8) * p;
  const d_m = (D + d) / 2;

  // Helix angle
  const phi = Math.atan(L / (Math.PI * d_m)) * (180 / Math.PI);

  // Force analysis (simplified ball screw mechanics)
  const F = c.axialForce;
  const F_pre = c.preload || 0;
  const mu = c.frictionCoefficient;

  // Torque calculation (simplified)
  const T = (F + F_pre) * d_m / 2 * mu;

  // Efficiency (ball screws are much more efficient)
  const eta = 90; // Typical ball screw efficiency

  // Stress analysis (simplified)
  const tau = (2 * T) / (Math.PI * d_m * d_m * d_m);
  const sigma_c = F / (Math.PI * d * d / 4);
  const sigma_vm = Math.sqrt(sigma_c * sigma_c + 3 * tau * tau);

  // Safety factors
  const SF = 2.5; // Higher for ball screws
  const SF_fatigue = 2.0;

  // Power calculation
  const n = c.speed;
  const omega = (2 * Math.PI * n) / 60;
  const P = T * omega;

  // Ball screw specific calculations
  const ballCirculation = Math.floor(Math.PI * d_m / d_b); // Balls per circuit
  const recirculationPath = "Return tube"; // Simplified

  // Dynamic load rating (simplified)
  const C_a = 1000 * F; // Rough approximation

  // Critical speed
  const N_cr = (4.76e8 * d) / (L * L);

  // Buckling load
  const E = 200e9;
  const I = Math.PI * d * d * d * d / 64;
  const F_cr = (Math.PI * Math.PI * E * I) / (L * L);

  // Design status
  const designStatus = SF > 2.0 ? "safe" : SF > 1.5 ? "warning" : "critical";

  const recommendations = [];
  if (SF < 2.0) recommendations.push("Increase safety factor by reducing load or increasing diameter");
  if (n > N_cr * 0.8) recommendations.push("Operating speed near critical speed - consider redesign");
  if (F_pre < 0.1 * F) recommendations.push("Consider adding preload for better performance");

  return {
    screwType: "ball_screw",
    majorDiameter: D,
    minorDiameter: d,
    pitchDiameter: d_m,
    pitch: p,
    lead: L,
    helixAngle: phi,
    axialForce: F,
    torque: T,
    efficiency: eta,
    shearStress: tau,
    compressiveStress: sigma_c,
    vonMisesStress: sigma_vm,
    safetyFactor: SF,
    fatigueSafetyFactor: SF_fatigue,
    power: P,
    speed: n,
    ballCirculation,
    recirculationPath,
    dynamicLoadRating: C_a,
    criticalSpeed: N_cr,
    bucklingLoad: F_cr,
    designStatus,
    recommendations,
  };
}

export function solveScrew(config: ScrewConfig): ScrewResult {
  switch (config.screwType) {
    case "power_screw":
      return solvePowerScrew(config);
    case "ball_screw":
      return solveBallScrew(config);
    default:
      throw new Error("Unknown screw type");
  }
}
