"use client";

import { useMemo } from "react";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CombinedLoadingResult } from "@/lib/structural/combinedLoading/types";

type Props = {
  result: WithCalculationSpec<CombinedLoadingResult> | null;
};

export default function CombinedLoadingResults({ result }: Props) {
  const statusTone =
    result?.designStatus === "safe"
      ? "green"
      : result?.designStatus === "warning"
        ? "orange"
        : "red";

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    const labels = [1, 2, 3, 4, 5];
    const stressesMPa = [
      result.axialStress,
      result.bendingStress,
      result.torsionalShear,
      result.shearStress,
      result.vonMisesStress,
    ].map((v) => v / 1e6);

    return [
      {
        id: "stress-components",
        label: "Stress components",
        content: (
          <EngineeringPlot
            title="Stress components (screening)"
            x={labels}
            y={stressesMPa}
            yLabel="Stress"
            xLabel="Component (1 axial, 2 bending, 3 torsion, 4 shear, 5 von Mises)"
            xUnit="—"
            unitLabel="MPa"
            showPeak
          />
        ),
      },
    ];
  }, [result]);

  return (
    <CalculatorResultsShell
      moduleId="combined-loading"
      fileName="combined-loading"
      title="Export Combined Loading results"
      description="Export the current summary for review."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Run the calculation to review combined stresses and safety factor."
      heading="Combined loading results"
      result={result ?? undefined}
      csvRows={
        result
          ? [
              { metric: "vonMisesStress", value: result.vonMisesStress },
              { metric: "safetyFactor", value: result.safetyFactor },
              { metric: "axialStress", value: result.axialStress },
              { metric: "bendingStress", value: result.bendingStress },
              { metric: "torsionalShear", value: result.torsionalShear },
              { metric: "shearStress", value: result.shearStress },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Von Mises stress"
              numericValue={result.vonMisesStress / 1e6}
              unit="MPa"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Safety factor"
              numericValue={result.safetyFactor}
              unit="—"
              tone={result.safetyFactor >= 1 ? "green" : "red"}
            />
            <CalculatorMetricCard
              label="Axial stress"
              numericValue={result.axialStress / 1e6}
              unit="MPa"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bending stress"
              numericValue={result.bendingStress / 1e6}
              unit="MPa"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Torsional shear"
              numericValue={result.torsionalShear / 1e6}
              unit="MPa"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Transverse shear"
              numericValue={result.shearStress / 1e6}
              unit="MPa"
              tone="orange"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Design status"
            value={result.designStatus.charAt(0).toUpperCase() + result.designStatus.slice(1)}
            tone={statusTone}
            size="lg"
          />
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="stress-components" label="Result view" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
