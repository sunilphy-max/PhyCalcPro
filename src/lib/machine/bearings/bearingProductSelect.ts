/**
 * Bearing hub entry — Product Select–style start modes.
 * Maps to DesignWorkflowMode + Designer intent/panel deep links.
 */

import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import { WORKFLOW_MODE_META } from "@/lib/design-workflows/workflowModeLabels";
import type { BearingDesignerIntent, BearingDesignerStageId } from "./bearingProject";

export type BearingStartModeId = "design" | "check" | "select" | "diagnose";

export type BearingStartModeCard = {
  id: BearingStartModeId;
  label: string;
  description: string;
  /** What the engineer does next */
  outcome: string;
  href: string;
  intent: BearingDesignerIntent;
  panel: BearingDesignerStageId;
  accent: "cyan" | "emerald" | "violet" | "amber";
};

export const BEARING_START_MODE_CARDS: BearingStartModeCard[] = [
  {
    id: "design",
    label: WORKFLOW_MODE_META.design.label,
    description: WORKFLOW_MODE_META.design.description,
    outcome: "Rank catalog bearings from load, speed, and life targets",
    href: "/products/bearings/designer?intent=design&mode=design&panel=duty",
    intent: "design",
    panel: "duty",
    accent: "cyan",
  },
  {
    id: "check",
    label: WORKFLOW_MODE_META.check.label,
    description: WORKFLOW_MODE_META.check.description,
    outcome: "Enter a designation and duty — get L₁₀, static SF, and speed margin",
    href: "/products/bearings/designer?intent=design&mode=check&panel=size",
    intent: "design",
    panel: "size",
    accent: "emerald",
  },
  {
    id: "select",
    label: WORKFLOW_MODE_META.select.label,
    description: WORKFLOW_MODE_META.select.description,
    outcome: "Browse ranked alternatives side-by-side before committing",
    href: "/products/bearings/designer?intent=design&mode=select&panel=size",
    intent: "design",
    panel: "size",
    accent: "violet",
  },
  {
    id: "diagnose",
    label: WORKFLOW_MODE_META.diagnose.label,
    description: WORKFLOW_MODE_META.diagnose.description,
    outcome: "Screen failure risk, grease life, interchange, and defect frequencies",
    href: "/products/bearings/designer?intent=service&mode=diagnose&panel=system",
    intent: "service",
    panel: "system",
    accent: "amber",
  },
];

export type BearingQuickPath = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export const BEARING_QUICK_PATHS: BearingQuickPath[] = [
  {
    id: "single",
    label: "Single rolling bearing",
    description: "Search by designation or size from requirements — like Product Select",
    href: "/products/bearings/designer?intent=design&mode=check&panel=size",
  },
  {
    id: "catalog",
    label: "Catalog search",
    description: "Browse multi-OEM designations, then hand off to Designer",
    href: "/products/bearings/database",
  },
  {
    id: "arrangement",
    label: "Shaft arrangement",
    description: "Locating + floating or duplex O / X / T system sizing",
    href: "/products/bearings/designer?intent=design&mode=design&panel=system",
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

export function parseWorkflowModeParam(
  value: string | null | undefined
): DesignWorkflowMode | null {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v === "design" || v === "autodesign" || v === "auto-design") return "design";
  if (v === "check" || v === "validate") return "check";
  if (v === "select" || v === "compare") return "select";
  if (v === "diagnose" || v === "service") return "diagnose";
  return null;
}
