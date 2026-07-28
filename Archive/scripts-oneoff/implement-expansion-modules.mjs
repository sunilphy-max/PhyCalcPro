/**
 * Writes working engines + functional pages for expansion modules.
 * Run: node scripts/implement-expansion-modules.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function write(rel, content) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// --- SPRINGS ---
write(
  "src/lib/springs/compression-springs/types.ts",
  `export type CompressionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  freeLength: number;
  modulus: number;
  deflection: number;
  ultimateStrength: number;
};
export type CompressionSpringResult = {
  springRate: number;
  solidHeight: number;
  maxLoad: number;
  shearStress: number;
  safetyFactor: number;
  naturalFrequency: number;
};
`
);

write(
  "src/lib/springs/compression-springs/engine.ts",
  `import type { CompressionSpringConfig, CompressionSpringResult } from "./types";

export function solveCompressionSpringEngine(c: CompressionSpringConfig): CompressionSpringResult {
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const n = Math.max(c.activeCoils, 1);
  const G = c.modulus / 2.6;
  const springRate = (G * d ** 4) / (8 * D ** 3 * n);
  const solidHeight = n * d + 2 * d;
  const maxLoad = springRate * c.deflection;
  const C = D / d;
  const Ks = (4 * C - 1) / (4 * C - 4) + 0.615 / C;
  const shearStress = (8 * maxLoad * D * Ks) / (Math.PI * d ** 3);
  const safetyFactor = c.ultimateStrength / Math.max(shearStress, 1e-9);
  const massEstimate = Math.PI * (D ** 2) * n * d * 7850 / 4;
  const naturalFrequency = Math.sqrt(springRate / Math.max(massEstimate, 1e-6)) / (2 * Math.PI);
  return { springRate, solidHeight, maxLoad, shearStress, safetyFactor, naturalFrequency };
}
`
);

write(
  "src/lib/springs/extension-springs/types.ts",
  `export type ExtensionSpringConfig = CompressionSpringConfig;
export type ExtensionSpringResult = CompressionSpringResult & { initialTension: number };
import type { CompressionSpringConfig, CompressionSpringResult } from "../compression-springs/types";
`
);

write(
  "src/lib/springs/extension-springs/engine.ts",
  `import { solveCompressionSpringEngine } from "../compression-springs/engine";
import type { ExtensionSpringConfig, ExtensionSpringResult } from "./types";

export function solveExtensionSpringEngine(c: ExtensionSpringConfig): ExtensionSpringResult {
  const base = solveCompressionSpringEngine(c);
  const initialTension = base.springRate * 0.1 * c.freeLength;
  return { ...base, initialTension };
}
`
);

write(
  "src/lib/springs/torsion-springs/types.ts",
  `export type TorsionSpringConfig = {
  wireDiameter: number;
  meanDiameter: number;
  activeCoils: number;
  legLength: number;
  modulus: number;
  deflectionAngleDeg: number;
  ultimateStrength: number;
};
export type TorsionSpringResult = {
  springRate: number;
  torque: number;
  bendingStress: number;
  safetyFactor: number;
};
`
);

write(
  "src/lib/springs/torsion-springs/engine.ts",
  `import type { TorsionSpringConfig, TorsionSpringResult } from "./types";

export function solveTorsionSpringEngine(c: TorsionSpringConfig): TorsionSpringResult {
  const d = Math.max(c.wireDiameter, 1e-9);
  const D = Math.max(c.meanDiameter, 1e-9);
  const n = Math.max(c.activeCoils, 1);
  const E = c.modulus;
  const springRate = (E * d ** 4) / (116 * D * n);
  const angleRad = (c.deflectionAngleDeg * Math.PI) / 180;
  const torque = springRate * angleRad;
  const bendingStress = (32 * torque) / (Math.PI * d ** 3);
  const safetyFactor = c.ultimateStrength / Math.max(bendingStress, 1e-9);
  return { springRate, torque, bendingStress, safetyFactor };
}
`
);

// --- GEARING ---
write(
  "src/lib/machine/bevel-gears/types.ts",
  `export type BevelGearConfig = { power: number; speed: number; pinionTeeth: number; gearRatio: number; module: number; faceWidth: number; yieldStress: number; pressureAngleDeg: number; };
export type BevelGearResult = { gearTeeth: number; pitchDiameter: number; tangentialForce: number; bendingStress: number; contactStress: number; bendingSafety: number; contactSafety: number; };
`
);

write(
  "src/lib/machine/bevel-gears/engine.ts",
  `import type { BevelGearConfig, BevelGearResult } from "./types";
export function solveBevelGearEngine(c: BevelGearConfig): BevelGearResult {
  const z1 = Math.max(12, Math.round(c.pinionTeeth));
  const z2 = Math.max(z1, Math.round(z1 * c.gearRatio));
  const d = c.module * z1;
  const torque = (60 * c.power) / (2 * Math.PI * Math.max(c.speed, 1));
  const Ft = (2 * torque) / Math.max(d, 1e-9);
  const Y = Math.max(0.15, 0.484 - 2.87 / z1);
  const bendingStress = Ft / (c.faceWidth * c.module * Y);
  const Eeff = 210e9;
  const contactStress = Math.sqrt((Ft / (c.faceWidth * Math.PI)) * Eeff * (2 / Math.max(d, 1e-6)));
  return { gearTeeth: z2, pitchDiameter: d, tangentialForce: Ft, bendingStress, contactStress, bendingSafety: c.yieldStress / Math.max(bendingStress, 1e-9), contactSafety: c.yieldStress / Math.max(contactStress, 1e-9) };
}
`
);

write(
  "src/lib/machine/worm-gears/types.ts",
  `export type WormGearConfig = { power: number; speed: number; wormStarts: number; gearTeeth: number; module: number; faceWidth: number; frictionCoeff: number; leadAngleDeg: number; yieldStress: number; };
export type WormGearResult = { ratio: number; efficiency: number; wormTorque: number; contactStress: number; contactSafety: number; axialForce: number; };
`
);

write(
  "src/lib/machine/worm-gears/engine.ts",
  `import type { WormGearConfig, WormGearResult } from "./types";
export function solveWormGearEngine(c: WormGearConfig): WormGearResult {
  const ratio = Math.max(c.gearTeeth, 1) / Math.max(c.wormStarts, 1);
  const lambda = (c.leadAngleDeg * Math.PI) / 180;
  const mu = c.frictionCoeff;
  const efficiency = Math.tan(lambda) / (Math.tan(lambda) + mu);
  const torque = (60 * c.power) / (2 * Math.PI * Math.max(c.speed, 1) * efficiency);
  const d = c.module * Math.max(c.wormStarts, 1);
  const contactStress = Math.sqrt(((2 * torque) / (d * c.faceWidth)) * 210e9 * 0.001);
  const axialForce = (2 * torque) / Math.max(d, 1e-9);
  return { ratio, efficiency, wormTorque: torque, contactStress, contactSafety: c.yieldStress / Math.max(contactStress, 1e-9), axialForce };
}
`
);

write(
  "src/lib/machine/planetary-gears/types.ts",
  `export type PlanetaryGearConfig = { sunTeeth: number; planetTeeth: number; targetRatio: number; module: number; power: number; speed: number; };
export type PlanetaryGearResult = { ringTeeth: number; actualRatio: number; sunDiameter: number; planetDiameter: number; ringDiameter: number; planetCount: number; };
`
);

write(
  "src/lib/machine/planetary-gears/engine.ts",
  `import type { PlanetaryGearConfig, PlanetaryGearResult } from "./types";
export function solvePlanetaryGearEngine(c: PlanetaryGearConfig): PlanetaryGearResult {
  const zs = Math.max(10, Math.round(c.sunTeeth));
  const zp = Math.max(10, Math.round(c.planetTeeth));
  const zr = zs + 2 * zp;
  const actualRatio = 1 + zr / zs;
  const m = c.module;
  return { ringTeeth: zr, actualRatio, sunDiameter: m * zs, planetDiameter: m * zp, ringDiameter: m * zr, planetCount: Math.max(3, Math.floor(360 / (zp * 2))) };
}
`
);

write(
  "src/lib/machine/gear-ratio-design/types.ts",
  `export type GearRatioDesignConfig = { targetRatio: number; maxTeeth: number; minPinionTeeth: number; };
export type GearRatioDesignResult = { pinionTeeth: number; gearTeeth: number; actualRatio: number; error: number; };
`
);

write(
  "src/lib/machine/gear-ratio-design/engine.ts",
  `import type { GearRatioDesignConfig, GearRatioDesignResult } from "./types";
export function solveGearRatioDesignEngine(c: GearRatioDesignConfig): GearRatioDesignResult {
  let best = { pinionTeeth: c.minPinionTeeth, gearTeeth: c.minPinionTeeth, actualRatio: 1, error: Infinity };
  for (let z1 = c.minPinionTeeth; z1 <= c.maxTeeth; z1++) {
    const z2 = Math.round(z1 * c.targetRatio);
    if (z2 > c.maxTeeth || z2 < z1) continue;
    const ratio = z2 / z1;
    const error = Math.abs(ratio - c.targetRatio);
    if (error < best.error) best = { pinionTeeth: z1, gearTeeth: z2, actualRatio: ratio, error };
  }
  return best;
}
`
);

// --- FASTENERS ---
write(
  "src/lib/fasteners/keys-splines/types.ts",
  `export type KeysSplinesConfig = { torque: number; shaftDiameter: number; keyWidth: number; keyHeight: number; keyLength: number; yieldStress: number; keyType: "parallel" | "spline"; splineTeeth?: number; };
export type KeysSplinesResult = { shearStress: number; bearingStress: number; shearSafety: number; bearingSafety: number; capacityTorque: number; };
`
);

write(
  "src/lib/fasteners/keys-splines/engine.ts",
  `import type { KeysSplinesConfig, KeysSplinesResult } from "./types";
export function solveKeysSplinesEngine(c: KeysSplinesConfig): KeysSplinesResult {
  const d = Math.max(c.shaftDiameter, 1e-9);
  const L = Math.max(c.keyLength, 1e-9);
  const shearArea = c.keyWidth * L;
  const bearingArea = c.keyHeight * L / 2;
  const shearStress = c.torque / (0.5 * d * shearArea);
  const bearingStress = (2 * c.torque) / (d * bearingArea);
  const tauAllow = 0.6 * c.yieldStress;
  const sigmaAllow = 1.5 * c.yieldStress;
  const capacityTorque = Math.min(tauAllow * 0.5 * d * shearArea, sigmaAllow * d * bearingArea / 2);
  return { shearStress, bearingStress, shearSafety: tauAllow / Math.max(shearStress, 1e-9), bearingSafety: sigmaAllow / Math.max(bearingStress, 1e-9), capacityTorque };
}
`
);

write(
  "src/lib/fasteners/shaft-hubs/types.ts",
  `export type ShaftHubConfig = { shaftDiameter: number; hubOuterDiameter: number; hubLength: number; interference: number; frictionCoeff: number; modulus: number; };
export type ShaftHubResult = { contactPressure: number; frictionTorque: number; requiredAssemblyForce: number; };
`
);

write(
  "src/lib/fasteners/shaft-hubs/engine.ts",
  `import type { ShaftHubConfig, ShaftHubResult } from "./types";
export function solveShaftHubEngine(c: ShaftHubConfig): ShaftHubResult {
  const di = Math.max(c.shaftDiameter, 1e-9);
  const do_ = Math.max(c.hubOuterDiameter, di + 1e-6);
  const delta = c.interference;
  const E = c.modulus;
  const C = (do_ ** 2 + di ** 2) / (do_ ** 2 - di ** 2);
  const contactPressure = (E * delta) / (2 * di * C);
  const frictionTorque = contactPressure * Math.PI * di * c.hubLength * c.frictionCoeff * di / 2;
  const requiredAssemblyForce = contactPressure * Math.PI * di * c.hubLength;
  return { contactPressure, frictionTorque, requiredAssemblyForce };
}
`
);

write(
  "src/lib/fasteners/pins/types.ts",
  `export type PinConfig = { force: number; pinDiameter: number; plateThickness: number; pinMaterialYield: number; pinCount: number; };
export type PinResult = { shearStress: number; bearingStress: number; shearSafety: number; bearingSafety: number; };
`
);

write(
  "src/lib/fasteners/pins/engine.ts",
  `import type { PinConfig, PinResult } from "./types";
export function solvePinEngine(c: PinConfig): PinResult {
  const A = Math.PI * (c.pinDiameter / 2) ** 2;
  const shearStress = c.force / (c.pinCount * A);
  const bearingStress = c.force / (c.pinCount * c.pinDiameter * c.plateThickness);
  const tauAllow = 0.6 * c.pinMaterialYield;
  const sigmaAllow = 1.5 * c.pinMaterialYield;
  return { shearStress, bearingStress, shearSafety: tauAllow / Math.max(shearStress, 1e-9), bearingSafety: sigmaAllow / Math.max(bearingStress, 1e-9) };
}
`
);

// --- MACHINE extras ---
write(
  "src/lib/machine/brakes-clutches/types.ts",
  `export type BrakesClutchesConfig = { frictionCoeff: number; outerRadius: number; innerRadius: number; actuationForce: number; speed: number; engagementTime: number; safetyFactorTarget: number; };
export type BrakesClutchesResult = { frictionTorque: number; powerDissipated: number; energyPerStop: number; safetyFactor: number; };
`
);

write(
  "src/lib/machine/brakes-clutches/engine.ts",
  `import type { BrakesClutchesConfig, BrakesClutchesResult } from "./types";
export function solveBrakesClutchesEngine(c: BrakesClutchesConfig): BrakesClutchesResult {
  const ro = c.outerRadius;
  const ri = c.innerRadius;
  const rMean = (2 / 3) * ((ro ** 3 - ri ** 3) / Math.max(ro ** 2 - ri ** 2, 1e-9));
  const frictionTorque = c.frictionCoeff * c.actuationForce * rMean;
  const omega = (2 * Math.PI * c.speed) / 60;
  const powerDissipated = frictionTorque * omega;
  const energyPerStop = powerDissipated * c.engagementTime;
  const safetyFactor = frictionTorque / Math.max(c.actuationForce * c.frictionCoeff * ri, 1e-9);
  return { frictionTorque, powerDissipated, energyPerStop, safetyFactor };
}
`
);

write(
  "src/lib/machine/plain-bearings/types.ts",
  `export type PlainBearingConfig = { load: number; speed: number; diameter: number; length: number; clearance: number; viscosity: number; };
export type PlainBearingResult = { sommerfeldNumber: number; eccentricityRatio: number; minFilmThickness: number; powerLoss: number; status: string; };
`
);

write(
  "src/lib/machine/plain-bearings/engine.ts",
  `import type { PlainBearingConfig, PlainBearingResult } from "./types";
export function solvePlainBearingEngine(c: PlainBearingConfig): PlainBearingResult {
  const r = c.diameter / 2;
  const cRad = c.clearance / 2;
  const omega = (2 * Math.PI * c.speed) / 60;
  const U = (omega * r) / cRad;
  const W = c.load / (c.length * c.diameter);
  const S = (c.viscosity * U) / W;
  const eccentricityRatio = Math.min(0.95, 1 / (1 + S));
  const minFilmThickness = cRad * (1 - eccentricityRatio);
  const powerLoss = c.viscosity * omega ** 2 * r ** 2 * c.length / cRad;
  const status = minFilmThickness > 0.00001 ? "adequate film (indicative)" : "boundary lubrication risk";
  return { sommerfeldNumber: S, eccentricityRatio, minFilmThickness, powerLoss, status };
}
`
);

// --- STRUCTURAL / MATERIALS / TOOLS ---
write(
  "src/lib/structural/circular-plates/types.ts",
  `export type CircularPlateConfig = { radius: number; thickness: number; pressure: number; modulus: number; poisson: number; boundary: "simply_supported" | "clamped"; annularInnerRadius?: number; };
export type CircularPlateResult = { maxDeflection: number; maxStress: number; rigidity: number; };
`
);

write(
  "src/lib/structural/circular-plates/engine.ts",
  `import type { CircularPlateConfig, CircularPlateResult } from "./types";
export function solveCircularPlateEngine(c: CircularPlateConfig): CircularPlateResult {
  const a = Math.max(c.radius, 1e-9);
  const t = Math.max(c.thickness, 1e-9);
  const D = (c.modulus * t ** 3) / (12 * (1 - c.poisson ** 2));
  const alpha = c.boundary === "clamped" ? 0.0138 : 0.171;
  const beta = c.boundary === "clamped" ? 0.75 : 0.75;
  const maxDeflection = (alpha * c.pressure * a ** 4) / D;
  const maxStress = (beta * c.pressure * a ** 2) / (t ** 2);
  return { maxDeflection, maxStress, rigidity: D };
}
`
);

write(
  "src/lib/materials/rolled-sections/types.ts",
  `export type RolledSectionsConfig = { designation: string; };
export type RolledSectionsResult = { area: number; ix: number; iy: number; sx: number; sy: number; weight: number; depth: number; flangeWidth: number; };
`
);

write(
  "src/lib/materials/rolled-sections/data.ts",
  `export const ROLLED_SECTIONS: Record<string, { area: number; ix: number; iy: number; sx: number; sy: number; depth: number; flangeWidth: number; weight: number }> = {
  "W310x97": { area: 0.0123, ix: 2.22e-4, iy: 1.02e-5, sx: 1.44e-3, sy: 1.05e-4, depth: 0.308, flangeWidth: 0.254, weight: 970 },
  "W250x73": { area: 0.00944, ix: 1.14e-4, iy: 5.17e-6, sx: 9.14e-4, sy: 5.84e-5, depth: 0.253, flangeWidth: 0.206, weight: 730 },
  "S310x74": { area: 0.00945, ix: 1.26e-4, iy: 4.49e-6, sx: 8.09e-4, sy: 5.96e-5, depth: 0.305, flangeWidth: 0.204, weight: 740 },
  "C250x45": { area: 0.00568, ix: 4.81e-5, iy: 1.64e-6, sx: 3.86e-4, sy: 2.47e-5, depth: 0.254, flangeWidth: 0.077, weight: 450 },
};
`
);

write(
  "src/lib/materials/rolled-sections/engine.ts",
  `import { ROLLED_SECTIONS } from "./data";
import type { RolledSectionsConfig, RolledSectionsResult } from "./types";
export function solveRolledSectionsEngine(c: RolledSectionsConfig): RolledSectionsResult {
  const section = ROLLED_SECTIONS[c.designation] ?? ROLLED_SECTIONS["W310x97"];
  return { ...section };
}
`
);

write(
  "src/lib/tools/formula-reference/types.ts",
  `export type FormulaReferenceConfig = { formulaId: string; inputs: Record<string, number>; };
export type FormulaReferenceResult = { formulaName: string; expression: string; result: number; unit: string; };
`
);

write(
  "src/lib/tools/formula-reference/formulas.ts",
  `export const FORMULAS: Record<string, { name: string; expression: string; unit: string; calc: (i: Record<string, number>) => number }> = {
  kinetic_energy: { name: "Kinetic energy", expression: "E = 0.5·m·v²", unit: "J", calc: (i) => 0.5 * i.mass * i.velocity ** 2 },
  pump_power: { name: "Pump hydraulic power", expression: "P = Q·Δp", unit: "W", calc: (i) => i.flow * i.pressureDrop },
  thermal_expansion: { name: "Linear thermal expansion", expression: "ΔL = α·L·ΔT", unit: "m", calc: (i) => i.alpha * i.length * i.deltaT },
  friction_force: { name: "Coulomb friction", expression: "F = μ·N", unit: "N", calc: (i) => i.mu * i.normalForce },
};
`
);

write(
  "src/lib/tools/formula-reference/engine.ts",
  `import { FORMULAS } from "./formulas";
import type { FormulaReferenceConfig, FormulaReferenceResult } from "./types";
export function solveFormulaReferenceEngine(c: FormulaReferenceConfig): FormulaReferenceResult {
  const f = FORMULAS[c.formulaId] ?? FORMULAS.kinetic_energy;
  return { formulaName: f.name, expression: f.expression, result: f.calc(c.inputs), unit: f.unit };
}
`
);

write(
  "src/lib/tools/unit-converter/types.ts",
  `export type UnitConverterConfig = { value: number; dimension: string; fromUnit: string; toUnit: string; };
export type UnitConverterResult = { convertedValue: number; fromUnit: string; toUnit: string; dimension: string; };
`
);

write(
  "src/lib/tools/unit-converter/engine.ts",
  `import { toBase, fromBase } from "@/lib/units/conversions";
import type { UnitConverterConfig, UnitConverterResult } from "./types";
export function solveUnitConverterEngine(c: UnitConverterConfig): UnitConverterResult {
  const base = toBase(c.value, c.dimension as "length", c.fromUnit);
  const converted = fromBase(base, c.dimension as "length", c.toUnit);
  return { convertedValue: converted, fromUnit: c.fromUnit, toUnit: c.toUnit, dimension: c.dimension };
}
`
);

console.log("Engines written.");
