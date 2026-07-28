"use client";

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
  sectionDepth?: number;
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
  sectionDepth,
}: Props) {
  return (
    <CalculatorResultsShell
      moduleId="beams"
      fileName="beam"
      title="Export Beam results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Define beam geometry, supports, and loads, then run the analysis."
      heading="Beam Results"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      csvRows={
        result
          ? [
              { metric: "maxMoment", value: result.maxMoment },
              { metric: "maxShear", value: result.maxShear },
              { metric: "maxStress", value: result.maxStress },
              { metric: "maxDeflection", value: result.maxDeflection },
              ...(result.supportReactions ?? []).map((r) => ({
                metric: `reaction_${r.supportId}_Fy`,
                value: r.Fy,
              })),
            ]
          : undefined
      }
      qualityOverrides={chartModuleQuality({
        physicsValidation: Boolean(result?.solverMeta),
      })}
    >
      {result ? (
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
          sectionDepth={sectionDepth}
        />
      ) : null}
    </CalculatorResultsShell>
  );
}
