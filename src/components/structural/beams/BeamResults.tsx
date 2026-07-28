"use client";

import { useMemo } from "react";
import type {
  BeamApplicationContext,
  BeamResult,
  BeamSupport,
  Load,
  SupportType,
} from "@/lib/structural/beams/types";
import BeamDashboard from "./BeamDashboard";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import type { CalculationSpec } from "@/lib/standards/types";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";
import type { DesignWorkflowMode } from "@/lib/design-workflows/workflowModeLabels";
import type { BeamLoadLibraryType } from "@/components/structural/beams/BeamLoadLibrary";
import type { ReportMeta } from "@/lib/export/structuredReport";
import type { Material } from "@/data/materials";
import {
  buildBeamCsvRows,
  buildBeamInputRows,
  buildBeamReportSections,
} from "@/lib/structural/beams/reportSections";

type DisplayUnits = {
  length: string;
  force: string;
  moment: string;
  stress: string;
};

type Props = {
  result: (BeamResult & { calculationSpec?: CalculationSpec }) | null;
  length: number;
  support: SupportType | "continuous";
  supports?: BeamSupport[];
  loads: Load[];
  units?: DisplayUnits;
  applicationContext?: BeamApplicationContext;
  workflowMode?: DesignWorkflowMode;
  onLoadDrag?: (id: string, updates: Partial<Load>) => void;
  onSupportDrag?: (id: string, x: number) => void;
  onDropLoad?: (type: BeamLoadLibraryType, x: number) => void;
  sectionDepth?: number;
  projectName?: string;
  sectionDesignation?: string;
  I?: number;
  c?: number;
  meshSegments?: number;
  material?: Material | null;
  reportMeta?: ReportMeta;
};

export default function BeamResults({
  result,
  length,
  support,
  supports,
  loads,
  units,
  applicationContext,
  workflowMode,
  onLoadDrag,
  onSupportDrag,
  onDropLoad,
  sectionDepth,
  projectName,
  sectionDesignation,
  I = 0,
  c = 0,
  meshSegments,
  material,
  reportMeta,
}: Props) {
  const reportCtx = useMemo(
    () => ({
      projectName,
      length,
      lengthUnit: units?.length,
      support: String(support),
      sectionDesignation,
      I,
      c,
      loads,
      meshSegments,
      material,
      calculationSpec: result?.calculationSpec ?? null,
    }),
    [
      projectName,
      length,
      units?.length,
      support,
      sectionDesignation,
      I,
      c,
      loads,
      meshSegments,
      material,
      result?.calculationSpec,
    ]
  );

  const reportSections = useMemo(
    () => (result ? buildBeamReportSections(result, reportCtx) : undefined),
    [result, reportCtx]
  );

  const inputRows = useMemo(() => buildBeamInputRows(reportCtx), [reportCtx]);

  const csvRows = useMemo(
    () => (result ? buildBeamCsvRows(result, reportCtx) : undefined),
    [result, reportCtx]
  );

  return (
    <CalculatorResultsShell
      moduleId="beams"
      fileName="beam"
      title="Export Beam design report"
      description="Design-review PDF with inputs, assumptions, equations, standards, checks, materials, and conclusion."
      empty={!result}
      emptyMessage="Define the problem, geometry, material, and loads — then run the design check."
      heading="Beam Results"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      inputRows={inputRows}
      reportSections={reportSections}
      reportMeta={reportMeta}
      csvRows={csvRows}
      qualityOverrides={chartModuleQuality({
        physicsValidation: Boolean(result?.solverMeta),
      })}
    >
      <div id="design-step-results" className="scroll-mt-4">
        {result ? (
          <div id="design-step-verification" className="scroll-mt-4">
            <BeamDashboard
              result={result}
              loads={loads}
              length={length}
              support={support}
              supports={supports}
              units={units}
              applicationContext={applicationContext ?? result.applicationContext}
              workflowMode={workflowMode}
              onLoadDrag={onLoadDrag}
              onSupportDrag={onSupportDrag}
              onDropLoad={onDropLoad}
              sectionDepth={sectionDepth}
            />
          </div>
        ) : null}
      </div>
    </CalculatorResultsShell>
  );
}
