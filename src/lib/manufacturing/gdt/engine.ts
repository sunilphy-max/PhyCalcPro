import {
  datumShiftBonus,
  geometricBonus,
  sizeToleranceWidth,
  worstCaseBonusSize,
} from "./bonus";
import type {
  ContributorBreakdown,
  ContributorDistribution,
  ContributorSensitivity,
  FeatureControlFrame,
  FeatureOfSize,
  GdtStackConfig,
  GdtStackResult,
  StackAxis,
  StackContributor,
} from "./types";

function randomNormal(): number {
  // Box–Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function sampleHalfDeviation(
  halfTol: number,
  distribution: ContributorDistribution,
  sigma?: number
): number {
  if (halfTol <= 0) return 0;
  if (distribution === "normal") {
    const s = sigma ?? halfTol / 3;
    return randomNormal() * s;
  }
  if (distribution === "triangular") {
    // Symmetric triangular on [-half, half]
    const u = Math.random();
    const t = u < 0.5 ? Math.sqrt(2 * u) - 1 : 1 - Math.sqrt(2 * (1 - u));
    return t * halfTol;
  }
  // uniform
  return (Math.random() * 2 - 1) * halfTol;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[idx]!;
}

function byId<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

function resolveSizeHalfTol(feature: FeatureOfSize): number {
  return sizeToleranceWidth(feature) / 2;
}

function resolveContributor(
  contributor: StackContributor,
  config: GdtStackConfig
): ContributorBreakdown {
  const useWorstCase = config.useWorstCaseBonus !== false;
  const projection = Math.abs(contributor.projectionFactor ?? 1);

  if (contributor.source.kind === "size") {
    const feature = byId(config.features, contributor.source.featureOfSizeId);
    if (!feature) {
      throw new Error(`Unknown feature of size: ${contributor.source.featureOfSizeId}`);
    }
    const half = resolveSizeHalfTol(feature) * projection;
    return {
      id: contributor.id,
      label: contributor.label ?? feature.label ?? feature.id,
      axis: contributor.axis,
      sense: contributor.sense,
      specifiedTolerance: half,
      bonus: 0,
      effectiveTolerance: half,
      kind: "size",
      characteristic: "size",
    };
  }

  if (contributor.source.kind === "datumShift") {
    const { datumId, featureOfSizeId } = contributor.source;
    const feature = byId(config.features, featureOfSizeId);
    if (!feature) {
      throw new Error(`Unknown datum feature: ${featureOfSizeId}`);
    }
    const frameWithDatum = config.frames.find((f) =>
      f.datumRefs.some((r) => r.datumId === datumId)
    );
    const mc =
      frameWithDatum?.datumRefs.find((r) => r.datumId === datumId)?.materialCondition ?? "MMC";
    const actual = config.actualSizes?.[feature.id];
    const bonus = datumShiftBonus(feature, mc, actual, useWorstCase) * projection;
    return {
      id: contributor.id,
      label: contributor.label ?? `Datum ${datumId} shift`,
      axis: contributor.axis,
      sense: contributor.sense,
      specifiedTolerance: 0,
      bonus,
      effectiveTolerance: bonus,
      kind: "datumShift",
    };
  }

  const frame = byId(config.frames, contributor.source.fcfId);
  if (!frame) {
    throw new Error(`Unknown FCF: ${contributor.source.fcfId}`);
  }
  return resolveFcfContributor(contributor, frame, config, useWorstCase, projection);
}

function resolveFcfContributor(
  contributor: StackContributor,
  frame: FeatureControlFrame,
  config: GdtStackConfig,
  useWorstCase: boolean,
  projection: number
): ContributorBreakdown {
  const specified = (frame.zoneValue / 2) * projection;
  let sizeBonus = 0;

  if (frame.featureOfSizeId && frame.materialCondition !== "RFS") {
    const feature = byId(config.features, frame.featureOfSizeId);
    if (feature) {
      const actual =
        config.actualSizes?.[feature.id] ??
        (useWorstCase
          ? worstCaseBonusSize(feature, frame.materialCondition)
          : feature.nominal);
      sizeBonus = geometricBonus(feature, frame.materialCondition, actual);
    }
  }

  // Bonus enlarges the tolerance zone; stack contribution uses half-zone.
  const zoneWithBonus = frame.zoneValue + sizeBonus;
  const effective = (zoneWithBonus / 2) * projection;
  const bonusContribution = effective - specified;

  return {
    id: contributor.id,
    label: contributor.label ?? frame.label ?? frame.id,
    axis: contributor.axis,
    sense: contributor.sense,
    specifiedTolerance: specified,
    bonus: bonusContribution,
    effectiveTolerance: effective,
    kind: "fcf",
    characteristic: frame.characteristic,
  };
}

function aggregateAxis(
  rows: ContributorBreakdown[],
  axis: StackAxis
): { worstCase: number; rss: number } | null {
  const axisRows = rows.filter((r) => r.axis === axis);
  if (axisRows.length === 0) return null;
  const tols = axisRows.map((r) => Math.abs(r.effectiveTolerance));
  return {
    worstCase: tols.reduce((a, b) => a + b, 0),
    rss: Math.sqrt(tols.reduce((a, b) => a + b * b, 0)),
  };
}

/**
 * GD&T-aware tolerance stack-up: size dims, FCF zones with MMC/LMC bonus,
 * and datum-feature shift. Aggregates WC / RSS / optional Monte Carlo.
 */
export function solveGdtStackEngine(config: GdtStackConfig): GdtStackResult {
  const contributors = config.contributors.map((c) => resolveContributor(c, config));
  const x = aggregateAxis(contributors, "X") ?? { worstCase: 0, rss: 0 };
  const y = aggregateAxis(contributors, "Y");
  const z = aggregateAxis(contributors, "Z");

  const worstCase3d =
    y || z
      ? Math.sqrt(x.worstCase ** 2 + (y?.worstCase ?? 0) ** 2 + (z?.worstCase ?? 0) ** 2)
      : undefined;
  const rss3d =
    y || z ? Math.sqrt(x.rss ** 2 + (y?.rss ?? 0) ** 2 + (z?.rss ?? 0) ** 2) : undefined;

  let monteCarloMean: number | undefined;
  let monteCarloStdDev: number | undefined;
  let monteCarloPercentile95: number | undefined;
  let monteCarloYield: number | undefined;
  const samples = config.monteCarloSamples ?? 0;
  if (samples > 0) {
    const defaultDist: ContributorDistribution = config.defaultDistribution ?? "uniform";
    const draws: number[] = [];
    let inSpec = 0;
    const hasReq =
      config.requirementMinSi !== undefined || config.requirementMaxSi !== undefined;
    for (let i = 0; i < samples; i++) {
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (const row of contributors) {
        const stats = config.contributorStats?.[row.id];
        const dist = stats?.distribution ?? defaultDist;
        let sigma = stats?.processSigma;
        if (sigma === undefined && stats?.cpk && stats.cpk > 0) {
          // Full band ≈ 2 * halfTol; σ = band / (6 Cpk)
          sigma = (2 * Math.abs(row.effectiveTolerance)) / (6 * stats.cpk);
        }
        const d = sampleHalfDeviation(Math.abs(row.effectiveTolerance), dist, sigma);
        if (row.axis === "X") sx += row.sense * d;
        else if (row.axis === "Y") sy += row.sense * d;
        else sz += row.sense * d;
      }
      const mag = Math.sqrt(sx ** 2 + sy ** 2 + sz ** 2);
      draws.push(mag);
      if (hasReq) {
        const lo = config.requirementMinSi ?? Number.NEGATIVE_INFINITY;
        const hi = config.requirementMaxSi ?? Number.POSITIVE_INFINITY;
        // Yield vs magnitude requirement: treat requirementMax as max allowed mag when min omitted
        if (mag >= lo && mag <= hi) inSpec += 1;
      }
    }
    monteCarloMean = draws.reduce((a, b) => a + b, 0) / draws.length;
    monteCarloStdDev = Math.sqrt(
      draws.reduce((sum, v) => sum + (v - monteCarloMean!) ** 2, 0) / draws.length
    );
    const sorted = [...draws].sort((a, b) => a - b);
    monteCarloPercentile95 = percentile(sorted, 0.95);
    if (hasReq) monteCarloYield = inSpec / draws.length;
  }

  const sensitivity: ContributorSensitivity[] | undefined =
    x.worstCase > 0
      ? contributors.map((c) => {
          const abs = Math.abs(c.effectiveTolerance);
          const rssLeverage = x.rss > 0 ? (abs * abs) / (x.rss * x.rss) : 0;
          return {
            id: c.id,
            label: c.label,
            pctOfWc: (abs / x.worstCase) * 100,
            rssLeverage,
          };
        })
      : undefined;

  return {
    contributors,
    count: contributors.length,
    worstCase: x.worstCase,
    rss: x.rss,
    totalTolerance: x.worstCase,
    worstCaseY: y?.worstCase,
    rssY: y?.rss,
    worstCaseZ: z?.worstCase,
    rssZ: z?.rss,
    worstCase3d,
    rss3d,
    monteCarloMean,
    monteCarloStdDev,
    monteCarloPercentile95,
    monteCarloYield,
    sensitivity,
  };
}

/** Build a minimal GdtStackConfig from flat verification / API-style inputs. */
export function gdtStackConfigFromFlat(inputs: Record<string, unknown>): GdtStackConfig {
  return {
    features: (inputs.features as GdtStackConfig["features"]) ?? [],
    frames: (inputs.frames as GdtStackConfig["frames"]) ?? [],
    datums: (inputs.datums as GdtStackConfig["datums"]) ?? [],
    contributors: (inputs.contributors as GdtStackConfig["contributors"]) ?? [],
    actualSizes: inputs.actualSizes as Record<string, number> | undefined,
    useWorstCaseBonus:
      typeof inputs.useWorstCaseBonus === "boolean" ? inputs.useWorstCaseBonus : undefined,
    monteCarloSamples:
      typeof inputs.monteCarloSamples === "number" ? inputs.monteCarloSamples : undefined,
    defaultDistribution: inputs.defaultDistribution as GdtStackConfig["defaultDistribution"],
    contributorStats: inputs.contributorStats as GdtStackConfig["contributorStats"],
    requirementMinSi:
      typeof inputs.requirementMinSi === "number" ? inputs.requirementMinSi : undefined,
    requirementMaxSi:
      typeof inputs.requirementMaxSi === "number" ? inputs.requirementMaxSi : undefined,
  };
}
