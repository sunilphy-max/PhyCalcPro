import { allModules } from "./modules";

export type MaturityBand = "formula" | "fem" | "advanced-numerics";
export type RefactorRisk = "low" | "medium" | "high";

export type ModuleMaturity = {
  moduleId: string;
  numericalDepth: number;
  validationQuality: number;
  refactorRisk: RefactorRisk;
  maturityBand: MaturityBand;
  notes: string;
};

const maturityById: Record<string, Omit<ModuleMaturity, "moduleId">> = {
  beams: {
    numericalDepth: 5,
    validationQuality: 4,
    refactorRisk: "high",
    maturityBand: "fem",
    notes: "Core FEM workflow validated against closed-form benchmarks; AISC 360 Ch. F/G and EC3 §6.2 checks.",
  },
  frames: {
    numericalDepth: 5,
    validationQuality: 3,
    refactorRisk: "high",
    maturityBand: "fem",
    notes: "Matrix-heavy frame solver with tight coupling to UI assumptions.",
  },
  trusses: {
    numericalDepth: 4,
    validationQuality: 3,
    refactorRisk: "medium",
    maturityBand: "fem",
    notes: "Solid structural model with moderate input shape complexity.",
  },
  columns: {
    numericalDepth: 4,
    validationQuality: 4,
    refactorRisk: "medium",
    maturityBand: "fem",
    notes: "Euler-validated FEM buckling with AISC 360 §E3 and EN 1993-1-1 §6.3 curve checks.",
  },
  plates: {
    numericalDepth: 4,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "fem",
    notes: "Advanced mechanics but fewer centralized validations.",
  },
  "combined-loading": {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Closed-form calculations with low solver coupling.",
  },
  "load-case-manager": {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Envelope logic focused on orchestration over deep numerics.",
  },
  shafts: {
    numericalDepth: 4,
    validationQuality: 3,
    refactorRisk: "high",
    maturityBand: "fem",
    notes: "Mechanics + fatigue pipeline with many derived parameters.",
  },
  gears: {
    numericalDepth: 4,
    validationQuality: 3,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Lewis screening plus ISO 6336 Method B/C bending and pitting rating with KV, ZH, ZE, Yeps factors.",
  },
  bearings: {
    numericalDepth: 3,
    validationQuality: 3,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "ISO 281 L10 life with catalog C ratings, a1 reliability and ball/roller exponents.",
  },
  cams: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Kinematic profile logic can evolve into richer optimization.",
  },
  flywheels: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Analytical energy/inertia equations with constrained scope.",
  },
  bolts: {
    numericalDepth: 4,
    validationQuality: 4,
    refactorRisk: "medium",
    maturityBand: "fem",
    notes: "Shigley-benchmarked power screws plus VDI 2230 single-bolt preloaded joint worksheet.",
  },
  welds: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Stress-distribution equations with room for consistency upgrades.",
  },
  rivets: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Limited parameter surface and easy migration path.",
  },
  "safety-factor": {
    numericalDepth: 2,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Simple reserve factor calculations across modules.",
  },
  "material-db": {
    numericalDepth: 2,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Reference-data centric, low computational complexity.",
  },
  sections: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Geometric property equations with many shape variants.",
  },
  composites: {
    numericalDepth: 4,
    validationQuality: 2,
    refactorRisk: "high",
    maturityBand: "advanced-numerics",
    notes: "Domain-rich behavior and higher model/assumption complexity.",
  },
  "temperature-properties": {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Property interpolation layer suitable for shared quantity APIs.",
  },
  fatigue: {
    numericalDepth: 4,
    validationQuality: 2,
    refactorRisk: "high",
    maturityBand: "advanced-numerics",
    notes: "Cycle-life models and assumptions require careful migration.",
  },
  corrosion: {
    numericalDepth: 2,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Conservative allowance equations with straightforward inputs.",
  },
  pipes: {
    numericalDepth: 4,
    validationQuality: 3,
    refactorRisk: "high",
    maturityBand: "fem",
    notes: "Pressure + stress coupling with detailed solver internals.",
  },
  vessels: {
    numericalDepth: 4,
    validationQuality: 3,
    refactorRisk: "medium",
    maturityBand: "fem",
    notes: "Thin/thick-wall logic; clear fit for shared dimension checks.",
  },
  hydraulics: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Primarily equation-driven actuator calculations.",
  },
  "heat-exchangers": {
    numericalDepth: 4,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "advanced-numerics",
    notes: "Thermal correlations and iterative steps benefit from core reuse.",
  },
  vibrations: {
    numericalDepth: 5,
    validationQuality: 3,
    refactorRisk: "high",
    maturityBand: "advanced-numerics",
    notes: "Modal/dynamic solver is a flagship advanced-numerics module.",
  },
  rotation: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Rotational dynamics equations with moderate extensibility.",
  },
  impact: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Transient approximation models; likely to evolve rapidly.",
  },
  suspension: {
    numericalDepth: 4,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "advanced-numerics",
    notes: "Dynamic response logic with tuning and model-variant growth.",
  },
  tolerance: {
    numericalDepth: 2,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Stack-up arithmetic; low migration complexity.",
  },
  fits: {
    numericalDepth: 2,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Lookup/equation blend with stable standards-driven outputs.",
  },
  "cost-estimator": {
    numericalDepth: 2,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Heuristic scoring model; low numerical coupling.",
  },
  "cam-toolpaths": {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Geometric path generation with future optimization potential.",
  },
  "v-belts": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Classical belt drive equations." },
  "timing-belts": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Toothed belt sizing screening." },
  "roller-chains": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Chain drive power and life estimate." },
  "multi-pulley": { numericalDepth: 2, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Wrap angle and length layout." },
  "bevel-gears": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Bevel gear strength screening." },
  "worm-gears": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Worm efficiency and contact stress." },
  "planetary-gears": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Planetary tooth count sizing." },
  "gear-ratio-design": { numericalDepth: 2, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Integer tooth ratio search." },
  "compression-springs": { numericalDepth: 3, validationQuality: 3, refactorRisk: "low", maturityBand: "formula", notes: "EN 13906-1 allowable stress, wire-grade Rm fits, buckling screen; Shigley-benchmarked." },
  "extension-springs": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Extension spring screening." },
  "torsion-springs": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Torsion spring leg bending." },
  "keys-splines": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Key shear and bearing capacity." },
  "shaft-hubs": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Interference fit pressure estimate." },
  pins: { numericalDepth: 2, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Pin shear and bearing checks." },
  "brakes-clutches": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Friction torque and energy." },
  "plain-bearings": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Sommerfeld journal bearing screening." },
  "circular-plates": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Circular plate closed-form deflection." },
  "rolled-sections": { numericalDepth: 2, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Catalog section lookup." },
  "formula-reference": { numericalDepth: 1, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Formula hub and mini calculators." },
  "unit-converter": { numericalDepth: 1, validationQuality: 3, refactorRisk: "low", maturityBand: "formula", notes: "Shared unit conversion layer." },
  "vacuum-engineering": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Ideal gas pump-down and molecular conductance screening." },
  "cryogenic-engineering": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Lumped heat leak, boil-off and cooldown estimates." },
  "magnetic-fields": { numericalDepth: 3, validationQuality: 2, refactorRisk: "low", maturityBand: "formula", notes: "Long-solenoid and coil energy screening." },
  "superconducting-systems": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Scalar superconducting margin and dump screening." },
  "thermal-management": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Lumped conduction, convection, radiation and coolant estimates." },
  "battery-ev-systems": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Battery pack electrical and thermal screening." },
  "hydrogen-systems": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Ideal gas hydrogen storage and vent screening." },
  "precision-motion": { numericalDepth: 3, validationQuality: 2, refactorRisk: "medium", maturityBand: "formula", notes: "Flexure stiffness and SDOF vibration screening." },
};

export const moduleMaturityMatrix: ModuleMaturity[] = allModules.map((module) => {
  const maturity = maturityById[module.id];
  if (!maturity) {
    return {
      moduleId: module.id,
      numericalDepth: 1,
      validationQuality: 1,
      refactorRisk: "high",
      maturityBand: "formula",
      notes: "Unclassified module. Add explicit maturity metadata.",
    };
  }

  return {
    moduleId: module.id,
    ...maturity,
  };
});

export function getModuleMaturity(moduleId: string): ModuleMaturity | undefined {
  return moduleMaturityMatrix.find((entry) => entry.moduleId === moduleId);
}

export const maturitySummary = {
  formula: moduleMaturityMatrix.filter((m) => m.maturityBand === "formula").length,
  fem: moduleMaturityMatrix.filter((m) => m.maturityBand === "fem").length,
  advancedNumerics: moduleMaturityMatrix.filter((m) => m.maturityBand === "advanced-numerics").length,
};
