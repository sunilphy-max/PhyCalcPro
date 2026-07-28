/**
 * Workspace design-review section presence helpers (EDP-6).
 * Distinct from PDF ReportSection rows in reportSections.ts.
 */
import {
  WORKSPACE_REPORT_SECTION_ORDER,
  type WorkspaceReportSectionId,
} from "@/lib/workspace/designWorkspaceContract";
import type { CalculationSpec } from "@/lib/standards/types";
import type { ReportMeta } from "@/lib/export/structuredReportTypes";

export type WorkspaceReportSectionPresence = Partial<Record<WorkspaceReportSectionId, boolean>>;

export function buildWorkspaceReportSectionPresence(opts: {
  meta?: ReportMeta | null;
  spec?: CalculationSpec | null;
  hasCharts?: boolean;
  hasRevision?: boolean;
  hasMaterials?: boolean;
}): WorkspaceReportSectionPresence {
  const { meta, spec, hasCharts, hasRevision, hasMaterials } = opts;
  return {
    project: Boolean(meta?.project || meta?.engineer || meta?.revision),
    inputs: true,
    equations: Boolean(spec?.equations?.length),
    assumptions: Boolean(spec?.assumptions?.length),
    intermediates: Boolean(spec?.worksheetSteps?.length),
    checks: Boolean(spec?.checks?.length),
    materials: Boolean(hasMaterials),
    standards: Boolean(spec?.standards?.length),
    charts: Boolean(hasCharts),
    revision: Boolean(hasRevision || meta?.revision),
    conclusion: Boolean(spec?.checks?.length),
  };
}

export function workspaceReportSectionChecklist(presence: WorkspaceReportSectionPresence): {
  id: WorkspaceReportSectionId;
  present: boolean;
}[] {
  return WORKSPACE_REPORT_SECTION_ORDER.map((id) => ({
    id,
    present: presence[id] ?? false,
  }));
}
