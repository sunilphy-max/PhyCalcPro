/** Internal workflow mode IDs (stable in code). User-facing names: Auto-design, Validate, Compare, Diagnose. */
export type DesignWorkflowMode = "check" | "design" | "select" | "diagnose";

export type WorkflowModeMeta = {
  label: string;
  description: string;
  calculateLabel: string;
  headline: string;
  steps: string[];
};

/** Tab order on every calculator: Auto-design → Validate → Compare. */
export const WORKFLOW_MODE_ORDER: DesignWorkflowMode[] = ["design", "check", "select"];

export const WORKFLOW_MODE_META: Record<DesignWorkflowMode, WorkflowModeMeta> = {
  design: {
    label: "Auto-design",
    description:
      "Set targets, search catalog or reverse-solve, apply the best candidate, then run the full check.",
    calculateLabel: "Auto-design",
    headline: "Auto-design — size from your targets",
    steps: [
      "Enter loads, limits, and safety factors (design targets) in the inputs panel.",
      "Click Auto-design — the module ranks catalog or solver candidates, applies the best match, then validates.",
      "Review updated geometry, utilization, charts, and code checks in the results.",
    ],
  },
  check: {
    label: "Validate",
    description:
      "Run the forward solver on the geometry and loads already in the form; no automatic sizing.",
    calculateLabel: "Validate",
    headline: "Validate — verify what you entered",
    steps: [
      "Enter geometry, loads, material, and supports in the inputs panel.",
      "Click Validate (or Calculate) to run the forward solver.",
      "Review numeric results, plots, and engineering checks for your design standard.",
    ],
  },
  select: {
    label: "Compare",
    description:
      "Browse ranked sizing options in the advisor; Apply loads one into the form, then validate in detail.",
    calculateLabel: "Compare options",
    headline: "Compare — review alternatives before committing",
    steps: [
      "Open “Sizing candidates & reference” to see ranked catalog or solver options.",
      "Click Apply on a row to load that size into the form (switches to Validate).",
      "Run Validate again to confirm the chosen option with full physics and code checks.",
    ],
  },
  diagnose: {
    label: "Diagnose",
    description:
      "Analyze an installed bearing under current operating conditions — flag overload, lubrication, misalignment, and speed risks.",
    calculateLabel: "Diagnose failure risk",
    headline: "Diagnose — why is this bearing failing?",
    steps: [
      "Enter the installed designation and actual operating loads, speed, and lubrication.",
      "Click Diagnose to run ISO 281/76 checks and risk screening.",
      "Review failure modes, root-cause hints, and catalog replacement options.",
    ],
  },
};

export const DEFAULT_WORKFLOW_MODES = WORKFLOW_MODE_ORDER.map((id) => ({
  id,
  label: WORKFLOW_MODE_META[id].label,
  description: WORKFLOW_MODE_META[id].description,
}));

export function getWorkflowModeLabel(mode: DesignWorkflowMode): string {
  return WORKFLOW_MODE_META[mode].label;
}

export function getDesignCalculateLabel(
  mode: DesignWorkflowMode,
  fallback = "Calculate"
): string {
  if (mode === "check") return fallback;
  return WORKFLOW_MODE_META[mode].calculateLabel;
}
