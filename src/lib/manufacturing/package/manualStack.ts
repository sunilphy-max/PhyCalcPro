import type { DrawingExtract, GdtStackConfig, StackContributor } from "@/lib/manufacturing/gdt/types";
import { drawingExtractToGdtStack } from "@/lib/manufacturing/gdt/fromExtract";

/** A pickable annotation from a part's extract for the manual stack builder. */
export type StackPickCandidate = {
  key: string;
  partNumber: string;
  drawingFile: string;
  kind: "dimension" | "fcf";
  featureId: string;
  label: string;
  sheet?: string;
  zone?: string;
  /** Half-tolerance or zone/2 in SI for preview. */
  previewTolSi: number;
};

export type ManualStackPick = {
  candidateKey: string;
  partNumber: string;
  sense: 1 | -1;
  axis: "X" | "Y" | "Z";
};

export function listPickCandidates(
  partNumber: string,
  drawingFile: string,
  extract: DrawingExtract
): StackPickCandidate[] {
  const out: StackPickCandidate[] = [];
  for (const dim of extract.dimensions) {
    const half = Math.max(Math.abs(dim.upperDeviation), Math.abs(dim.lowerDeviation));
    out.push({
      key: `${partNumber}:dim:${dim.id}`,
      partNumber,
      drawingFile,
      kind: "dimension",
      featureId: dim.id,
      label: dim.label || `Dim ${dim.nominal}`,
      sheet: dim.location?.sheet,
      zone: dim.location?.zone,
      previewTolSi: half,
    });
  }
  for (const frame of extract.frames) {
    out.push({
      key: `${partNumber}:fcf:${frame.id}`,
      partNumber,
      drawingFile,
      kind: "fcf",
      featureId: frame.id,
      label: frame.label || `${frame.characteristic} ${frame.zoneValue}`,
      sheet: frame.location?.sheet,
      zone: frame.location?.zone,
      previewTolSi: frame.zoneValue / 2,
    });
  }
  return out;
}

/**
 * Build a GdtStackConfig from manual picks across multiple part extracts.
 * Engineer-owned topology — AI suggestions are not applied unless already in picks.
 */
export function buildStackFromManualPicks(
  picks: ManualStackPick[],
  extractsByPart: Record<string, DrawingExtract>,
  options?: { monteCarloSamples?: number }
): GdtStackConfig {
  const features = [];
  const frames = [];
  const datums = [];
  const contributors: StackContributor[] = [];
  const seenFeature = new Set<string>();
  const seenFrame = new Set<string>();
  const seenDatum = new Set<string>();

  for (let i = 0; i < picks.length; i++) {
    const pick = picks[i]!;
    const extract = extractsByPart[pick.partNumber];
    if (!extract) continue;

    for (const d of extract.datums) {
      if (!seenDatum.has(d.id)) {
        seenDatum.add(d.id);
        datums.push(d);
      }
    }

    if (pick.candidateKey.includes(":dim:")) {
      const dimId = pick.candidateKey.split(":dim:")[1]!;
      const dim = extract.dimensions.find((d) => d.id === dimId);
      if (!dim) continue;
      const fosId = `${pick.partNumber}__${dim.id}`;
      if (!seenFeature.has(fosId)) {
        seenFeature.add(fosId);
        features.push({
          id: fosId,
          label: `${pick.partNumber}: ${dim.label ?? dim.id}`,
          nominal: dim.nominal,
          upperLimit: dim.nominal + dim.upperDeviation,
          lowerLimit: dim.nominal + dim.lowerDeviation,
          isInternal: Boolean(dim.isInternal),
        });
      }
      contributors.push({
        id: `manual-${i + 1}`,
        label: `${pick.partNumber}: ${dim.label ?? dim.id}`,
        sense: pick.sense,
        axis: pick.axis,
        source: { kind: "size", featureOfSizeId: fosId },
      });
    } else if (pick.candidateKey.includes(":fcf:")) {
      const fcfIdRaw = pick.candidateKey.split(":fcf:")[1]!;
      const frame = extract.frames.find((f) => f.id === fcfIdRaw);
      if (!frame) continue;
      const fcfId = `${pick.partNumber}__${frame.id}`;
      if (!seenFrame.has(fcfId)) {
        seenFrame.add(fcfId);
        frames.push({
          ...frame,
          id: fcfId,
          label: `${pick.partNumber}: ${frame.label ?? frame.characteristic}`,
          featureOfSizeId: frame.featureOfSizeId
            ? `${pick.partNumber}__${frame.featureOfSizeId}`
            : undefined,
        });
      }
      if (frame.featureOfSizeId) {
        const fos = extract.features.find((f) => f.id === frame.featureOfSizeId);
        if (fos) {
          const fosId = `${pick.partNumber}__${fos.id}`;
          if (!seenFeature.has(fosId)) {
            seenFeature.add(fosId);
            features.push({ ...fos, id: fosId, label: `${pick.partNumber}: ${fos.label ?? fos.id}` });
          }
        }
      }
      contributors.push({
        id: `manual-${i + 1}`,
        label: `${pick.partNumber}: ${frame.label ?? frame.characteristic}`,
        sense: pick.sense,
        axis: pick.axis,
        source: { kind: "fcf", fcfId },
      });
    }
  }

  return {
    features,
    frames,
    datums,
    contributors,
    useWorstCaseBonus: true,
    monteCarloSamples: options?.monteCarloSamples,
  };
}

/** Apply a single-part extract via existing helper (simple path). */
export function stackFromSingleExtract(
  extract: DrawingExtract,
  monteCarloSamples?: number
): GdtStackConfig {
  return drawingExtractToGdtStack(extract, { monteCarloSamples });
}
