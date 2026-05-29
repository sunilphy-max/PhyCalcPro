import type { VerificationCase } from "./types";

export function parseVerificationCase(raw: unknown): VerificationCase | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.id !== "string" || typeof c.moduleId !== "string") return null;
  if (typeof c.description !== "string") return null;
  if (!c.inputs || typeof c.inputs !== "object") return null;
  if (!c.expected || typeof c.expected !== "object") return null;
  if (typeof c.tolerancePercent !== "number") return null;

  const expected: Record<string, number> = {};
  for (const [key, value] of Object.entries(c.expected as Record<string, unknown>)) {
    if (typeof value === "number") expected[key] = value;
  }

  return {
    id: c.id,
    moduleId: c.moduleId,
    designCode: c.designCode as VerificationCase["designCode"],
    description: c.description,
    inputs: c.inputs as Record<string, unknown>,
    expected,
    tolerancePercent: c.tolerancePercent,
    source: typeof c.source === "string" ? c.source : undefined,
  };
}

export function aggregateBenchmarkStats(
  results: { moduleId: string; pass: boolean }[]
): Record<string, { passed: number; total: number }> {
  const map: Record<string, { passed: number; total: number }> = {};
  for (const r of results) {
    if (!map[r.moduleId]) map[r.moduleId] = { passed: 0, total: 0 };
    map[r.moduleId].total += 1;
    if (r.pass) map[r.moduleId].passed += 1;
  }
  return map;
}
