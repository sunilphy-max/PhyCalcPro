export * from "./shared";

import type { AdvancedCalculatorDefinition, AdvancedCalculatorId } from "./shared";
import { definition as batteryEvSystems } from "./modules/battery-ev-systems";
import { definition as cryogenicEngineering } from "./modules/cryogenic-engineering";
import { definition as hydrogenSystems } from "./modules/hydrogen-systems";
import { definition as magneticFields } from "./modules/magnetic-fields";
import { definition as precisionMotion } from "./modules/precision-motion";
import { definition as superconductingSystems } from "./modules/superconducting-systems";
import { definition as thermalManagement } from "./modules/thermal-management";
import { definition as vacuumEngineering } from "./modules/vacuum-engineering";

export const advancedSystemCalculators: AdvancedCalculatorDefinition[] = [
  vacuumEngineering,
  cryogenicEngineering,
  magneticFields,
  superconductingSystems,
  thermalManagement,
  batteryEvSystems,
  hydrogenSystems,
  precisionMotion,
];

export function getAdvancedSystemCalculator(id: AdvancedCalculatorId): AdvancedCalculatorDefinition {
  return advancedSystemCalculators.find((calculator) => calculator.id === id) ?? advancedSystemCalculators[0]!;
}
