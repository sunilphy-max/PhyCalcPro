import type {
  AnnotationLocation,
  Datum,
  DatumReference,
  DimensionCallout,
  DrawingExtract,
  DrawingMetadata,
  FeatureControlFrame,
  FeatureOfSize,
  FitCallout,
  GdtCharacteristic,
  MaterialCondition,
  StackContributor,
} from "./types";

const CHARACTERISTICS = new Set<GdtCharacteristic>([
  "position",
  "perpendicularity",
  "parallelism",
  "profile",
  "concentricity",
  "coaxiality",
  "circularRunout",
  "totalRunout",
  "size",
]);

const MATERIAL = new Set<MaterialCondition>(["RFS", "MMC", "LMC"]);

function asNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function parseMaterial(value: unknown): MaterialCondition {
  const s = asString(value, "RFS").toUpperCase();
  return MATERIAL.has(s as MaterialCondition) ? (s as MaterialCondition) : "RFS";
}

function parseCharacteristic(value: unknown): GdtCharacteristic {
  const s = asString(value, "position");
  return CHARACTERISTICS.has(s as GdtCharacteristic) ? (s as GdtCharacteristic) : "position";
}

function parseDatumRefs(raw: unknown): DatumReference[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    const row = (r ?? {}) as Record<string, unknown>;
    return {
      datumId: asString(row.datumId || row.id, "A"),
      materialCondition: row.materialCondition
        ? parseMaterial(row.materialCondition)
        : undefined,
    };
  });
}

/** Parse designations like H7, g6, H7/g6 into letter + grade. */
export function parseIsoFitDesignation(raw: string): {
  holeLetter?: string;
  holeGrade?: number;
  shaftLetter?: string;
  shaftGrade?: number;
} {
  const cleaned = raw.replace(/\s+/g, "");
  const pair = cleaned.match(/^([A-Za-z])(\d+)\s*[\/]\s*([A-Za-z])(\d+)$/);
  if (pair) {
    return {
      holeLetter: pair[1]!.toUpperCase(),
      holeGrade: Number(pair[2]),
      shaftLetter: pair[3]!.toLowerCase(),
      shaftGrade: Number(pair[4]),
    };
  }
  const single = cleaned.match(/^([A-Za-z])(\d+)$/);
  if (single) {
    const letter = single[1]!;
    const grade = Number(single[2]);
    if (letter === letter.toUpperCase()) {
      return { holeLetter: letter, holeGrade: grade };
    }
    return { shaftLetter: letter.toLowerCase(), shaftGrade: grade };
  }
  return {};
}

function parseLocation(raw: unknown): AnnotationLocation | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  const bboxRaw = row.bbox;
  let bbox: AnnotationLocation["bbox"];
  if (Array.isArray(bboxRaw) && bboxRaw.length === 4) {
    const nums = bboxRaw.map((v) => asNumber(v, NaN));
    if (nums.every((n) => Number.isFinite(n))) {
      bbox = [nums[0]!, nums[1]!, nums[2]!, nums[3]!];
    }
  }
  const loc: AnnotationLocation = {
    sheet: row.sheet ? asString(row.sheet) : undefined,
    zone: row.zone ? asString(row.zone) : undefined,
    page: row.page !== undefined ? asNumber(row.page) : undefined,
    bbox,
  };
  if (!loc.sheet && !loc.zone && loc.page === undefined && !loc.bbox) return undefined;
  return loc;
}

function parseMetadata(raw: unknown): DrawingMetadata | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const row = raw as Record<string, unknown>;
  const meta: DrawingMetadata = {
    drawingNumber: row.drawingNumber ? asString(row.drawingNumber) : undefined,
    revision: row.revision ? asString(row.revision) : undefined,
    sheet: row.sheet ? asString(row.sheet) : undefined,
    title: row.title ? asString(row.title) : undefined,
    material: row.material ? asString(row.material) : undefined,
    scale: row.scale ? asString(row.scale) : undefined,
    units: row.units ? asString(row.units) : undefined,
  };
  return Object.values(meta).some(Boolean) ? meta : undefined;
}

export function emptyDrawingExtract(): DrawingExtract {
  return {
    metadata: undefined,
    datums: [],
    features: [],
    frames: [],
    dimensions: [],
    fitCallouts: [],
    suggestedContributors: [],
    notes: [],
  };
}

/** Hand-validate / coerce LLM JSON into DrawingExtract. */
export function validateDrawingExtract(raw: unknown): DrawingExtract {
  const base = emptyDrawingExtract();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;

  const datums: Datum[] = Array.isArray(obj.datums)
    ? obj.datums.map((d, i) => {
        const row = (d ?? {}) as Record<string, unknown>;
        const typeRaw = asString(row.type, "plane");
        const type =
          typeRaw === "axis" || typeRaw === "point" || typeRaw === "plane" ? typeRaw : "plane";
        return {
          id: asString(row.id, String.fromCharCode(65 + i)),
          type,
          label: row.label ? asString(row.label) : undefined,
        };
      })
    : [];

  const features: FeatureOfSize[] = Array.isArray(obj.features)
    ? obj.features.map((f, i) => {
        const row = (f ?? {}) as Record<string, unknown>;
        const nominal = asNumber(row.nominal);
        const upper = asNumber(row.upperLimit, nominal);
        const lower = asNumber(row.lowerLimit, nominal);
        return {
          id: asString(row.id, `fos-${i + 1}`),
          label: row.label ? asString(row.label) : undefined,
          nominal,
          upperLimit: Math.max(upper, lower),
          lowerLimit: Math.min(upper, lower),
          isInternal: Boolean(row.isInternal),
        };
      })
    : [];

  const frames: FeatureControlFrame[] = Array.isArray(obj.frames)
    ? obj.frames.map((f, i) => {
        const row = (f ?? {}) as Record<string, unknown>;
        return {
          id: asString(row.id, `fcf-${i + 1}`),
          characteristic: parseCharacteristic(row.characteristic),
          zoneValue: Math.abs(asNumber(row.zoneValue)),
          isDiameterZone: row.isDiameterZone === undefined ? true : Boolean(row.isDiameterZone),
          materialCondition: parseMaterial(row.materialCondition),
          datumRefs: parseDatumRefs(row.datumRefs),
          featureOfSizeId: row.featureOfSizeId ? asString(row.featureOfSizeId) : undefined,
          label: row.label ? asString(row.label) : undefined,
          confidence:
            typeof row.confidence === "number" ? row.confidence : undefined,
          location: parseLocation(row.location),
        };
      })
    : [];

  const dimensions: DimensionCallout[] = Array.isArray(obj.dimensions)
    ? obj.dimensions.map((d, i) => {
        const row = (d ?? {}) as Record<string, unknown>;
        return {
          id: asString(row.id, `dim-${i + 1}`),
          label: row.label ? asString(row.label) : undefined,
          nominal: asNumber(row.nominal),
          upperDeviation: asNumber(row.upperDeviation),
          lowerDeviation: asNumber(row.lowerDeviation),
          isInternal: row.isInternal === undefined ? undefined : Boolean(row.isInternal),
          confidence:
            typeof row.confidence === "number" ? row.confidence : undefined,
          location: parseLocation(row.location),
        };
      })
    : [];

  const fitCallouts: FitCallout[] = Array.isArray(obj.fitCallouts)
    ? obj.fitCallouts.map((f, i) => {
        const row = (f ?? {}) as Record<string, unknown>;
        const fromDesignation =
          typeof row.designation === "string"
            ? parseIsoFitDesignation(row.designation)
            : {};
        return {
          id: asString(row.id, `fit-${i + 1}`),
          label: row.label ? asString(row.label) : undefined,
          nominal: asNumber(row.nominal),
          holeLetter: asString(row.holeLetter || fromDesignation.holeLetter || "", "") || undefined,
          holeGrade:
            row.holeGrade !== undefined
              ? asNumber(row.holeGrade)
              : fromDesignation.holeGrade,
          shaftLetter:
            asString(row.shaftLetter || fromDesignation.shaftLetter || "", "") || undefined,
          shaftGrade:
            row.shaftGrade !== undefined
              ? asNumber(row.shaftGrade)
              : fromDesignation.shaftGrade,
          holeUpper: row.holeUpper !== undefined ? asNumber(row.holeUpper) : undefined,
          holeLower: row.holeLower !== undefined ? asNumber(row.holeLower) : undefined,
          shaftUpper: row.shaftUpper !== undefined ? asNumber(row.shaftUpper) : undefined,
          shaftLower: row.shaftLower !== undefined ? asNumber(row.shaftLower) : undefined,
          confidence:
            typeof row.confidence === "number" ? row.confidence : undefined,
        };
      })
    : [];

  const suggestedContributors: StackContributor[] = Array.isArray(obj.suggestedContributors)
    ? obj.suggestedContributors.map((c, i) => {
        const row = (c ?? {}) as Record<string, unknown>;
        const axisRaw = asString(row.axis, "X").toUpperCase();
        const axis = axisRaw === "Y" || axisRaw === "Z" ? axisRaw : "X";
        const sense = asNumber(row.sense, 1) < 0 ? (-1 as const) : (1 as const);
        const sourceRaw = (row.source ?? {}) as Record<string, unknown>;
        const kind = asString(sourceRaw.kind, "size");
        let source: StackContributor["source"];
        if (kind === "fcf") {
          source = { kind: "fcf", fcfId: asString(sourceRaw.fcfId, "") };
        } else if (kind === "datumShift") {
          source = {
            kind: "datumShift",
            datumId: asString(sourceRaw.datumId, "A"),
            featureOfSizeId: asString(sourceRaw.featureOfSizeId, ""),
          };
        } else {
          source = {
            kind: "size",
            featureOfSizeId: asString(sourceRaw.featureOfSizeId, ""),
          };
        }
        return {
          id: asString(row.id, `c-${i + 1}`),
          label: row.label ? asString(row.label) : undefined,
          sense,
          axis: axis as "X" | "Y" | "Z",
          source,
          projectionFactor:
            row.projectionFactor !== undefined ? asNumber(row.projectionFactor, 1) : undefined,
        };
      })
    : [];

  const notes = Array.isArray(obj.notes)
    ? obj.notes.map((n) => asString(n)).filter(Boolean)
    : [];

  return {
    metadata: parseMetadata(obj.metadata),
    datums,
    features,
    frames,
    dimensions,
    fitCallouts,
    suggestedContributors,
    notes,
  };
}
