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
    validationQuality: 3,
    refactorRisk: "high",
    maturityBand: "fem",
    notes: "Core FEM workflow with broad usage and legacy interfaces.",
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
    validationQuality: 3,
    refactorRisk: "medium",
    maturityBand: "fem",
    notes: "Buckling + FEM hybrid model, manageable migration surface.",
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
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "medium",
    maturityBand: "formula",
    notes: "Established equation set with moderate assumptions.",
  },
  bearings: {
    numericalDepth: 3,
    validationQuality: 2,
    refactorRisk: "low",
    maturityBand: "formula",
    notes: "Predominantly catalog/equation life calculations.",
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
    notes: "Good validators already present; candidate for standard contract.",
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
