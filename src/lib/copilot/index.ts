import { matchStartModule } from "./moduleMatch";
import { runDesignPlan } from "./orchestrator";
import { deriveParams, parseBrief } from "./paramParser";
import { buildDesignPlan } from "./planBuilder";
import type { CopilotBrief, CopilotParams, DesignPlan, DesignSession } from "./types";

export { runBearingCopilotSession, BEARING_COPILOT_EXAMPLES } from "./bearingCopilot";
export type { BearingCopilotApplyPayload, BearingCopilotSession } from "./bearingCopilot";
export type { CopilotBrief, CopilotParams, DesignPlan, DesignSession } from "./types";
export { parseBrief, deriveParams } from "./paramParser";
export { matchStartModule } from "./moduleMatch";
export { buildDesignPlan } from "./planBuilder";
export { runDesignPlan } from "./orchestrator";

/** Parse a brief and choose a starting module (no solving yet). */
export function analyzeBrief(text: string, forcedStartModuleId?: string): CopilotBrief {
  const { params, tokens } = parseBrief(text);
  const match = matchStartModule(text);
  const startModuleId = forcedStartModuleId ?? match.best?.moduleId ?? null;
  const startReason = forcedStartModuleId
    ? "Starting module chosen manually."
    : match.reason;
  return {
    text,
    params,
    tokens,
    startModuleId,
    startReason,
    candidates: match.candidates,
  };
}

/** Build a design plan for an analyzed brief. */
export function planFromBrief(brief: CopilotBrief, maxSteps?: number): DesignPlan {
  if (!brief.startModuleId) return { steps: [], notes: ["No starting module was identified."] };
  return buildDesignPlan(brief.startModuleId, maxSteps);
}

/**
 * End-to-end: brief text → analyzed brief → plan → executed design session.
 * Deterministic; every number comes from the module solvers.
 */
export function runCopilotSession(
  text: string,
  options?: { startModuleId?: string; maxSteps?: number; extraParams?: CopilotParams }
): DesignSession {
  const brief = analyzeBrief(text, options?.startModuleId);
  const params: CopilotParams = { ...brief.params, ...options?.extraParams };
  deriveParams(params);
  brief.params = params;

  const plan = planFromBrief(brief, options?.maxSteps);
  const { results, finalParams } = runDesignPlan(plan, params);

  return {
    brief,
    plan,
    results,
    finalParams,
    createdAt: new Date().toISOString(),
  };
}
