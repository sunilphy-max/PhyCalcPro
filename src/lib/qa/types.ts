import type { DesignCodeId } from "@/lib/standards/types";

export type VerificationCase = {
  id: string;
  moduleId: string;
  designCode?: DesignCodeId;
  description: string;
  inputs: Record<string, unknown>;
  expected: Record<string, number>;
  tolerancePercent: number;
  source?: string;
};

export type BenchmarkFieldResult = {
  field: string;
  expected: number;
  actual: number;
  pass: boolean;
};

export type BenchmarkRunResult = {
  caseId: string;
  moduleId: string;
  pass: boolean;
  error?: string;
  fields: BenchmarkFieldResult[];
};

export type VerificationReport = {
  ranAt: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: BenchmarkRunResult[];
};

export type ReleaseTier =
  | "draft"
  | "indicative"
  | "beta"
  | "verified"
  | "certified";
