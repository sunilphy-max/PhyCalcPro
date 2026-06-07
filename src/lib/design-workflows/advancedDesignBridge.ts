import { getAdvancedSystemCalculator, type AdvancedCalculatorId } from "@/lib/advanced-systems/calculators";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";

/** Map live advanced calculator form values into design advisor inputs. */
export function buildAdvancedUserInputs(
  calculatorId: AdvancedCalculatorId,
  values: Record<string, number>
): ModuleUserInputs {
  const calc = getAdvancedSystemCalculator(calculatorId);
  const result = calc.solve(values);

  const powerMetric = result.metrics.find((m) =>
    ["totalCapacity", "heatGeneration", "ohmic heat generation"].some((k) =>
      m.key.toLowerCase().includes(k.replace(/\s/g, ""))
    )
  );

  const base: ModuleUserInputs = {
    formValues: values,
    length: values.volume ?? values.flexureLength,
    deltaT: values.deltaT ?? values.coolantDeltaT,
    power: powerMetric?.value ?? values.current,
    current: values.current ?? values.operatingCurrent,
    coilLength: values.coilLength,
    inductance: values.inductance,
    energy: result.metrics.find((m) => m.key === "storedEnergy")?.value ?? result.metrics.find((m) => m.key === "packEnergy")?.value,
    maxForce: values.movingMass,
    deflectionLimit: 1e-6,
    targetField: 0.05,
    maxHeatLeak: 15,
    leakRate: result.metrics.find((m) => m.key === "leakMassFlow")?.value,
    targetSafetyFactor: 2,
    allowableStressPa: 200e6,
  };

  return base;
}

/** Apply ranked design candidate fields back onto the advanced calculator form. */
export function applyAdvancedDesignFields(
  fields: Record<string, unknown>,
  setValues: (updater: (prev: Record<string, number>) => Record<string, number>) => void
) {
  setValues((prev) => {
    const next = { ...prev };
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === "number" && Number.isFinite(value)) {
        next[key] = value;
      }
    }
    return next;
  });
}
