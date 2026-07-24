import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import { solveCostEstimatorEngine } from "@/lib/manufacturing/costEstimator/engine";
import type { CostEstimatorConfig } from "@/lib/manufacturing/costEstimator/types";
import { solveCamToolpathsEngine } from "@/lib/manufacturing/camToolpaths/engine";
import type { CamToolpathsConfig } from "@/lib/manufacturing/camToolpaths/types";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

function num(values: Record<string, number> | undefined, key: string, fallback: number): number {
  const v = values?.[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export function designToleranceStack(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const tolerances = [0.05, 0.1, 0.15, 0.2, 0.3, 0.5];
  const nominalGap = userInputs.nominalGap ?? 0.5;
  const items = tolerances.map((t) => {
    const worst = nominalGap - 2 * t;
    const util = (userInputs.minGap ?? 0.1) / Math.max(worst, 1e-9);
    return {
      label: `±${t.toFixed(2)} mm`,
      utilization: util,
      fields: { tolerance: t },
      detail: `worst gap ${worst.toFixed(2)} mm`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Tolerance allocation for minimum functional gap.");
}

export function designFitClass(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const fits = [
    { name: "H7/g6", clearance: 0.02, label: "Clearance H7/g6" },
    { name: "H7/k6", clearance: 0.005, label: "Transition H7/k6" },
    { name: "H7/p6", clearance: -0.015, label: "Interference H7/p6" },
  ];
  const required = userInputs.minGap ?? 0.01;
  const items = fits.map((f) => ({
    label: f.label,
    utilization: required / Math.max(f.clearance, 1e-9),
    fields: { fitClass: f.name },
    detail: `${(f.clearance * 1000).toFixed(0)} µm`,
  }));
  return fromSweep(sweepCatalogForUtilization(items), "ISO fit class selection for target clearance.");
}

/** Process / rate catalog ranked by live cost-estimator totalCost vs budget. */
export function designCostProcess(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const fv = userInputs.formValues ?? {};
  const budget = userInputs.costTarget ?? num(fv, "costTarget", 100);
  const base: CostEstimatorConfig = {
    materialVolume: num(fv, "materialVolume", 0.001),
    materialDensity: num(fv, "materialDensity", 7850),
    materialCostPerKg: num(fv, "materialCostPerKg", 2.5),
    machiningTime: num(fv, "machiningTime", 1.2),
    machineRate: num(fv, "machineRate", 80),
    laborTime: num(fv, "laborTime", 0.8),
    laborRate: num(fv, "laborRate", 55),
    finishPercent: num(fv, "finishPercent", 10),
    overheadPercent: num(fv, "overheadPercent", 15),
    scrapPercent: num(fv, "scrapPercent", 5),
  };

  const processes = [
    { name: "CNC milling", machineRate: 95, machiningTime: base.machiningTime * 1.15, laborTime: base.laborTime * 1.1 },
    { name: "Turning", machineRate: 70, machiningTime: base.machiningTime * 0.9, laborTime: base.laborTime * 0.85 },
    { name: "Casting", machineRate: 45, machiningTime: base.machiningTime * 0.45, laborTime: base.laborTime * 0.6, scrapPercent: 12 },
    { name: "Sheet forming", machineRate: 55, machiningTime: base.machiningTime * 0.35, laborTime: base.laborTime * 0.5, scrapPercent: 8 },
  ];

  const items = processes.map((p) => {
    const result = solveCostEstimatorEngine({
      ...base,
      machineRate: p.machineRate,
      machiningTime: p.machiningTime,
      laborTime: p.laborTime,
      scrapPercent: p.scrapPercent ?? base.scrapPercent,
    });
    return {
      label: p.name,
      utilization: result.totalCost / Math.max(budget, 1e-9),
      fields: {
        process: p.name,
        machineRate: p.machineRate,
        machiningTime: p.machiningTime,
        laborTime: p.laborTime,
        scrapPercent: p.scrapPercent ?? base.scrapPercent,
      },
      detail: `$${result.totalCost.toFixed(0)} vs $${budget.toFixed(0)} budget`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Process/rate catalog ranked by live cost-estimator totalCost vs cost target."
  );
}

/** Feed × stepover sweep against live CAM totalCutTime vs cycle target. */
export function designCamToolpath(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const fv = userInputs.formValues ?? {};
  const cycleTarget = userInputs.cycleTimeTarget ?? num(fv, "cycleTimeTarget", 60);
  const base: CamToolpathsConfig = {
    toolDiameter: num(fv, "toolDiameter", 10),
    numFlutes: num(fv, "numFlutes", 4),
    spindleSpeed: num(fv, "spindleSpeed", 6000),
    feedPerTooth: num(fv, "feedPerTooth", 0.08),
    axialDepth: num(fv, "axialDepth", 2),
    radialDepth: num(fv, "radialDepth", 5),
    stockLength: num(fv, "stockLength", userInputs.length ?? 100),
    stockWidth: num(fv, "stockWidth", 40),
    stepOverPercent: num(fv, "stepOverPercent", 40),
  };

  const feeds = [0.04, 0.06, 0.08, 0.1, 0.12, 0.15];
  const stepovers = [30, 40, 50];
  const items = feeds.flatMap((feedPerTooth) =>
    stepovers.map((stepOverPercent) => {
      const result = solveCamToolpathsEngine({ ...base, feedPerTooth, stepOverPercent });
      return {
        label: `fz ${feedPerTooth.toFixed(2)} · ae ${stepOverPercent}%`,
        utilization: result.totalCutTime / Math.max(cycleTarget, 1e-9),
        fields: { feedPerTooth, stepOverPercent },
        detail: `${result.totalCutTime.toFixed(0)} s · MRR ${result.materialRemovalRate.toFixed(0)} mm³/min`,
      };
    })
  );

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Feed/stepover sweep against live CAM totalCutTime vs cycle-time target."
  );
}

export function designManufacturingModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "tolerance") return designToleranceStack(userInputs);
  if (moduleId === "fits") return designFitClass(userInputs);
  if (moduleId === "cost-estimator") return designCostProcess(userInputs);
  if (moduleId === "cam-toolpaths") return designCamToolpath(userInputs);
  return designToleranceStack(userInputs);
}
