"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import WorkspaceChrome from "@/components/workspace/WorkspaceChrome";
import CalculatorKnowledgePanel from "@/components/calculator/CalculatorKnowledgePanel";
import WorkspaceMaterialsPanel from "@/components/workspace/WorkspaceMaterialsPanel";
import WorkspaceAiPanel from "@/components/workspace/WorkspaceAiPanel";
import WorkspaceTeachPanel from "@/components/workspace/WorkspaceTeachPanel";
import WorkspaceReportPanel from "@/components/workspace/WorkspaceReportPanel";
import EngineeringScene from "@/components/workspace/EngineeringScene";
import { useModuleWorkspaceOptional } from "@/contexts/ModuleWorkspaceContext";
import {
  buildWorkspaceContractForModule,
  getModuleWorkspaceEntry,
} from "@/lib/workspace/workspaceRegistry";
import { findMaterial, type Material } from "@/data/materials";
import { dispatchMaterialApply } from "@/lib/workspace/materialEvents";
import {
  appendRevision,
  hashInputs,
  loadRevisions,
} from "@/lib/workspace/projectRevisions";
import type { CopilotParams } from "@/lib/copilot/types";

type Props = {
  moduleId: string;
  title: string;
  children: ReactNode;
};

/**
 * Fleet-wide Design Workspace wrapper — Knowledge / Materials / Report / AI / Teach (+ optional Model).
 */
export default function ModuleWorkspaceShell({ moduleId, title, children }: Props) {
  const workspace = useModuleWorkspaceOptional();
  const setRevisions = workspace?.setRevisions;
  const setSelectedMaterialName = workspace?.setSelectedMaterialName;
  const applyMaterial = workspace?.applyMaterial;
  const entry = useMemo(() => getModuleWorkspaceEntry(moduleId), [moduleId]);
  const contract = useMemo(() => {
    const base = buildWorkspaceContractForModule(moduleId);
    return { ...base, title: base.title || title };
  }, [moduleId, title]);

  const searchParams = useSearchParams();
  const [projectName] = useState(`${entry.title}`);

  // Centralized ?material= deep-link for every module (once per query value)
  const materialQuery = searchParams.get("material");
  useEffect(() => {
    if (!materialQuery) return;
    const name = decodeURIComponent(materialQuery);
    const material = findMaterial(name);
    if (!material) return;
    setSelectedMaterialName?.(material.name);
    applyMaterial?.(material);
  }, [materialQuery, moduleId, setSelectedMaterialName, applyMaterial]);

  useEffect(() => {
    if (!setRevisions) return;
    const next = loadRevisions(moduleId, projectName);
    setRevisions((prev) => {
      if (prev.length === 0 && next.length === 0) return prev;
      return next;
    });
  }, [moduleId, projectName, setRevisions]);

  if (workspace && !workspace.workspaceEnabled) {
    return <>{children}</>;
  }

  const tabs = entry.tabs ?? {};
  const overrides = workspace?.tabOverrides ?? {};

  const onApplyMaterial = (material: Material) => {
    if (workspace) {
      workspace.applyMaterial(material);
      return;
    }
    dispatchMaterialApply({
      material,
      profile: entry.materialProfile,
      source: "workspace",
    });
  };

  const onAiApply = (payload: {
    params: CopilotParams;
    startModuleId: string | null;
    explanation: string;
    source: "llm" | "deterministic";
  }) => {
    // Prefer material name tokens if present in explanation/params extras — otherwise no-op;
    // module-specific AI apply can be registered later via tab override.
    void payload;
  };

  const summaryRows =
    workspace?.summaryRows?.length
      ? workspace.summaryRows
      : [
          {
            label: "Module",
            value: moduleId,
            status: "neutral" as const,
          },
          {
            label: "Material catalog",
            value: entry.acceptsCatalogMaterial
              ? "Bound via Materials tab / form select"
              : "Catalog browseable (module uses specialty materials)",
            status: "neutral" as const,
          },
        ];

  return (
    <WorkspaceChrome
      contract={contract}
      calculator={children}
      banner={
        <p className="text-xs text-slate-500">
          Design workspace — calculator, knowledge, materials, report, and AI. Numbers always come from
          verified solvers.
        </p>
      }
      tabs={{
        knowledge: tabs.knowledge
          ? overrides.knowledge ?? (
              <CalculatorKnowledgePanel knowledgeSlug={entry.knowledgeSlug} title={entry.title} />
            )
          : undefined,
        materials: tabs.materials
          ? overrides.materials ?? (
              <WorkspaceMaterialsPanel
                selectedName={workspace?.selectedMaterialName ?? undefined}
                onApply={onApplyMaterial}
              />
            )
          : undefined,
        model:
          tabs.model
            ? overrides.model ?? (
                <div className="space-y-2">
                  <EngineeringScene length={1} mode={entry.diagramKind?.kind === "shaft-1d" ? "shaft" : "beam"} />
                  <p className="text-xs text-slate-500">
                    Schematic 3D preview. Flagship modules can replace this tab with a live model.
                  </p>
                </div>
              )
            : overrides.model,
        report: tabs.report
          ? overrides.report ?? (
              <WorkspaceReportPanel
                projectName={projectName}
                summaryRows={summaryRows}
                revisions={workspace?.revisions ?? []}
                onSaveRevision={(note) => {
                  if (!workspace) return;
                  workspace.setRevisions(
                    appendRevision(
                      moduleId,
                      projectName,
                      note,
                      hashInputs({ moduleId, material: workspace.selectedMaterialName })
                    )
                  );
                }}
              />
            )
          : undefined,
        ai: tabs.ai
          ? overrides.ai ?? (
              <WorkspaceAiPanel moduleId={moduleId} onApply={onAiApply} />
            )
          : undefined,
        teach: tabs.teach
          ? overrides.teach ?? (
              <WorkspaceTeachPanel prompts={entry.teachPrompts ?? []} />
            )
          : undefined,
      }}
    />
  );
}
