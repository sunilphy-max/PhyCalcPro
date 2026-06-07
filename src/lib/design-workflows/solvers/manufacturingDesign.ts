import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
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
    detail: `${(f.clearance * 1000).toFixed(0)} mm`,
  }));
  return fromSweep(sweepCatalogForUtilization(items), "ISO fit class selection for target clearance.");
}

export function designCostProcess(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const processes = [
    { name: "CNC milling", factor: 1.2 },
    { name: "Turning", factor: 0.85 },
    { name: "Casting", factor: 0.65 },
    { name: "Sheet forming", factor: 0.55 },
  ];
  const budget = userInputs.costTarget ?? 100;
  const items = processes.map((p) => ({
    label: p.name,
    utilization: (budget * p.factor) / budget,
    fields: { process: p.name },
    detail: `factor ${p.factor.toFixed(2)}`,
  }));
  return fromSweep(sweepCatalogForUtilization(items), "Manufacturing process screening for cost target.");
}

export function designCamToolpath(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const feeds = [0.05, 0.08, 0.1, 0.15, 0.2];
  const items = feeds.map((f) => {
    const time = (userInputs.length ?? 100) / (f * 1000);
    const util = (userInputs.cycleTimeTarget ?? 60) / Math.max(time, 1);
    return {
      label: `${f.toFixed(2)} mm/rev feed`,
      utilization: util,
      fields: { feed: f },
      detail: `~${time.toFixed(0)} s`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Feed rate sweep for target cycle time.");
}

export function designManufacturingModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "tolerance") return designToleranceStack(userInputs);
  if (moduleId === "fits") return designFitClass(userInputs);
  if (moduleId === "cost-estimator") return designCostProcess(userInputs);
  if (moduleId === "cam-toolpaths") return designCamToolpath(userInputs);
  return designToleranceStack(userInputs);
}
