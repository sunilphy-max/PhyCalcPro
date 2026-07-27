/**
 * Fleet EDP Phase-1 scorecard notes (cross-cutting).
 * Runtime checklist is enforced by scripts/validate-edp-phase1.mjs for F1 modules.
 */
export const EDP_PHASE1_SCORECARD = {
  beams: {
    live: true,
    diagram: true,
    plots: true,
    summary: true,
    pdf: true,
    units: true,
    designModes: true,
    workspaceChrome: true,
  },
  shafts: {
    live: "optional-preview",
    diagram: true,
    plots: true,
    summary: true,
    pdf: true,
    units: true,
    designModes: true,
    workspaceChrome: "pending-rollout",
  },
  bearings: {
    live: true,
    diagram: true,
    plots: true,
    summary: true,
    pdf: true,
    units: true,
    designModes: true,
    workspaceChrome: "pending-rollout",
  },
} as const;
