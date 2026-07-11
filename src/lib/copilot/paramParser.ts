import type { CopilotParams, ParsedToken } from "./types";

/**
 * Deterministic natural-language parameter parser.
 *
 * Scans a brief for `<number> <unit>` pairs and a few labelled quantities
 * (service factor, safety factor, life), converting each to base units. No LLM
 * is involved — this keeps extraction predictable and auditable.
 */

type UnitRule = {
  /** Canonical parameter name the match maps to. */
  param: keyof CopilotParams | string;
  /** Base unit label after conversion. */
  base: string;
  /** Alternate unit spellings (matched case-insensitively, longest first). */
  units: string[];
  /** Convert the matched value to base units. */
  toBase: (value: number) => number;
};

/**
 * Ordered so that more specific units (e.g. "kW", "N·m") are tried before
 * shorter ambiguous ones (e.g. "W", "N", "m").
 */
const UNIT_RULES: UnitRule[] = [
  // Power
  { param: "power", base: "W", units: ["mw", "megawatt", "megawatts"], toBase: (v) => v * 1e6 },
  { param: "power", base: "W", units: ["kw", "kilowatt", "kilowatts"], toBase: (v) => v * 1e3 },
  { param: "power", base: "W", units: ["hp", "horsepower"], toBase: (v) => v * 745.7 },
  { param: "power", base: "W", units: ["w", "watt", "watts"], toBase: (v) => v },
  // Speed
  {
    param: "rpm",
    base: "rpm",
    units: ["rpm", "rev/min", "r/min", "revs per minute", "revolutions per minute"],
    toBase: (v) => v,
  },
  // Torque (before force so "N·m" wins over "N")
  { param: "torque", base: "N·m", units: ["kn·m", "kn.m", "kn-m", "knm"], toBase: (v) => v * 1e3 },
  {
    param: "torque",
    base: "N·m",
    units: ["n·m", "n.m", "n-m", "nm", "newton metre", "newton meter", "newton-metre"],
    toBase: (v) => v,
  },
  { param: "torque", base: "N·m", units: ["lb-ft", "lbf-ft", "lb·ft", "ft-lb", "ft·lb"], toBase: (v) => v * 1.35582 },
  // Pressure / stress
  { param: "pressure", base: "Pa", units: ["gpa"], toBase: (v) => v * 1e9 },
  { param: "pressure", base: "Pa", units: ["mpa"], toBase: (v) => v * 1e6 },
  { param: "pressure", base: "Pa", units: ["kpa"], toBase: (v) => v * 1e3 },
  { param: "pressure", base: "Pa", units: ["bar"], toBase: (v) => v * 1e5 },
  { param: "pressure", base: "Pa", units: ["psi"], toBase: (v) => v * 6894.76 },
  { param: "pressure", base: "Pa", units: ["pa", "pascal", "pascals"], toBase: (v) => v },
  // Force / load (after torque + pressure)
  { param: "force", base: "N", units: ["mn"], toBase: (v) => v * 1e6 },
  { param: "force", base: "N", units: ["kn"], toBase: (v) => v * 1e3 },
  { param: "force", base: "N", units: ["kgf"], toBase: (v) => v * 9.80665 },
  { param: "force", base: "N", units: ["lbf", "lb"], toBase: (v) => v * 4.44822 },
  { param: "force", base: "N", units: ["n", "newton", "newtons"], toBase: (v) => v },
  // Temperature
  { param: "temperature", base: "°C", units: ["°c", "degc", "deg c", "celsius"], toBase: (v) => v },
  { param: "temperature", base: "°C", units: ["k", "kelvin"], toBase: (v) => v - 273.15 },
  { param: "temperature", base: "°C", units: ["°f", "degf", "deg f", "fahrenheit"], toBase: (v) => ((v - 32) * 5) / 9 },
  // Mass
  { param: "mass", base: "kg", units: ["tonne", "tonnes", "t"], toBase: (v) => v * 1e3 },
  { param: "mass", base: "kg", units: ["kg", "kilogram", "kilograms"], toBase: (v) => v },
  { param: "mass", base: "kg", units: ["g", "gram", "grams"], toBase: (v) => v / 1e3 },
  // Length (after mass so "g" doesn't collide; "m" is last, most ambiguous)
  { param: "length", base: "m", units: ["mm", "millimetre", "millimetres", "millimeter", "millimeters"], toBase: (v) => v / 1e3 },
  { param: "length", base: "m", units: ["cm", "centimetre", "centimetres"], toBase: (v) => v / 100 },
  { param: "length", base: "m", units: ["in", "inch", "inches", '"'], toBase: (v) => v * 0.0254 },
  { param: "length", base: "m", units: ["ft", "foot", "feet"], toBase: (v) => v * 0.3048 },
  { param: "length", base: "m", units: ["m", "metre", "metres", "meter", "meters"], toBase: (v) => v },
];

const NUMBER = "([-+]?\\d+(?:[.,]\\d+)?(?:e[-+]?\\d+)?)";

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseNumber(raw: string): number {
  return Number.parseFloat(raw.replace(/,/g, "."));
}

type Interval = { start: number; end: number };

function overlaps(consumed: Interval[], start: number, end: number): boolean {
  return consumed.some((iv) => start < iv.end && end > iv.start);
}

/** Extract labelled dimensionless quantities that have no unit token. */
function parseLabelledQuantities(text: string, consumed: Interval[], tokens: ParsedToken[], params: CopilotParams) {
  const labelled: Array<{ param: keyof CopilotParams; unit: string; patterns: RegExp[] }> = [
    {
      param: "serviceFactor",
      unit: "×",
      patterns: [
        new RegExp(`service\\s*factor\\s*(?:of\\s*)?${NUMBER}`, "i"),
        new RegExp(`\\bsf\\s*(?:of\\s*|=\\s*)?${NUMBER}`, "i"),
        new RegExp(`${NUMBER}\\s*service\\s*factor`, "i"),
      ],
    },
    {
      param: "targetSafetyFactor",
      unit: "×",
      patterns: [
        new RegExp(`safety\\s*factor\\s*(?:of\\s*)?${NUMBER}`, "i"),
        new RegExp(`factor\\s*of\\s*safety\\s*(?:of\\s*)?${NUMBER}`, "i"),
        new RegExp(`\\b(?:fos|fs)\\s*(?:of\\s*|=\\s*)?${NUMBER}`, "i"),
      ],
    },
    {
      param: "lifeHours",
      unit: "h",
      patterns: [
        new RegExp(`${NUMBER}\\s*(?:hours|hrs|h)\\s*(?:life|service life|of life|l10)`, "i"),
        new RegExp(`(?:life|l10h?|l10)\\s*(?:of\\s*|=\\s*|:\\s*)?${NUMBER}\\s*(?:hours|hrs|h)?`, "i"),
        new RegExp(`${NUMBER}\\s*(?:hours|hrs)\\b`, "i"),
      ],
    },
  ];

  for (const entry of labelled) {
    if (params[entry.param] != null) continue;
    for (const pattern of entry.patterns) {
      const match = pattern.exec(text);
      if (!match || match.index == null) continue;
      if (overlaps(consumed, match.index, match.index + match[0].length)) continue;
      const value = parseNumber(match[1]!);
      if (!Number.isFinite(value)) continue;
      params[entry.param] = value;
      tokens.push({ raw: match[0].trim(), param: String(entry.param), value, unit: entry.unit });
      consumed.push({ start: match.index, end: match.index + match[0].length });
      break;
    }
  }
}

/**
 * Parse a free-text brief into base-unit parameters plus the tokens that were
 * recognised (for transparent display in the UI).
 */
export function parseBrief(text: string): { params: CopilotParams; tokens: ParsedToken[] } {
  const params: CopilotParams = {};
  const tokens: ParsedToken[] = [];
  const consumed: Interval[] = [];

  for (const rule of UNIT_RULES) {
    const unitAlternation = rule.units
      .slice()
      .sort((a, b) => b.length - a.length)
      .map(escapeRegex)
      .join("|");
    // Require a word boundary (or end) after the unit so "min" ≠ "m in".
    const regex = new RegExp(`${NUMBER}\\s*(?:${unitAlternation})(?![a-z])`, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (overlaps(consumed, start, end)) continue;
      const value = parseNumber(match[1]!);
      if (!Number.isFinite(value)) continue;
      const baseValue = rule.toBase(value);
      consumed.push({ start, end });
      // First occurrence of a param wins; keep later ones only as tokens.
      if (params[rule.param] == null) params[rule.param] = baseValue;
      tokens.push({ raw: match[0].trim(), param: String(rule.param), value: baseValue, unit: rule.base });
    }
  }

  parseLabelledQuantities(text, consumed, tokens, params);
  deriveParams(params);

  return { params, tokens };
}

/** Fill in commonly derived quantities so downstream modules have what they need. */
export function deriveParams(params: CopilotParams): void {
  // Torque from power and speed: T = P / ω, ω = 2π·rpm/60.
  if (params.torque == null && params.power != null && params.rpm != null && params.rpm > 0) {
    const omega = (params.rpm * 2 * Math.PI) / 60;
    if (omega > 0) params.torque = params.power / omega;
  }
  // Apply service factor to torque for a design torque, exposed separately.
  if (params.torque != null && params.serviceFactor != null && params.designTorque == null) {
    params.designTorque = params.torque * params.serviceFactor;
  }
}
