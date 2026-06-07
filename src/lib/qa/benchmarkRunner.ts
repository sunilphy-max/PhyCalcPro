import { solveGearEngine } from "@/lib/machine/gears/engine";
import type { GearConfig } from "@/lib/machine/gears/types";
import { solveCompressionSpringEngine } from "@/lib/springs/compression-springs/engine";
import type { CompressionSpringConfig } from "@/lib/springs/compression-springs/types";
import { solveTimingBeltDrive } from "@/lib/powerTransmission/timing-belts/engine";
import type { TimingBeltConfig } from "@/lib/powerTransmission/timing-belts/types";
import { solveBevelGearEngine } from "@/lib/machine/bevel-gears/engine";
import type { BevelGearConfig } from "@/lib/machine/bevel-gears/types";
import { solveKeysSplinesEngine } from "@/lib/fasteners/keys-splines/engine";
import type { KeysSplinesConfig } from "@/lib/fasteners/keys-splines/types";
import { solveCircularPlateEngine } from "@/lib/structural/circular-plates/engine";
import type { CircularPlateConfig } from "@/lib/structural/circular-plates/types";
import { solveShaftEngine } from "@/lib/machine/shafts/engine";
import type { ShaftConfig } from "@/lib/machine/shafts/types";
import { solveBearingEngine } from "@/lib/machine/bearings/engine";
import type { BearingConfig } from "@/lib/machine/bearings/types";
import { solveVBeltDrive } from "@/lib/powerTransmission/v-belts/engine";
import type { VBeltConfig } from "@/lib/powerTransmission/v-belts/types";
import { solvePressurePipeEngine } from "@/lib/pressure/pipes/engine";
import type { PressurePipeConfig } from "@/lib/pressure/pipes/types";
import { solveBucklingEngine } from "@/lib/structural/columns/engine";
import type { BucklingConfig } from "@/lib/structural/columns/types";
import { solveCombinedLoadingEngine } from "@/lib/structural/combinedLoading/engine";
import type { CombinedLoadingConfig } from "@/lib/structural/combinedLoading/types";
import { solveImpactEngine } from "@/lib/dynamics/impact/engine";
import type { ImpactConfig } from "@/lib/dynamics/impact/types";
import { solveFatigueEngine } from "@/lib/materials/fatigue/engine";
import type { FatigueConfig } from "@/lib/materials/fatigue/types";
import { solveCorrosionEngine } from "@/lib/materials/corrosion/engine";
import type { CorrosionConfig } from "@/lib/materials/corrosion/types";
import { solveSuspensionEngine } from "@/lib/dynamics/suspension/engine";
import type { SuspensionConfig } from "@/lib/dynamics/suspension/types";
import { solveRotationEngine } from "@/lib/dynamics/rotation/engine";
import type {
  BenchmarkFieldResult,
  BenchmarkRunResult,
  VerificationCase,
  VerificationReport,
} from "./types";

type SolverFn = (inputs: Record<string, unknown>) => Record<string, unknown>;

const SOLVERS: Record<string, SolverFn> = {
  gears: (inputs) => solveGearEngine(inputs as unknown as GearConfig) as Record<string, unknown>,
  columns: (inputs) => solveBucklingEngine(inputs as unknown as BucklingConfig) as Record<string, unknown>,
  "combined-loading": (inputs) =>
    solveCombinedLoadingEngine(inputs as unknown as CombinedLoadingConfig) as Record<string, unknown>,
  impact: (inputs) => solveImpactEngine(inputs as unknown as ImpactConfig) as Record<string, unknown>,
  fatigue: (inputs) => solveFatigueEngine(inputs as unknown as FatigueConfig) as Record<string, unknown>,
  corrosion: (inputs) => solveCorrosionEngine(inputs as unknown as CorrosionConfig) as Record<string, unknown>,
  suspension: (inputs) =>
    solveSuspensionEngine(inputs as unknown as SuspensionConfig) as Record<string, unknown>,
  rotation: (inputs) =>
    solveRotationEngine(inputs as import("@/lib/dynamics/rotation/types").RotationConfig) as Record<
      string,
      unknown
    >,
  "compression-springs": (inputs) =>
    solveCompressionSpringEngine(inputs as unknown as CompressionSpringConfig) as Record<string, unknown>,
  "timing-belts": (inputs) =>
    solveTimingBeltDrive(inputs as unknown as TimingBeltConfig) as Record<string, unknown>,
  "bevel-gears": (inputs) =>
    solveBevelGearEngine(inputs as unknown as BevelGearConfig) as Record<string, unknown>,
  "keys-splines": (inputs) =>
    solveKeysSplinesEngine(inputs as unknown as KeysSplinesConfig) as Record<string, unknown>,
  "circular-plates": (inputs) =>
    solveCircularPlateEngine(inputs as unknown as CircularPlateConfig) as Record<string, unknown>,
  shafts: (inputs) => solveShaftEngine(inputs as unknown as ShaftConfig) as Record<string, unknown>,
  bearings: (inputs) =>
    solveBearingEngine(inputs as unknown as BearingConfig) as Record<string, unknown>,
  "v-belts": (inputs) =>
    solveVBeltDrive(inputs as unknown as VBeltConfig) as Record<string, unknown>,
  pipes: (inputs) =>
    solvePressurePipeEngine(inputs as unknown as PressurePipeConfig) as Record<string, unknown>,
};

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
  const solver = SOLVERS[testCase.moduleId];
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
  return Object.keys(SOLVERS);
}
