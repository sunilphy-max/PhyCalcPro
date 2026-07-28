import type { CalculationSpec } from "@/lib/standards/types";

/**
 * Design Workspace contract (EDP-0).
 * Every flagship module should eventually expose these bindings to WorkspaceChrome.
 */

export type WorkspaceTabId =
  | "calculator"
  | "knowledge"
  | "materials"
  | "model"
  | "report"
  | "ai"
  | "teach";

export type WorkspaceMaterialBinding = {
  /** Material catalog id or display name currently applied */
  materialId?: string;
  materialName?: string;
  /** Calculator field keys that receive E, Fy, density, etc. */
  boundFields?: string[];
};

export type WorkspaceReportSectionId =
  | "project"
  | "inputs"
  | "equations"
  | "assumptions"
  | "intermediates"
  | "checks"
  | "materials"
  | "standards"
  | "charts"
  | "revision"
  | "conclusion";

export const WORKSPACE_REPORT_SECTION_ORDER: WorkspaceReportSectionId[] = [
  "project",
  "inputs",
  "equations",
  "assumptions",
  "intermediates",
  "checks",
  "materials",
  "standards",
  "charts",
  "revision",
  "conclusion",
];

export type WorkspaceAiContext = {
  moduleId: string;
  /** Short natural-language summary of current design intent */
  briefHint?: string;
  /** Params already known (SI-ish); AI may fill gaps only */
  knownParams?: Record<string, number | string>;
};

export type WorkspaceDiagramModel = {
  kind: "beam-2d" | "shaft-1d" | "bearing-schematic" | "generic";
  /** Opaque payload consumed by InteractiveDiagramKit / EngineeringScene */
  payload?: Record<string, unknown>;
};

export type DesignWorkspaceContract = {
  moduleId: string;
  title: string;
  knowledgeSlug: string;
  materialBindings?: WorkspaceMaterialBinding;
  reportSections?: WorkspaceReportSectionId[];
  calculationSpec?: CalculationSpec;
  diagramModel?: WorkspaceDiagramModel;
  aiContext?: WorkspaceAiContext;
  /** Related calculator module ids for cross-links */
  relatedModuleIds?: string[];
};

export const F1_WORKSPACE_MODULES = ["beams", "shafts", "bearings"] as const;
export const F2_WORKSPACE_MODULES = [
  "compression-springs",
  "gears",
  "bolts",
] as const;

export function defaultReportSections(): WorkspaceReportSectionId[] {
  return [...WORKSPACE_REPORT_SECTION_ORDER];
}

export function buildBeamWorkspaceContract(partial?: Partial<DesignWorkspaceContract>): DesignWorkspaceContract {
  return {
    moduleId: "beams",
    title: "Beam Design Workspace",
    knowledgeSlug: "beams",
    reportSections: defaultReportSections(),
    relatedModuleIds: ["columns", "combined-loading", "shafts"],
    diagramModel: { kind: "beam-2d" },
    aiContext: { moduleId: "beams" },
    ...partial,
  };
}
