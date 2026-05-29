import type { VerificationReport } from "./types";
import { aggregateBenchmarkStats } from "./loadCases";
import lastRunReport from "@/data/verification/last-run.json";

export function getBenchmarkStatsFromLastRun(): Record<
  string,
  { passed: number; total: number }
> {
  const report = lastRunReport as VerificationReport;
  if (!report?.results?.length) return {};
  return aggregateBenchmarkStats(
    report.results.map((r) => ({ moduleId: r.moduleId, pass: r.pass }))
  );
}

export function getLastVerificationReport(): VerificationReport | null {
  const report = lastRunReport as VerificationReport;
  return report?.results ? report : null;
}
