import { FORMULAS } from "./formulas";
import type { FormulaReferenceConfig, FormulaReferenceResult } from "./types";
export function solveFormulaReferenceEngine(c: FormulaReferenceConfig): FormulaReferenceResult {
  const f = FORMULAS[c.formulaId] ?? FORMULAS.kinetic_energy;
  return { formulaName: f.name, expression: f.expression, result: f.calc(c.inputs), unit: f.unit };
}
