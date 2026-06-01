import { toBase, fromBase } from "@/lib/units/conversions";
import type { PhysicsDimension } from "@/lib/physics/units";
import type { UnitConverterConfig, UnitConverterResult } from "./types";
export function solveUnitConverterEngine(c: UnitConverterConfig): UnitConverterResult {
  const dimension = c.dimension as PhysicsDimension;
  const base = toBase(c.value, dimension, c.fromUnit);
  const converted = fromBase(base, dimension, c.toUnit);
  return { convertedValue: converted, fromUnit: c.fromUnit, toUnit: c.toUnit, dimension: c.dimension };
}
