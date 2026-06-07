import { getAdvancedSystemCalculator } from "@/lib/advanced-systems/calculators";
import { sweepCatalogForUtilization } from "@/lib/design-workflows/sweepCatalogForUtilization";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type { ModuleDesignModeResult } from "@/lib/design-workflows/designModeRegistry";

function fromSweep(
  sweep: ReturnType<typeof sweepCatalogForUtilization>,
  method: string
): ModuleDesignModeResult {
  return { method, best: sweep.best, ranked: sweep.ranked };
}

function baseValues(userInputs: ModuleUserInputs): Record<string, number> {
  return userInputs.formValues ?? {};
}

function metricValue(result: ReturnType<ReturnType<typeof getAdvancedSystemCalculator>["solve"]>, key: string) {
  const m = result.metrics.find((item) => item.key === key);
  return m?.value ?? 0;
}

export function designThermalManagement(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("thermal-management");
  const base = baseValues(userInputs);
  const heatTarget = userInputs.power ?? metricValue(calc.solve(base), "totalCapacity") * 1.1;
  const hOptions = [40, 60, 80, 100, 120, 150];

  const items = hOptions.map((h) => {
    const res = calc.solve({ ...base, convectionCoefficient: h });
    const capacity = metricValue(res, "totalCapacity");
    const util = heatTarget / Math.max(capacity, 1);
    return {
      label: `h = ${h} W/m²·K`,
      utilization: util,
      fields: { convectionCoefficient: h },
      detail: `${capacity.toFixed(0)} W capacity`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Convection coefficient sweep using live thermal paths and heat-rejection target."
  );
}

export function designVacuumPump(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("vacuum-engineering");
  const base = baseValues(userInputs);
  const targetTime = userInputs.designLife ?? 900;

  const pumps = [
    { label: "Scroll 20 m³/h", pumpSpeed: 20 / 3600 },
    { label: "Turbopump 80 L/s", pumpSpeed: 0.08 },
    { label: "Turbopump 250 L/s", pumpSpeed: 0.25 },
    { label: "Turbopump 500 L/s", pumpSpeed: 0.5 },
  ];

  const items = pumps.map((p) => {
    const res = calc.solve({ ...base, pumpSpeed: p.pumpSpeed });
    const time = metricValue(res, "pumpDownTime");
    return {
      label: p.label,
      utilization: time / targetTime,
      fields: { pumpSpeed: p.pumpSpeed },
      detail: `${(time / 60).toFixed(1)} min pump-down`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Pump speed sweep against chamber volume and pressure ratio using vacuum solver."
  );
}

export function designCryogenicInsulation(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("cryogenic-engineering");
  const base = baseValues(userInputs);
  const maxLeak = userInputs.maxHeatLeak ?? 15;
  const emissivities = [0.12, 0.08, 0.05, 0.03, 0.02, 0.01];

  const items = emissivities.map((e, i) => {
    const res = calc.solve({ ...base, emissivity: e });
    const leak = metricValue(res, "totalHeatLeak");
    return {
      label: `MLI ~${10 + i * 10} layers (ε=${e})`,
      utilization: leak / maxLeak,
      fields: { emissivity: e },
      detail: `Q ${leak.toFixed(1)} W`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Effective emissivity sweep for cryogenic heat-leak target using conduction + radiation paths."
  );
}

export function designMagneticCoil(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("magnetic-fields");
  const base = baseValues(userInputs);
  const targetField = userInputs.targetField ?? 0.05;
  const turnsOptions = [100, 200, 300, 500, 800, 1000];

  const items = turnsOptions.map((n) => {
    const res = calc.solve({ ...base, turns: n });
    const field = metricValue(res, "magneticField");
    const util = targetField / Math.max(field, 1e-12);
    return {
      label: `${n} turns`,
      utilization: util,
      fields: { turns: n },
      detail: `B ${field.toFixed(3)} T`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Turn-count sweep for solenoid field target using electromagnetics solver."
  );
}

export function designBatteryCooling(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("battery-ev-systems");
  const base = baseValues(userInputs);
  const res0 = calc.solve(base);
  const heat = metricValue(res0, "heatGeneration");
  const deltaTs = [4, 6, 8, 10, 12, 15];

  const items = deltaTs.map((dt) => {
    const res = calc.solve({ ...base, coolantDeltaT: dt });
    const flow = metricValue(res, "coolingMassFlow");
    const util = heat / Math.max(flow * (base.coolantCp ?? 3600) * Math.max(dt, 1e-9), 1);
    return {
      label: `ΔT = ${dt} K`,
      utilization: util,
      fields: { coolantDeltaT: dt },
      detail: `flow ${flow.toFixed(3)} kg/s`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Coolant temperature-rise sweep for pack ohmic heat rejection."
  );
}

export function designHydrogenVent(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("hydrogen-systems");
  const base = baseValues(userInputs);
  const leak = userInputs.leakRate ?? metricValue(calc.solve(base), "leakMassFlow");
  const orifices = [5e-7, 1e-6, 2e-6, 5e-6, 1e-5, 2e-5];

  const items = orifices.map((a) => {
    const res = calc.solve({ ...base, orificeArea: a });
    const flow = metricValue(res, "leakMassFlow");
    const util = leak / Math.max(flow, 1e-12);
    return {
      label: `Orifice ${(a * 1e6).toFixed(2)} mm²`,
      utilization: util,
      fields: { orificeArea: a },
      detail: `flow ${flow.toExponential(2)} kg/s`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Leak orifice area sweep for hydrogen relief capacity."
  );
}

export function designPrecisionMotion(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("precision-motion");
  const base = baseValues(userInputs);
  const limit = userInputs.deflectionLimit ?? 1e-6;
  const lengthsMm = [25, 30, 35, 40, 50, 60];

  const items = lengthsMm.map((lMm) => {
    const l = lMm / 1000;
    const res = calc.solve({ ...base, flexureLength: l });
    const k = metricValue(res, "stiffness");
    const load = base.movingMass ? base.movingMass * 9.81 : 20;
    const defl = load / Math.max(k, 1e-9);
    return {
      label: `L = ${lMm} mm flexure`,
      utilization: defl / limit,
      fields: { flexureLength: l },
      detail: `k ${(k / 1e6).toFixed(2)} MN/m`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Flexure length sweep for stiffness and deflection limit."
  );
}

export function designSuperconductingCoil(userInputs: ModuleUserInputs): ModuleDesignModeResult {
  const calc = getAdvancedSystemCalculator("superconducting-systems");
  const base = baseValues(userInputs);
  const energyTarget = userInputs.energy ?? 500;
  const currents = [200, 300, 400, 500, 600, 700];

  const items = currents.map((I) => {
    const res = calc.solve({ ...base, operatingCurrent: I });
    const energy = metricValue(res, "storedEnergy");
    const margin = metricValue(res, "currentMargin");
    const util = Math.max(energyTarget / Math.max(energy, 1), margin < 0 ? 2 : 0.5);
    return {
      label: `${I} A operating`,
      utilization: util,
      fields: { operatingCurrent: I },
      detail: `E ${energy.toFixed(0)} J, I margin ${(margin * 100).toFixed(0)}%`,
    };
  });

  return fromSweep(
    sweepCatalogForUtilization(items),
    "Operating current sweep for stored energy and critical-current margin."
  );
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
