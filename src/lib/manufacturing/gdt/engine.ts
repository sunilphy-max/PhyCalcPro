import {
  datumShiftBonus,
  geometricBonus,
  sizeToleranceWidth,
  worstCaseBonusSize,
} from "./bonus";
import type {
  ContributorBreakdown,
  FeatureControlFrame,
  FeatureOfSize,
  GdtStackConfig,
  GdtStackResult,
  StackAxis,
  StackContributor,
} from "./types";

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
  const samples = config.monteCarloSamples ?? 0;
  if (samples > 0) {
    const byAxis: Record<StackAxis, number[]> = { X: [], Y: [], Z: [] };
    for (const row of contributors) {
      byAxis[row.axis].push(Math.abs(row.effectiveTolerance));
    }
    const draws: number[] = [];
    for (let i = 0; i < samples; i++) {
      let sx = 0;
      let sy = 0;
      let sz = 0;
      for (const t of byAxis.X) sx += (Math.random() * 2 - 1) * t;
      for (const t of byAxis.Y) sy += (Math.random() * 2 - 1) * t;
      for (const t of byAxis.Z) sz += (Math.random() * 2 - 1) * t;
      draws.push(Math.sqrt(sx ** 2 + sy ** 2 + sz ** 2));
    }
    monteCarloMean = draws.reduce((a, b) => a + b, 0) / draws.length;
    monteCarloStdDev = Math.sqrt(
      draws.reduce((sum, v) => sum + (v - monteCarloMean!) ** 2, 0) / draws.length
    );
  }

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
  };
}
