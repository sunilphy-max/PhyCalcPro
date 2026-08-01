import type { ContributorBreakdown, GdtStackConfig, GdtStackResult } from "@/lib/manufacturing/gdt/types";
import { solveGdtStackEngine } from "@/lib/manufacturing/gdt/engine";

export type AllocationTarget = "WC" | "RSS" | "yield";

export type AllocationPackage = {
  id: string;
  label: string;
  description: string;
  /** Scale factors per contributor id (1 = unchanged). */
  scales: Record<string, number>;
  predictedWorstCase: number;
  predictedRss: number;
  predictedYield?: number;
};

/**
 * Scale FCF zone values / size limits for what-if. Returns a new config.
 * Only touches features/frames referenced by contributors.
 */
export function applyContributorScales(
  config: GdtStackConfig,
  scales: Record<string, number>
): GdtStackConfig {
  const featureScale = new Map<string, number>();
  const frameScale = new Map<string, number>();
  for (const c of config.contributors) {
    const s = scales[c.id] ?? 1;
    if (c.source.kind === "size") featureScale.set(c.source.featureOfSizeId, s);
    if (c.source.kind === "fcf") frameScale.set(c.source.fcfId, s);
    if (c.source.kind === "datumShift") featureScale.set(c.source.featureOfSizeId, s);
  }
  return {
    ...config,
    features: config.features.map((f) => {
      const s = featureScale.get(f.id) ?? 1;
      if (s === 1) return f;
      const mid = (f.upperLimit + f.lowerLimit) / 2;
      const half = ((f.upperLimit - f.lowerLimit) / 2) * s;
      return { ...f, upperLimit: mid + half, lowerLimit: mid - half };
    }),
    frames: config.frames.map((fr) => {
      const s = frameScale.get(fr.id) ?? 1;
      if (s === 1) return fr;
      return { ...fr, zoneValue: fr.zoneValue * s };
    }),
  };
}

/**
 * Propose 2–3 allocation packages to meet a WC (or RSS) target.
 * Heuristic: tighten largest WC drivers first. Numbers come from re-solve only.
 */
export function proposeAllocationPackages(
  config: GdtStackConfig,
  baseline: GdtStackResult,
  opts: {
    targetMetric: AllocationTarget;
    targetValueSi: number;
    yieldRequirement?: { minSi?: number; maxSi?: number };
  }
): AllocationPackage[] {
  const drivers = [...baseline.contributors].sort(
    (a, b) => Math.abs(b.effectiveTolerance) - Math.abs(a.effectiveTolerance)
  );
  const packages: AllocationPackage[] = [];

  const tryScales = (scales: Record<string, number>, label: string, description: string) => {
    const next = applyContributorScales(config, scales);
    const result = solveGdtStackEngine({
      ...next,
      requirementMinSi: opts.yieldRequirement?.minSi,
      requirementMaxSi: opts.yieldRequirement?.maxSi ?? opts.targetValueSi,
      monteCarloSamples: opts.targetMetric === "yield" ? config.monteCarloSamples ?? 2000 : 0,
    });
    packages.push({
      id: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      description,
      scales,
      predictedWorstCase: result.worstCase,
      predictedRss: result.rss,
      predictedYield: result.monteCarloYield,
    });
  };

  // Package 1: uniform scale to hit WC target
  const current =
    opts.targetMetric === "RSS" ? baseline.rss : baseline.worstCase;
  if (current > 0 && opts.targetValueSi > 0) {
    const uniform = Math.min(1, opts.targetValueSi / current);
    const scales: Record<string, number> = {};
    for (const c of baseline.contributors) scales[c.id] = uniform;
    tryScales(
      scales,
      "Uniform tighten",
      `Scale all contributors by ${(uniform * 100).toFixed(1)}% to approach target.`
    );
  }

  // Package 2: tighten top 2 drivers more aggressively
  if (drivers.length >= 1) {
    const scales: Record<string, number> = {};
    for (const c of baseline.contributors) scales[c.id] = 1;
    const top = drivers.slice(0, Math.min(2, drivers.length));
    for (const t of top) scales[t.id] = 0.7;
    tryScales(
      scales,
      "Top-driver focus",
      `Reduce top ${top.length} WC driver(s) to 70%; leave others unchanged.`
    );
  }

  // Package 3: progressive by share of WC
  if (baseline.worstCase > 0) {
    const scales: Record<string, number> = {};
    for (const c of baseline.contributors) {
      const share = Math.abs(c.effectiveTolerance) / baseline.worstCase;
      scales[c.id] = share > 0.25 ? 0.65 : share > 0.1 ? 0.85 : 1;
    }
    tryScales(
      scales,
      "Sensitivity-weighted",
      "Tighten high-%-of-WC contributors more; leave small drivers alone."
    );
  }

  return packages;
}

export function explainDriversFromBreakdown(
  contributors: ContributorBreakdown[],
  worstCase: number
): string[] {
  if (worstCase <= 0) return ["No stack variation to explain."];
  return [...contributors]
    .sort((a, b) => Math.abs(b.effectiveTolerance) - Math.abs(a.effectiveTolerance))
    .slice(0, 5)
    .map((c) => {
      const pct = (Math.abs(c.effectiveTolerance) / worstCase) * 100;
      return `${pct.toFixed(1)}% from ${c.label ?? c.id} (${c.kind}${c.characteristic ? `/${c.characteristic}` : ""})`;
    });
}
