import type {
  AnnotationLocation,
  DrawingExtract,
  FeatureControlFrame,
  GdtCharacteristic,
} from "@/lib/manufacturing/gdt/types";
import type { AssemblyNode, BomNodeType } from "./types";
import { findAssemblyNode } from "./bomHelpers";

export type AnnotationKind = "dimension" | "fcf" | "datum" | "fit" | "note" | "feature";

export type AnnotationEntry = {
  key: string;
  partNumber: string;
  drawingFile: string;
  nodeType: BomNodeType;
  kind: AnnotationKind;
  featureId: string;
  label: string;
  characteristic?: GdtCharacteristic | "size" | "fit" | "datum" | "note";
  materialCondition?: string;
  /** Half-tol or zone/2 preview (SI metres). */
  previewTolSi: number;
  confidence?: number;
  location?: AnnotationLocation;
  sheet?: string;
  zone?: string;
  ready: boolean;
  qualityIssues: string[];
};

export type PartExtractQuality = {
  partNumber: string;
  annotationCount: number;
  score: number;
  ready: boolean;
  issues: string[];
};

const FCF_EXPLAIN: Record<string, string> = {
  position: "Controls the location of a feature relative to datums. Zone size may receive MMC/LMC bonus when applied to a feature of size.",
  perpendicularity: "Controls orientation 90° to a datum. Often used on faces or axes that must stay square.",
  parallelism: "Controls orientation parallel to a datum. Stack contribution is typically the orientation zone projected on the gap axis.",
  profile: "Controls surface or line relative to a true profile; bilateral unless unequally disposed.",
  concentricity: "Controls coaxiality of median points (legacy); prefer position for most stacks.",
  coaxiality: "Controls shared axis alignment between features.",
  circularRunout: "Controls circular elements relative to a datum axis during rotation.",
  totalRunout: "Controls entire surface relative to a datum axis during rotation.",
  size: "Feature-of-size limit dimensions; bilateral or unequal limits contribute half-width to the stack.",
};

/** Build a searchable annotation library from all part extracts + BOM tree. */
export function buildAnnotationLibrary(
  extractsByPart: Record<string, DrawingExtract>,
  tree: AssemblyNode[],
  drawingFileByPn?: Record<string, string>
): AnnotationEntry[] {
  const out: AnnotationEntry[] = [];
  for (const [partNumber, extract] of Object.entries(extractsByPart)) {
    const node = findAssemblyNode(tree, partNumber);
    const nodeType: BomNodeType = node?.nodeType ?? "component";
    const drawingFile =
      drawingFileByPn?.[partNumber] ?? node?.drawingFile ?? extract.metadata?.drawingNumber ?? "";

    for (const dim of extract.dimensions) {
      const half = Math.max(Math.abs(dim.upperDeviation), Math.abs(dim.lowerDeviation));
      const issues: string[] = [];
      if (half <= 0) issues.push("Zero or missing tolerance band");
      if (dim.confidence !== undefined && dim.confidence < 0.5) issues.push("Low extract confidence");
      out.push({
        key: `${partNumber}:dim:${dim.id}`,
        partNumber,
        drawingFile,
        nodeType,
        kind: "dimension",
        featureId: dim.id,
        label: dim.label || `Dim ${dim.nominal}`,
        characteristic: "size",
        previewTolSi: half,
        confidence: dim.confidence,
        location: dim.location,
        sheet: dim.location?.sheet,
        zone: dim.location?.zone,
        ready: issues.length === 0,
        qualityIssues: issues,
      });
    }

    for (const frame of extract.frames) {
      const issues: string[] = [];
      if (!(frame.zoneValue > 0)) issues.push("Missing FCF zone value");
      if (frame.materialCondition !== "RFS" && !frame.featureOfSizeId) {
        issues.push("MMC/LMC FCF without linked feature of size");
      }
      if (frame.confidence !== undefined && frame.confidence < 0.5) {
        issues.push("Low extract confidence");
      }
      out.push({
        key: `${partNumber}:fcf:${frame.id}`,
        partNumber,
        drawingFile,
        nodeType,
        kind: "fcf",
        featureId: frame.id,
        label: frame.label || `${frame.characteristic} ${frame.zoneValue}`,
        characteristic: frame.characteristic,
        materialCondition: frame.materialCondition,
        previewTolSi: frame.zoneValue / 2,
        confidence: frame.confidence,
        location: frame.location,
        sheet: frame.location?.sheet,
        zone: frame.location?.zone,
        ready: issues.length === 0,
        qualityIssues: issues,
      });
    }

    for (const d of extract.datums) {
      out.push({
        key: `${partNumber}:datum:${d.id}`,
        partNumber,
        drawingFile,
        nodeType,
        kind: "datum",
        featureId: d.id,
        label: d.label || `Datum ${d.id}`,
        characteristic: "datum",
        previewTolSi: 0,
        ready: true,
        qualityIssues: [],
      });
    }

    for (const fit of extract.fitCallouts) {
      out.push({
        key: `${partNumber}:fit:${fit.id}`,
        partNumber,
        drawingFile,
        nodeType,
        kind: "fit",
        featureId: fit.id,
        label: fit.label || `Fit Ø${fit.nominal}`,
        characteristic: "fit",
        previewTolSi: 0,
        confidence: fit.confidence,
        ready: true,
        qualityIssues: [],
      });
    }

    for (let i = 0; i < (extract.notes ?? []).length; i++) {
      const note = extract.notes![i]!;
      out.push({
        key: `${partNumber}:note:${i}`,
        partNumber,
        drawingFile,
        nodeType,
        kind: "note",
        featureId: `note-${i}`,
        label: note.slice(0, 80),
        characteristic: "note",
        previewTolSi: 0,
        ready: true,
        qualityIssues: [],
      });
    }
  }
  return out;
}

export function scorePartExtract(partNumber: string, extract: DrawingExtract): PartExtractQuality {
  const issues: string[] = [];
  const annotationCount =
    extract.dimensions.length +
    extract.frames.length +
    extract.features.length +
    extract.fitCallouts.length;
  if (annotationCount === 0) issues.push("No dimensions or FCFs extracted");
  const lowConf = [
    ...extract.dimensions.filter((d) => (d.confidence ?? 1) < 0.5),
    ...extract.frames.filter((f) => (f.confidence ?? 1) < 0.5),
  ];
  if (lowConf.length > 0) issues.push(`${lowConf.length} low-confidence annotation(s)`);
  for (const f of extract.frames) {
    if (f.materialCondition !== "RFS" && !f.featureOfSizeId) {
      issues.push(`FCF ${f.id}: MMC/LMC without feature link`);
    }
  }
  if (!extract.metadata?.drawingNumber && !extract.metadata?.revision) {
    issues.push("Title block metadata incomplete");
  }
  const score = Math.max(0, 100 - issues.length * 20 - (annotationCount === 0 ? 40 : 0));
  return {
    partNumber,
    annotationCount,
    score,
    ready: score >= 60 && annotationCount > 0,
    issues,
  };
}

export function filterAnnotationLibrary(
  entries: AnnotationEntry[],
  opts: {
    query?: string;
    partNumbers?: string[] | null;
    kinds?: AnnotationKind[];
    characteristic?: string;
  }
): AnnotationEntry[] {
  const q = opts.query?.trim().toLowerCase();
  return entries.filter((e) => {
    if (opts.partNumbers && !opts.partNumbers.includes(e.partNumber)) return false;
    if (opts.kinds && !opts.kinds.includes(e.kind)) return false;
    if (opts.characteristic && e.characteristic !== opts.characteristic) return false;
    if (!q) return true;
    return (
      e.label.toLowerCase().includes(q) ||
      e.partNumber.toLowerCase().includes(q) ||
      e.featureId.toLowerCase().includes(q) ||
      (e.characteristic ?? "").toLowerCase().includes(q) ||
      (e.materialCondition ?? "").toLowerCase().includes(q)
    );
  });
}

/** Deterministic FCF explanation from characteristic + material condition (no invented numbers). */
export function explainFeatureControlFrame(frame: FeatureControlFrame): string {
  const base = FCF_EXPLAIN[frame.characteristic] ?? "Geometric control frame from the drawing.";
  const mc =
    frame.materialCondition === "MMC"
      ? " Applied at MMC: bonus tolerance increases as the feature departs from MMC toward LMC."
      : frame.materialCondition === "LMC"
        ? " Applied at LMC: bonus increases as the feature departs from LMC toward MMC."
        : " Applied regardless of feature size (RFS): no size bonus.";
  const datums =
    frame.datumRefs.length > 0
      ? ` Datums: ${frame.datumRefs.map((r) => `${r.datumId}${r.materialCondition && r.materialCondition !== "RFS" ? `@${r.materialCondition}` : ""}`).join(", ")}.`
      : " No datum references.";
  const fos = frame.featureOfSizeId
    ? ` Linked feature of size: ${frame.featureOfSizeId}.`
    : "";
  return `${base}${mc}${datums}${fos}`;
}

export function explainAnnotation(entry: AnnotationEntry, extract?: DrawingExtract): string {
  if (entry.kind === "fcf" && extract) {
    const frame = extract.frames.find((f) => f.id === entry.featureId);
    if (frame) return explainFeatureControlFrame(frame);
  }
  if (entry.kind === "dimension") {
    return "Size / bilateral dimension. Stack contribution uses half the tolerance band (max of |upper| and |lower| deviations) projected on the selected axis.";
  }
  if (entry.kind === "datum") {
    return "Datum feature. May contribute datum shift when a mating FCF references it at MMC/LMC.";
  }
  if (entry.kind === "fit") {
    return "ISO fit callout from the drawing. Pair with the Fits module or enter hole/shaft limits as size contributors — AI does not invent clearances.";
  }
  if (entry.kind === "note") {
    return "Drawing note. Use as a requirement or interface hint when building SA/assembly stacks; confirm numerically from dimensions/FCFs.";
  }
  return "Drawing annotation.";
}
