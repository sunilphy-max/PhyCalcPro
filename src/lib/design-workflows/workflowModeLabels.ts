/** Internal workflow mode IDs (stable in code). User-facing names: Auto-design, Validate, Compare, Diagnose. */
export type DesignWorkflowMode = "check" | "design" | "select" | "diagnose";

export type WorkflowModeMeta = {
  label: string;
  description: string;
  calculateLabel: string;
  headline: string;
  steps: string[];
};

/** Tab order on every calculator: Auto-design → Validate → Compare → Diagnose. */
export const WORKFLOW_MODE_ORDER: DesignWorkflowMode[] = ["design", "check", "select", "diagnose"];

export const WORKFLOW_MODE_META: Record<DesignWorkflowMode, WorkflowModeMeta> = {
  design: {
    label: "Auto-design",
    description:
      "Size from your targets instead of starting from a fixed geometry.",
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
      "Run the forward solver on the geometry and loads already in the form.",
    calculateLabel: "Validate",
    headline: "Validate — verify what you entered",
    steps: [
      "Enter geometry, loads, material, and supports in the inputs panel.",
      "Click Validate to run the forward solver.",
      "Review numeric results, plots, and engineering checks for your design standard.",
    ],
  },
  select: {
    label: "Compare",
    description:
      "Browse ranked sizing options before committing to one size.",
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
      "Diagnose failure risk and reliability / safety — screen safety factors, utilizations, and governing checks.",
    calculateLabel: "Diagnose failure risk",
    headline: "Diagnose — failure risk and reliability",
    steps: [
      "Enter the installed geometry and actual operating loads in the inputs panel.",
      "Click Diagnose to run the forward solver and risk screening.",
      "Review failure modes, safety margins, and recommended adjustments.",
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
