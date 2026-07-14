import type { EquationReference } from "../types";
import { beamsEquations } from "./beams";
import { columnsEquations } from "./columns";
import { gearsEquations } from "./gears";
import { combinedLoadingEquations } from "./combined-loading";
import { weldsEquations } from "./welds";
import { generatedModuleEquations } from "./generated";
import { bearingsEquations } from "./bearings";

const REGISTRY: Record<string, EquationReference[]> = {
  ...generatedModuleEquations,
  bearings: bearingsEquations,
  beams: beamsEquations,
  columns: columnsEquations,
  gears: gearsEquations,
  "combined-loading": combinedLoadingEquations,
  welds: weldsEquations,
};

/** Doc-sourced or hand-curated governing equations for in-app calculation basis. */
export function getModuleEquations(moduleId: string): EquationReference[] {
  return REGISTRY[moduleId] ?? [];
}

export function registerModuleEquations(moduleId: string, equations: EquationReference[]): void {
  REGISTRY[moduleId] = equations;
}

export { beamsEquations, columnsEquations, gearsEquations, combinedLoadingEquations, weldsEquations, bearingsEquations };
