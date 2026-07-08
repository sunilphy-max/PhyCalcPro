import { runModuleDesignMode } from "@/lib/design-workflows/designModeRegistry";
import { getModuleDesignWorkflow } from "@/lib/design-workflows/moduleDesignWorkflows";
import type { ModuleUserInputs } from "@/lib/design-workflows/userInputs";
import type {
  CopilotParams,
  DesignPlan,
  DesignPlanStep,
  StepMetric,
  StepResult,
} from "./types";

/** Map canonical copilot params onto the flat ModuleUserInputs shape. */
function mapParamsToInputs(params: CopilotParams): ModuleUserInputs {
  const inputs: ModuleUserInputs = {};
  if (params.power != null) inputs.power = params.power;
  if (params.rpm != null) inputs.rpm = params.rpm;
  if (params.torque != null) inputs.torque = params.torque;
  if (params.serviceFactor != null) inputs.serviceFactor = params.serviceFactor;
  if (params.bendingMoment != null) inputs.bendingMoment = params.bendingMoment;
  if (params.pressure != null) inputs.pressure = params.pressure;
  if (params.length != null) inputs.length = params.length;
  if (params.targetSafetyFactor != null) inputs.targetSafetyFactor = params.targetSafetyFactor;
  if (params.lifeHours != null) inputs.requiredLife = params.lifeHours;
  if (params.temperature != null) inputs.temperature = params.temperature;
  if (params.mass != null) inputs.mass = params.mass;
  if (params.force != null) {
    inputs.axialLoad = params.force;
    inputs.maxForce = params.force;
  }
  if (params.diameter != null) {
    // Copilot diameter is in metres; module fields expect millimetres.
    inputs.diameter = params.diameter * 1000;
    inputs.shaftDiameter = params.diameter * 1000;
  }
  return inputs;
}

function numericFields(fields: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
  }
  return out;
}

function formatNumber(value: number): string {
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1000 || abs < 0.01) return value.toExponential(2);
  return value.toFixed(abs >= 100 ? 0 : 2);
}

function buildMetrics(appliedFields: Record<string, number>, params: CopilotParams): StepMetric[] {
  const metrics: StepMetric[] = [];
  if (params.torque != null) metrics.push({ label: "Torque", value: `${formatNumber(params.torque)} N·m` });
  for (const [key, value] of Object.entries(appliedFields).slice(0, 4)) {
    metrics.push({ label: key, value: formatNumber(value) });
  }
  return metrics.slice(0, 5);
}

function runStep(
  step: DesignPlanStep,
  accumulatedParams: CopilotParams,
  accumulatedFields: Record<string, number>
): StepResult {
  const workflow = getModuleDesignWorkflow(step.moduleId);
  const notes: string[] = [];
  if (workflow?.expertNotes?.length) notes.push(workflow.expertNotes[0]!);
  if (workflow?.gaps?.length) notes.push(`Gap: ${workflow.gaps[0]!}`);

  const inputs: ModuleUserInputs = {
    ...(accumulatedFields as ModuleUserInputs),
    ...mapParamsToInputs(accumulatedParams),
  };

  let method = "Design workflow.";
  let recommendation: string | null = null;
  let detail: string | null = null;
  let appliedFields: Record<string, number> = {};
  let status: StepResult["status"] = "ok";

  try {
    const result = runModuleDesignMode(step.moduleId, inputs);
    if (result) {
      method = result.method;
      if (result.best) {
        recommendation = result.best.label;
        detail = result.best.detail ?? null;
        appliedFields = numericFields(result.best.fields);
      } else {
        status = "skipped";
        notes.push("No sizing candidate returned (validate-only or insufficient inputs).");
      }
    } else {
      status = "skipped";
      notes.push("Module has no automated design path; open it to run manually.");
    }
  } catch (error) {
    status = "error";
    notes.push(`Solver could not run with the current parameters: ${(error as Error).message}`);
  }

  const contributed: CopilotParams = {};
  // Thread useful fields downstream (both raw field names and canonical params).
  for (const [key, value] of Object.entries(appliedFields)) {
    accumulatedFields[key] = value;
  }
  if (appliedFields.shaftDiameter != null || appliedFields.diameter != null) {
    const dMm = appliedFields.shaftDiameter ?? appliedFields.diameter!;
    contributed.diameter = dMm / 1000;
    accumulatedParams.diameter = contributed.diameter;
  }

  return {
    step,
    method,
    recommendation,
    detail,
    appliedFields,
    metrics: buildMetrics(appliedFields, accumulatedParams),
    contributed,
    notes,
    status,
  };
}

/** Run every step of a design plan, threading parameters through the chain. */
export function runDesignPlan(plan: DesignPlan, initialParams: CopilotParams): {
  results: StepResult[];
  finalParams: CopilotParams;
} {
  const accumulatedParams: CopilotParams = { ...initialParams };
  const accumulatedFields: Record<string, number> = {};
  const results: StepResult[] = [];

  for (const step of plan.steps) {
    results.push(runStep(step, accumulatedParams, accumulatedFields));
  }

  return { results, finalParams: accumulatedParams };
}
