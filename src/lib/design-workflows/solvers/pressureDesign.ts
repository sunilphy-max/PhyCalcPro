import { solvePressurePipeEngine } from "@/lib/pressure/pipes/engine";
import { solvePressureVesselEngine } from "@/lib/pressure/vessels/engine";
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

/** Schedule-like wall thicknesses (mm) for pipe Auto-design. */
const PIPE_WALL_MM = [2.11, 2.77, 3.4, 3.91, 4.78, 5.54, 6.35, 7.11, 8.74, 9.53, 11.13, 12.7, 15.09, 17.48, 21.44];
const VESSEL_WALL_MM = [4, 5, 6, 8, 10, 12, 14, 16, 20, 25, 30, 40];
const HYDRAULIC_BORES_MM = [25, 32, 40, 50, 63, 80, 100, 125, 160];

/**
 * Pipe wall thickness sweep for hoop stress vs allowable.
 * Apply field `thickness` is in **meters** (pipes page).
 * `userInputs.length` is interpreted as inner/mean radius (m).
 */
export function designPipeWall(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const pressure = userInputs.pressure ?? userInputs.maxForce ?? 2.5e6;
  const r =
    typeof userInputs.length === "number"
      ? userInputs.length
      : typeof userInputs.diameter === "number"
        ? userInputs.diameter / 2
        : 0.05;
  const E = userInputs.E ?? STEEL_E;
  const allowable = userInputs.allowableStressPa ?? PRESSURE_ALLOWABLE;

  const items = PIPE_WALL_MM.map((tMm) => {
    const t = tMm / 1000;
    try {
      const res = solvePressurePipeEngine({
        radius: r,
        thickness: t,
        length: 1,
        pressure,
        E,
        segments: 16,
      });
      const util = allowable > 0 ? res.maxHoopStress / allowable : 0;
      return {
        label: `${tMm.toFixed(2)} mm wall`,
        utilization: util,
        fields: { thickness: t },
        detail: `σ_h ${(res.maxHoopStress / 1e6).toFixed(0)} MPa · util ${(util * 100).toFixed(0)}%`,
      };
    } catch {
      return { label: `${tMm} mm`, utilization: 99, fields: { thickness: t }, detail: "invalid" };
    }
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Pipe schedule-like wall thickness sweep for hoop stress vs allowable."
  );
}

/** Vessel wall in **meters** when applied to vessels page (check page units). */
export function designVesselWall(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const pressure = userInputs.pressure ?? 1.6e6;
  const radius = userInputs.length ?? 0.5;
  const E = userInputs.E ?? STEEL_E;
  const allowable = userInputs.allowableStressPa ?? PRESSURE_ALLOWABLE;

  const items = VESSEL_WALL_MM.map((tMm) => {
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
        fields: { thickness: t },
        detail: `hoop ${(res.maxHoopStress / 1e6).toFixed(0)} MPa`,
      };
    } catch {
      return { label: `${tMm} mm`, utilization: 99, fields: { thickness: t }, detail: "invalid" };
    }
  });

  return fromSweep(sweepCatalogForUtilization(items), "Pressure vessel wall thickness for design pressure.");
}

export function designHydraulicBore(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const force = userInputs.maxForce ?? 50000;
  const pressure = userInputs.pressure ?? 16e6;

  const items = HYDRAULIC_BORES_MM.map((dMm) => {
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
  const U = 500; // W/m²·K screening U
  const areas = [2, 4, 6, 8, 10, 14, 20];
  const margin = userInputs.targetSafetyFactor ?? 1.1;

  const items = areas.map((area) => {
    try {
      const res = solveHeatExchangerEngine({
        hotFlowRate: 1.2,
        coldFlowRate: 1.5,
        hotCp: 4180,
        coldCp: 4180,
        hotInletTemp: 80,
        coldInletTemp: 20,
        hotOutletTemp: 80 - duty / (1.2 * 4180),
        U,
        area,
        flowType: "counterflow",
      });
      const capacity = res.U * res.area * Math.max(res.LMTD || deltaT, 1);
      const util = (duty * margin) / Math.max(capacity, 1);
      return {
        label: `A = ${area} m²`,
        utilization: util,
        fields: { area, ua: res.U * res.area, hxType: "Shell-and-tube" },
        detail: `UA ${(res.U * res.area).toFixed(0)} · ε ${(res.effectiveness * 100).toFixed(0)}%`,
      };
    } catch {
      return { label: `${area} m²`, utilization: 99, fields: { area }, detail: "invalid" };
    }
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Heat exchanger area sweep ranked by live LMTD/NTU capacity vs heat duty."
  );
}

export function designPressureModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "pipes") return designPipeWall(userInputs);
  if (moduleId === "vessels") return designVesselWall(userInputs);
  if (moduleId === "hydraulics") return designHydraulicBore(userInputs);
  if (moduleId === "heat-exchangers") return designHeatExchangerUA(userInputs);
  return designPipeWall(userInputs);
}
