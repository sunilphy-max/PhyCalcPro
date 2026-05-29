import { getModuleMaturity } from "@/data/moduleMaturity";
import {
  getModuleStandardProfile,
  moduleStandardCatalog,
} from "@/lib/standards/moduleCatalog";
import type { ReleaseTier } from "./types";

export type ModuleGateSummary = {
  moduleId: string;
  title: string;
  releaseTier: ReleaseTier;
  catalogStatus: string;
  validationQuality: number;
  numericalDepth: number;
  maturityBand: string;
  benchmarksPassed: number;
  benchmarksTotal: number;
  notes: string;
};

const TIER_RANK: Record<ReleaseTier, number> = {
  draft: 0,
  indicative: 1,
  beta: 2,
  verified: 3,
  certified: 4,
};

export function compareTiers(a: ReleaseTier, b: ReleaseTier): number {
  return TIER_RANK[a] - TIER_RANK[b];
}

export function computeReleaseTier(
  moduleId: string,
  benchmarkStats?: { passed: number; total: number }
): ReleaseTier {
  const profile = getModuleStandardProfile(moduleId);
  const maturity = getModuleMaturity(moduleId);
  const catalogStatus = profile?.validationStatus ?? "indicative";

  if (catalogStatus === "draft") return "draft";

  const total = benchmarkStats?.total ?? 0;
  const passed = benchmarkStats?.passed ?? 0;
  const allBenchmarksPass = total > 0 && passed === total;

  if (
    catalogStatus === "verified" &&
    allBenchmarksPass &&
    (maturity?.validationQuality ?? 0) >= 4
  ) {
    return "certified";
  }

  if (allBenchmarksPass) return "verified";

  if (catalogStatus === "beta" || catalogStatus === "verified") return "beta";

  return "indicative";
}

export function buildModuleGateSummaries(
  benchmarkByModule: Record<string, { passed: number; total: number }>
): ModuleGateSummary[] {
  return Object.keys(moduleStandardCatalog)
    .map((moduleId) => {
      const profile = getModuleStandardProfile(moduleId);
      const maturity = getModuleMaturity(moduleId);
      const stats = benchmarkByModule[moduleId] ?? { passed: 0, total: 0 };

      return {
        moduleId,
        title: profile?.title ?? moduleId,
        releaseTier: computeReleaseTier(moduleId, stats),
        catalogStatus: profile?.validationStatus ?? "indicative",
        validationQuality: maturity?.validationQuality ?? 1,
        numericalDepth: maturity?.numericalDepth ?? 1,
        maturityBand: maturity?.maturityBand ?? "formula",
        benchmarksPassed: stats.passed,
        benchmarksTotal: stats.total,
        notes: maturity?.notes ?? "",
      };
    })
    .sort((a, b) => compareTiers(b.releaseTier, a.releaseTier) || a.title.localeCompare(b.title));
}

export function releaseTierLabel(tier: ReleaseTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function releaseTierStyles(tier: ReleaseTier): string {
  switch (tier) {
    case "certified":
      return "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-100 dark:border-emerald-800";
    case "verified":
      return "bg-sky-100 text-sky-900 border-sky-200 dark:bg-sky-950/60 dark:text-sky-100 dark:border-sky-800";
    case "beta":
      return "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-100 dark:border-amber-800";
    case "draft":
      return "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700";
  }
}
