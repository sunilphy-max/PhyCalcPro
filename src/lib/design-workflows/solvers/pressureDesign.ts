import { solvePressurePipeEngine } from "@/lib/pressure/pipes/engine";
import { solvePressureVesselEngine } from "@/lib/pressure/vessels/engine";
import { solveHydraulicsEngine } from "@/lib/pressure/hydraulics/engine";
import { solveHeatExchangerEngine } from "@/lib/pressure/heat-exchangers/engine";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";
import { PRESSURE_ALLOWABLE, STEEL_E } from "@/lib/materials/materialDefaults";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designPipeWall(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const pressure = userInputs.pressure ?? userInputs.maxForce ?? 2.5e6;
  const radius = userInputs.length ?? 0.05;
  const E = userInputs.E ?? STEEL_E;
  const allowable = userInputs.allowableStressPa ?? PRESSURE_ALLOWABLE;
  const thicknessesMm = [3, 4, 5, 6, 8, 10, 12, 16];

  const items = thicknessesMm.map((tMm) => {
    const t = tMm / 1000;
    try {
      const res = solvePressurePipeEngine({
        radius,
        thickness: t,
        length: 1,
        pressure,
        E,
        segments: 16,
      });
      const util = allowable > 0 ? res.maxHoopStress / allowable : 0;
      return {
        label: `${tMm} mm wall`,
        utilization: util,
        fields: { thickness: tMm },
        detail: `sigma ${(res.maxHoopStress / 1e6).toFixed(0)} MPa`,
      };
    } catch {
      return { label: `${tMm} mm`, utilization: 99, fields: { thickness: tMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Pipe wall thickness sweep for hoop stress.");
}

export function designVesselWall(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const pressure = userInputs.pressure ?? 1.6e6;
  const radius = userInputs.length ?? 0.5;
  const E = userInputs.E ?? STEEL_E;
  const allowable = userInputs.allowableStressPa ?? PRESSURE_ALLOWABLE;
  const thicknessesMm = [6, 8, 10, 12, 16, 20, 25];

  const items = thicknessesMm.map((tMm) => {
    const t = tMm / 1000;
    try {
      const res = solvePressureVesselEngine({
        radius,
        thickness: t,
        length: 2,
        pressure,
        E,
        A: Math.PI * ((radius + t) ** 2 - radius ** 2),
        segments: 12,
      });
      const util = allowable > 0 ? res.maxHoopStress / allowable : 0;
      return {
        label: `${tMm} mm`,
        utilization: util,
        fields: { thickness: tMm },
        detail: `hoop ${(res.maxHoopStress / 1e6).toFixed(0)} MPa`,
      };
    } catch {
      return { label: `${tMm} mm`, utilization: 99, fields: { thickness: tMm }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Pressure vessel wall thickness for design pressure.");
}

export function designHydraulicBore(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const force = userInputs.maxForce ?? 50000;
  const pressure = userInputs.pressure ?? 16e6;
  const boresMm = [25, 32, 40, 50, 63, 80, 100];

  const items = boresMm.map((dMm) => {
    const area = Math.PI * ((dMm / 2000) ** 2);
    const capacity = area * pressure;
    const util = force / Math.max(capacity, 1);
    return {
      label: `Ø${dMm} mm bore`,
      utilization: util,
      fields: { bore: dMm },
      detail: `F ${(capacity / 1000).toFixed(1)} kN`,
    };
  });

  return fromSweep(sweepCatalogForUtilization(items), "Hydraulic cylinder bore from force and system pressure.");
}

export function designHeatExchangerUA(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const duty = userInputs.power ?? userInputs.heatDuty ?? 50000;
  const deltaT = userInputs.deltaT ?? 25;
  const requiredUa = duty / Math.max(deltaT, 1);
  const configs = [
    { name: "Plate HX compact", ua: requiredUa * 0.7 },
    { name: "Shell-and-tube standard", ua: requiredUa * 1.0 },
    { name: "Extended surface", ua: requiredUa * 1.3 },
  ];

  const items = configs.map((c) => ({
    label: c.name,
    utilization: requiredUa / c.ua,
    fields: { hxType: c.name },
    detail: `UA ${c.ua.toFixed(0)} W/K`,
  }));

  return fromSweep(sweepCatalogForUtilization(items), "Heat exchanger UA sizing from duty and log-mean delta-T.");
}

export function designPressureModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "pipes") return designPipeWall(userInputs);
  if (moduleId === "vessels") return designVesselWall(userInputs);
  if (moduleId === "hydraulics") return designHydraulicBore(userInputs);
  if (moduleId === "heat-exchangers") return designHeatExchangerUA(userInputs);
  return designPipeWall(userInputs);
}
