import { toBase, fromBase } from "@/lib/units/conversions";
import type { PhysicsDimension } from "@/lib/physics/units";
import { unitsForConverterDimension, type UnitConverterDimensionKey } from "./dimensions";
import type {
  UnitConverterConfig,
  UnitConverterEquivalent,
  UnitConverterResult,
} from "./types";

export function solveUnitConverterEngine(c: UnitConverterConfig): UnitConverterResult {
  const dimension = c.dimension as PhysicsDimension;
  const base = toBase(c.value, dimension, c.fromUnit);
  const converted = fromBase(base, dimension, c.toUnit);
  return {
    convertedValue: converted,
    fromUnit: c.fromUnit,
    toUnit: c.toUnit,
    dimension: c.dimension,
  };
}

/** Express `value` (in `fromUnit`) in every unit for the dimension. */
export function convertToAllUnits(
  value: number,
  dimension: UnitConverterDimensionKey,
  fromUnit: string
): UnitConverterEquivalent[] {
  const base = toBase(value, dimension, fromUnit);
  return unitsForConverterDimension(dimension).map((unit) => ({
    unit,
    value: fromBase(base, dimension, unit),
  }));
}
