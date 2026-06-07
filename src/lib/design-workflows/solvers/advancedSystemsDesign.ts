import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

export function designThermalManagement(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const heat = userInputs.power ?? 850;
  const deltaT = userInputs.deltaT ?? 18;
  const options = [
    { name: "Natural finned sink", conductance: 22 },
    { name: "Forced-air heat sink", conductance: 58 },
    { name: "Liquid cold plate", conductance: 115 },
  ];
  const required = heat / deltaT;
  const items = options.map((o) => ({
    label: o.name,
    utilization: required / o.conductance,
    fields: { coolingType: o.name },
    detail: `need ${required.toFixed(0)} W/K`,
  }));
  return fromSweep(sweepCatalogForUtilization(items), "Thermal solution selection from conductance requirement.");
}

export function designVacuumPump(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const volume = userInputs.length ?? 0.25;
  const ratio = 101325 / 0.1;
  const targetTime = 900;
  const pumps = [
    { name: "Dry scroll 20 m³/h", speed: 20 / 3600 },
    { name: "Turbopump 80 L/s", speed: 0.08 },
    { name: "Turbopump 250 L/s", speed: 0.25 },
  ];
  const items = pumps.map((p) => {
    const time = (volume / p.speed) * Math.log(ratio);
    return {
      label: p.name,
      utilization: time / targetTime,
      fields: { pumpType: p.name },
      detail: `~${(time / 60).toFixed(1)} min`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Vacuum pump selection from pump-down time target.");
}

export function designCryogenicInsulation(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const layers = [10, 20, 30, 40, 60];
  const baseLeak = userInputs.heatLeak ?? 50;
  const items = layers.map((n) => {
    const leak = baseLeak / Math.sqrt(n);
    const util = leak / (userInputs.maxHeatLeak ?? 15);
    return {
      label: `${n} MLI layers`,
      utilization: util,
      fields: { mliLayers: n },
      detail: `Q ${leak.toFixed(1)} W`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "MLI layer count sweep for heat leak target.");
}

export function designMagneticCoil(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const turnsOptions = [100, 200, 300, 500, 800];
  const current = userInputs.current ?? 5;
  const items = turnsOptions.map((n) => {
    const field = 1.256e-6 * n * current / Math.max(userInputs.coilLength ?? 0.1, 1e-9);
    const util = (userInputs.targetField ?? 0.05) / Math.max(field, 1e-12);
    return {
      label: `${n} turns`,
      utilization: util,
      fields: { turns: n },
      detail: `B ${field.toFixed(3)} T`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Coil turn-count sweep for magnetic field target.");
}

export function designBatteryCooling(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const flows = [0.05, 0.1, 0.15, 0.2, 0.3];
  const heat = userInputs.power ?? 2000;
  const items = flows.map((m) => {
    const capacity = m * 4200 * 15;
    const util = heat / Math.max(capacity, 1);
    return {
      label: `${(m * 1000).toFixed(0)} L/min`,
      utilization: util,
      fields: { coolantFlow: m * 1000 },
      detail: `Q ${capacity.toFixed(0)} W`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Coolant flow sweep for pack heat rejection.");
}

export function designHydrogenVent(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const vents = [0.001, 0.002, 0.005, 0.01, 0.02];
  const leak = userInputs.leakRate ?? 0.5;
  const items = vents.map((a) => {
    const ventCap = a * 50;
    const util = leak / Math.max(ventCap, 1e-9);
    return {
      label: `${(a * 1e4).toFixed(1)} cm² vent`,
      utilization: util,
      fields: { ventArea: a * 1e4 },
      detail: `cap ${ventCap.toFixed(2)} g/s`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Vent area sweep for hydrogen leak relief.");
}

export function designPrecisionMotion(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const stiffnesses = [1e5, 2e5, 5e5, 1e6, 2e6];
  const load = userInputs.maxForce ?? 20;
  const items = stiffnesses.map((k) => {
    const defl = load / k;
    const util = defl / (userInputs.deflectionLimit ?? 1e-6);
    return {
      label: `k ${(k / 1e6).toFixed(1)} MN/m`,
      utilization: util,
      fields: { stiffness: k },
      detail: `δ ${(defl * 1e6).toFixed(2)} µm`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Stiffness sweep for precision deflection limit.");
}

export function designSuperconductingCoil(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const currents = [100, 200, 300, 400, 500];
  const items = currents.map((I) => {
    const energy = 0.5 * (userInputs.inductance ?? 0.01) * I * I;
    const util = (userInputs.energy ?? 500) / Math.max(energy, 1);
    return {
      label: `${I} A`,
      utilization: util,
      fields: { current: I },
      detail: `E ${energy.toFixed(0)} J`,
    };
  });
  return fromSweep(sweepCatalogForUtilization(items), "Coil current sweep for stored energy target.");
}

export function designAdvancedModule(moduleId: string, userInputs: ModuleUserInputs): ModuleDesignModeResult {
  if (moduleId === "thermal-management") return designThermalManagement(userInputs);
  if (moduleId === "vacuum-engineering") return designVacuumPump(userInputs);
  if (moduleId === "cryogenic-engineering") return designCryogenicInsulation(userInputs);
  if (moduleId === "magnetic-fields") return designMagneticCoil(userInputs);
  if (moduleId === "battery-ev-systems") return designBatteryCooling(userInputs);
  if (moduleId === "hydrogen-systems") return designHydrogenVent(userInputs);
  if (moduleId === "precision-motion") return designPrecisionMotion(userInputs);
  if (moduleId === "superconducting-systems") return designSuperconductingCoil(userInputs);
  return designThermalManagement(userInputs);
}
