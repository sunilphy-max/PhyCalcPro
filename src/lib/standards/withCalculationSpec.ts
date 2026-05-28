import type { DesignCodeId } from "./types";
import { attachModuleCalculationSpec } from "./evaluators/generic";
import { attachBeamCalculationSpec } from "./evaluators/beams";
import { attachGearCalculationSpec } from "./evaluators/gears";

const MODULE_SPECIFIC: Partial<
  Record<string, (result: Record<string, unknown>, designCode: DesignCodeId) => Record<string, unknown>>
> = {
  beams: (r, code) => attachBeamCalculationSpec(r as never, code) as Record<string, unknown>,
  gears: (r, code) => attachGearCalculationSpec(r as never, code) as Record<string, unknown>,
};

export function withCalculationSpec<T extends object>(
  moduleId: string,
  designCode: DesignCodeId,
  result: T
): T & { calculationSpec: import("./types").CalculationSpec } {
  const specific = MODULE_SPECIFIC[moduleId];
  if (specific) {
    return specific(result as Record<string, unknown>, designCode) as T & {
      calculationSpec: import("./types").CalculationSpec;
    };
  }
  return attachModuleCalculationSpec(
    moduleId,
    designCode,
    result as Record<string, unknown>
  ) as T & { calculationSpec: import("./types").CalculationSpec };
}
