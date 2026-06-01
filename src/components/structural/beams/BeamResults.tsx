"use client";

import type {
  BeamApplicationContext,
  BeamResult,
  Load,
  SupportType,
} from "@/lib/structural/beams/types";
import BeamDashboard from "./BeamDashboard";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import type { CalculationSpec } from "@/lib/standards/types";

type DisplayUnits = {
  length: string;
  force: string;
  moment: string;
  stress: string;
};

type Props = {
  result: (BeamResult & { calculationSpec?: CalculationSpec }) | null;
  length: number;
  support: SupportType;
  loads: Load[];
  units?: DisplayUnits;
  applicationContext?: BeamApplicationContext;
  onLoadDrag?: (
    id: string,
    updates: Partial<Extract<Load, { type: "point" }>>
  ) => void;
};

export default function BeamResults({
  result,
  length,
  support,
  loads,
  units,
  applicationContext,
  onLoadDrag,
}: Props) {
  return (
    <CalculatorResultsShell
      moduleId="beams"
      fileName="beam"
      title="Export Beam results"
      description="Export the current summary and charts for review."
      empty={!result}
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
            ]
          : undefined
      }
      qualityOverrides={{
        unitIntegrity: true,
        physicsValidation: Boolean(result?.solverMeta),
        chartConformance: true,
        pictorialCoverage: true,
        exportConsistency: true,
      }}
    >
      {result ? (
        <BeamDashboard
          result={result}
          loads={loads}
          length={length}
          support={support}
          units={units}
          applicationContext={applicationContext ?? result.applicationContext}
          onLoadDrag={onLoadDrag}
        />
      ) : null}
    </CalculatorResultsShell>
  );
}
