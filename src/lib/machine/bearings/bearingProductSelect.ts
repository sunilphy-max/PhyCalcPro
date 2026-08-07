/**
 * Bearing hub entry — PhyCalc jobs → Designer deep links.
 */

import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import { WORKFLOW_MODE_META } from "@/lib/design-workflows/workflowModeLabels";
import {
  designerHref,
  parseBearingJob,
  type BearingDesignerIntent,
  type BearingDesignerStageId,
  type BearingJob,
  defaultStageForJob,
  intentFromJob,
} from "./bearingProject";

/** @deprecated Prefer BearingJob — kept for hub card ids matching DesignWorkflowMode. */
export type BearingStartModeId = "design" | "check" | "select" | "diagnose";

export type BearingStartModeCard = {
  id: BearingStartModeId;
  job: BearingJob;
  label: string;
  description: string;
  /** What the engineer does next */
  outcome: string;
  href: string;
  intent: BearingDesignerIntent;
  panel: BearingDesignerStageId;
  accent: "cyan" | "emerald" | "violet" | "amber";
};

const JOB_BY_START_MODE: Record<BearingStartModeId, BearingJob> = {
  design: "autoDesign",
  check: "validate",
  select: "compare",
  diagnose: "diagnose",
};

export const BEARING_START_MODE_CARDS: BearingStartModeCard[] = (
  ["design", "check", "select", "diagnose"] as const
).map((id) => {
  const job = JOB_BY_START_MODE[id];
  const panel = defaultStageForJob(job);
  return {
    id,
    job,
    label: WORKFLOW_MODE_META[id].label,
    description: WORKFLOW_MODE_META[id].description,
    outcome:
      id === "design"
        ? "Rank catalog bearings from load, speed, and life targets"
        : id === "check"
          ? "Enter a designation and duty — get L₁₀, static SF, and speed margin"
          : id === "select"
            ? "Browse ranked alternatives side-by-side before committing"
            : "Screen failure risk, grease life, interchange, and defect frequencies",
    href: designerHref({ job, panel }),
    intent: intentFromJob(job),
    panel,
    accent:
      id === "design"
        ? "cyan"
        : id === "check"
          ? "emerald"
          : id === "select"
            ? "violet"
            : "amber",
  };
});

/** Sibling tools only — Designer entry lives in the four job cards. */
export type BearingSiblingPath = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export const BEARING_SIBLING_PATHS: BearingSiblingPath[] = [
  {
    id: "catalog",
    label: "Catalog search",
    description: "Browse multi-OEM designations, then hand off to Designer",
    href: "/products/bearings/database",
  },
  {
    id: "plain",
    label: "Plain bearings",
    description: "Hydrodynamic journal and pad screening",
    href: "/products/bearings/plain",
  },
  {
    id: "housing",
    label: "Housings & units",
    description: "Housing body, bolts, and mounted BOM",
    href: "/products/bearings/housing",
  },
];

/** @deprecated Use BEARING_SIBLING_PATHS — Designer duplicates removed. */
export const BEARING_QUICK_PATHS = BEARING_SIBLING_PATHS;

export function parseWorkflowModeParam(
  value: string | null | undefined
): DesignWorkflowMode | null {
  const job = parseBearingJob(value);
  if (!job) return null;
  if (job === "autoDesign") return "design";
  if (job === "validate") return "check";
  if (job === "compare") return "select";
  return "diagnose";
}
