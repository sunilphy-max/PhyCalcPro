"use client";

import type { WithCalculationSpec } from "@/lib/standards/types";
import ShaftDashboard from "./ShaftDashboard";
import type { LoadCase, ShaftResult } from "@/lib/machine/shafts/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type LayoutPreview = {
  length: number;
  diameter: number;
  loads: LoadCase[];
  lengthUnit?: string;
};

type Props = {
  result: WithCalculationSpec<ShaftResult> | null;
  projectName: string;
  layout?: LayoutPreview;
};

export default function ShaftResults({ result, projectName, layout }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="shafts"
      fileName={projectName || "shaft"}
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Shaft results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter shaft geometry, bearings, and loads, then calculate."
      heading="Shaft Results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "maxStress", value: result.maxStress },
              { metric: "maxDeflection", value: result.maxDeflection },
              { metric: "criticalSpeed", value: result.criticalSpeed },
            ]
          : undefined
      }
    >
      {result ? <ShaftDashboard result={result} layout={layout} /> : null}
    </CalculatorResultsShell>
  );
}
