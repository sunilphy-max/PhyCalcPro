/**
 * Map dimension / FCF extract into a GdtStackConfig for the tolerance calculator.
 */
import type { DrawingExtract, GdtStackConfig, StackContributor } from "./types";

export function drawingExtractToGdtStack(
  extract: DrawingExtract,
  options?: { monteCarloSamples?: number }
): GdtStackConfig {
  const features = [...extract.features];

  // Promote bilateral dimensions into features of size when not already listed
  for (const dim of extract.dimensions) {
    if (features.some((f) => f.id === dim.id)) continue;
    features.push({
      id: dim.id,
      label: dim.label,
      nominal: dim.nominal,
      upperLimit: dim.nominal + dim.upperDeviation,
      lowerLimit: dim.nominal + dim.lowerDeviation,
      isInternal: Boolean(dim.isInternal),
    });
  }

  let contributors: StackContributor[] = extract.suggestedContributors.filter((c) => {
    const source = c.source;
    if (source.kind === "size") {
      return features.some((f) => f.id === source.featureOfSizeId);
    }
    if (source.kind === "fcf") {
      return extract.frames.some((f) => f.id === source.fcfId);
    }
    if (source.kind === "datumShift") {
      return features.some((f) => f.id === source.featureOfSizeId);
    }
    return false;
  });

  if (contributors.length === 0) {
    contributors = [];
    for (const dim of extract.dimensions) {
      contributors.push({
        id: `auto-size-${dim.id}`,
        label: dim.label ?? dim.id,
        sense: 1,
        axis: "X",
        source: { kind: "size", featureOfSizeId: dim.id },
      });
    }
    for (const frame of extract.frames) {
      contributors.push({
        id: `auto-fcf-${frame.id}`,
        label: frame.label ?? frame.characteristic,
        sense: 1,
        axis: "X",
        source: { kind: "fcf", fcfId: frame.id },
      });
    }
  }

  return {
    features,
    frames: extract.frames,
    datums: extract.datums,
    contributors,
    useWorstCaseBonus: true,
    monteCarloSamples: options?.monteCarloSamples,
  };
}
