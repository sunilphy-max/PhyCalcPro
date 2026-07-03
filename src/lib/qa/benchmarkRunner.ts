import {
  getModuleSolver,
  supportedSolverModuleIds,
} from "./moduleSolverRegistry";
import type {
  BenchmarkFieldResult,
  BenchmarkRunResult,
  VerificationCase,
  VerificationReport,
} from "./types";

function withinTolerance(actual: number, expected: number, tolerancePercent: number): boolean {
  const base = Math.max(Math.abs(expected), 1e-12);
  const tol = base * (tolerancePercent / 100);
  return Math.abs(actual - expected) <= tol;
}

function getNumeric(
  result: Record<string, unknown>,
  path: string
): number | undefined {
  const value = result[path];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function runVerificationCase(testCase: VerificationCase): BenchmarkRunResult {
  const solver = getModuleSolver(testCase.moduleId);
  if (!solver) {
    return {
      caseId: testCase.id,
      moduleId: testCase.moduleId,
      pass: false,
      error: `No automated solver registered for module "${testCase.moduleId}"`,
      fields: [],
    };
  }

  try {
    const result = solver(testCase.inputs);
    const fields: BenchmarkFieldResult[] = [];
    let pass = true;

    for (const [field, expected] of Object.entries(testCase.expected)) {
      const actual = getNumeric(result, field);
      const fieldPass =
        actual !== undefined && withinTolerance(actual, expected, testCase.tolerancePercent);
      if (!fieldPass) pass = false;
      fields.push({
        field,
        expected,
        actual: actual ?? NaN,
        pass: Boolean(fieldPass),
      });
    }

    return { caseId: testCase.id, moduleId: testCase.moduleId, pass, fields };
  } catch (error) {
    return {
      caseId: testCase.id,
      moduleId: testCase.moduleId,
      pass: false,
      error: error instanceof Error ? error.message : "Solver error",
      fields: [],
    };
  }
}

export function runVerificationCases(cases: VerificationCase[]): VerificationReport {
  const results = cases.map(runVerificationCase);
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass && !r.error?.includes("No automated solver")).length;
  const skipped = results.length - passed - failed;

  return {
    ranAt: new Date().toISOString(),
    total: results.length,
    passed,
    failed,
    skipped,
    results,
  };
}

export function supportedBenchmarkModules(): string[] {
  return supportedSolverModuleIds();
}
