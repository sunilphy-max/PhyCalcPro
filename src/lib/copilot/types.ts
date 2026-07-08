/**
 * Design Copilot — orchestration layer types.
 *
 * The copilot turns a natural-language brief into an ordered chain of module
 * design runs. It plans deterministically (no LLM required) using the existing
 * design-mode registry, the cross-module handoff graph, and per-module linked
 * workflows. Every number comes from the verified module solvers, never from a
 * language model — the copilot only decides *which* modules to run and *how*
 * to thread parameters between them.
 */

/** Canonical numeric parameters extracted from a brief, in SI-ish base units. */
export type CopilotParams = {
  /** Mechanical power in watts. */
  power?: number;
  /** Rotational speed in rev/min. */
  rpm?: number;
  /** Torque in N·m (derived from power + rpm when not stated). */
  torque?: number;
  /** Dimensionless service / duty factor. */
  serviceFactor?: number;
  /** Force / load in newtons. */
  force?: number;
  /** Bending moment in N·m. */
  bendingMoment?: number;
  /** Pressure in pascals. */
  pressure?: number;
  /** Length / span in metres. */
  length?: number;
  /** Diameter in metres. */
  diameter?: number;
  /** Target safety factor (dimensionless). */
  targetSafetyFactor?: number;
  /** Target life (hours). */
  lifeHours?: number;
  /** Temperature in °C. */
  temperature?: number;
  /** Mass in kg. */
  mass?: number;
  /** Any additional recognised numeric params keyed by canonical name. */
  [key: string]: number | undefined;
};

/** One recognised token from the brief, kept for transparency in the UI. */
export type ParsedToken = {
  /** Raw matched text, e.g. "5 kW". */
  raw: string;
  /** Canonical param name it mapped to, e.g. "power". */
  param: string;
  /** Value in base units. */
  value: number;
  /** Base unit label, e.g. "W". */
  unit: string;
};

export type CopilotBrief = {
  text: string;
  params: CopilotParams;
  tokens: ParsedToken[];
  /** Module id the copilot chose to start from. */
  startModuleId: string | null;
  /** Human-readable reason the start module was picked. */
  startReason: string;
  /** Alternate start-module candidates (id + score) for disambiguation. */
  candidates: Array<{ moduleId: string; title: string; score: number }>;
};

export type DesignPlanStep = {
  moduleId: string;
  title: string;
  category: string;
  route: string;
  /** Why this module is in the plan (start, handoff edge, or linked workflow). */
  reason: string;
  /** Design maturity from the module workflow metadata. */
  maturity: "workflow" | "solver-backed" | "catalog-backed";
};

export type DesignPlan = {
  steps: DesignPlanStep[];
  /** Notes about coverage / gaps surfaced from module metadata. */
  notes: string[];
};

export type StepMetric = {
  label: string;
  value: string;
};

export type StepResult = {
  step: DesignPlanStep;
  /** Description of the design method used by the module. */
  method: string;
  /** Chosen candidate label (e.g. "Ø45", "W8×31", "6207"), if any. */
  recommendation: string | null;
  /** Extra detail from the design solver (e.g. "SF 2.05"). */
  detail: string | null;
  /** Numeric fields applied from the best candidate. */
  appliedFields: Record<string, number>;
  /** A few headline metrics for display. */
  metrics: StepMetric[];
  /** Params this step contributed to the downstream chain. */
  contributed: CopilotParams;
  /** Notes / assumptions / gaps to keep the engineer honest. */
  notes: string[];
  status: "ok" | "skipped" | "error";
};

export type DesignSession = {
  brief: CopilotBrief;
  plan: DesignPlan;
  results: StepResult[];
  /** Final accumulated parameters after the whole chain ran. */
  finalParams: CopilotParams;
  createdAt: string;
};
