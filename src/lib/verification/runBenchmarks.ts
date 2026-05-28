import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import type { DesignCodeId } from "@/lib/standards/types";
import { withinTolerance } from "@/lib/calculation/referenceCases";

export type VerificationCase = {
  id: string;
  moduleId: string;
  designCode: DesignCodeId;
  description: string;
  inputs: Record<string, unknown>;
  expected: Record<string, number>;
  tolerancePercent: number;
  source: string;
  /** Optional: name of solver function key in moduleSolvers map */
  solver?: string;
};

const VERIFICATION_DIR = join(process.cwd(), "src/data/verification");

export function loadVerificationCases(): VerificationCase[] {
  if (!existsSync(VERIFICATION_DIR)) return [];

  const cases: VerificationCase[] = [];
  for (const file of readdirSync(VERIFICATION_DIR)) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = JSON.parse(readFileSync(join(VERIFICATION_DIR, file), "utf8")) as VerificationCase;
      if (raw.id && raw.moduleId && raw.expected) cases.push(raw);
    } catch {
      // skip invalid files
    }
  }
  return cases;
}

export function evaluateCase(
  actual: Record<string, number>,
  expected: VerificationCase["expected"],
  tolerancePercent: number
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  for (const [key, expectedValue] of Object.entries(expected)) {
    const actualValue = actual[key];
    if (actualValue == null || !Number.isFinite(actualValue)) {
      failures.push(`${key}: missing actual value`);
      continue;
    }
    if (!withinTolerance(actualValue, expectedValue, tolerancePercent)) {
      failures.push(
        `${key}: expected ${expectedValue}, got ${actualValue} (>${tolerancePercent}% error)`
      );
    }
  }
  return { passed: failures.length === 0, failures };
}
