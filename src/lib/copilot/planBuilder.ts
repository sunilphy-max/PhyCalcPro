import { allModules } from "@/data/modules";
import { POWER_TRAIN_HANDOFF_EDGES } from "@/lib/design-workflows/handoffParamRegistry";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";
import { resolveWorkflowLinkedModule } from "@/lib/design-workflows/resolveWorkflowLinkedModules";
import type { DesignPlan, DesignPlanStep } from "./types";

const DEFAULT_MAX_STEPS = 7;

type Pending = { moduleId: string; reason: string };

function resolveModule(id: string) {
  const direct = allModules.find((m) => m.id === id && !m.comingSoon);
  if (direct) return direct;
  return resolveWorkflowLinkedModule(id) ?? null;
}

function toStep(moduleId: string, reason: string): DesignPlanStep | null {
  const resolved = resolveModule(moduleId);
  if (!resolved) return null;
  const workflow = getModuleDesignWorkflow(resolved.id);
  return {
    moduleId: resolved.id,
    title: resolved.title,
    category: resolved.category,
    route: resolved.route,
    reason,
    maturity: workflow?.maturity ?? "workflow",
  };
}

/**
 * Build an ordered design plan starting from a module.
 *
 * 1. Follow the documented power-train handoff edges (motor → belts → shafts →
 *    bearings → housing → bolts …) so the chain mirrors real assembly flow.
 * 2. Enrich with each module's linked workflows (fatigue, keys, materials …).
 * 3. De-duplicate, resolve id aliases, and cap the total number of steps.
 */
export function buildDesignPlan(startModuleId: string, maxSteps: number = DEFAULT_MAX_STEPS): DesignPlan {
  const notes: string[] = [];
  const startStep = toStep(startModuleId, "Design target from the brief.");
  if (!startStep) {
    return { steps: [], notes: ["Could not resolve a starting module for this brief."] };
  }

  const steps: DesignPlanStep[] = [startStep];
  const visited = new Set<string>([startStep.moduleId]);

  const addPending = (pending: Pending): boolean => {
    if (steps.length >= maxSteps) return false;
    if (visited.has(pending.moduleId)) return false;
    const step = toStep(pending.moduleId, pending.reason);
    if (!step) return false;
    if (visited.has(step.moduleId)) return false;
    visited.add(step.moduleId);
    steps.push(step);
    return true;
  };

  // 1. Handoff-edge expansion (breadth-first over the directed graph).
  let expanded = true;
  while (expanded && steps.length < maxSteps) {
    expanded = false;
    for (const edge of POWER_TRAIN_HANDOFF_EDGES) {
      if (!visited.has(edge.from)) continue;
      if (visited.has(edge.to)) continue;
      const fromStep = steps.find((s) => s.moduleId === edge.from);
      const fromTitle = fromStep?.title ?? edge.from;
      if (addPending({ moduleId: edge.to, reason: `Receives ${edge.params.join(", ")} from ${fromTitle}.` })) {
        expanded = true;
      }
    }
  }

  // 2. Linked-workflow enrichment (uses metadata authored per module).
  const snapshot = [...steps];
  for (const step of snapshot) {
    if (steps.length >= maxSteps) break;
    const workflow = getModuleDesignWorkflow(step.moduleId);
    for (const linkedId of workflow?.linkedWorkflowModuleIds ?? []) {
      if (steps.length >= maxSteps) break;
      addPending({ moduleId: linkedId, reason: `Linked check for ${step.title}.` });
    }
  }

  // 3. Coverage notes / honesty about maturity.
  const startWorkflow = getModuleDesignWorkflow(startStep.moduleId);
  if (startWorkflow?.gaps?.length) {
    notes.push(`${startStep.title}: ${startWorkflow.gaps[0]}`);
  }
  const nonSolver = steps.filter((s) => s.maturity !== "solver-backed").map((s) => s.title);
  if (nonSolver.length) {
    notes.push(`Indicative / workflow-level sizing for: ${nonSolver.join(", ")}. Verify against detailed analysis.`);
  }

  return { steps, notes };
}
