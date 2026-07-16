"use client";

import { useMemo } from "react";
import { fromBase } from "@/lib/units/conversions";
import EngineeringPlot from "@/components/EngineeringPlot";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import type { CircularPlateResult } from "@/lib/structural/circular-plates/types";
import type { CalculationSpec } from "@/lib/standards/types";

type Props = {
  result: (CircularPlateResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function CircularPlatesResults({ result, lengthUnit, stressUnit }: Props) {
  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result?.radialStations?.length) return [];
    const r = result.radialStations.map((v) => fromBase(v, "length", lengthUnit));
    const w = result.deflectionProfile.map((v) => fromBase(v, "length", lengthUnit));
    const roarkCenter = fromBase(result.roarkMaxDeflection, "length", lengthUnit);
    const roarkLine = result.radialStations.map((station, i) => {
      const a = result.radialStations[result.radialStations.length - 1] || 1;
      const xi = a > 0 ? station / a : 0;
      // Cosine-like shape matching clamped/simply-supported peak at center for preview only.
      return roarkCenter * Math.cos((Math.PI / 2) * xi);
    });

    return [
      {
        id: "deflection",
        label: "Deflection profile",
        content: (
          <EngineeringPlot
            title="Radial deflection (FDM vs Roark shape)"
            x={r}
            y={w}
            yLabel="Deflection"
            xLabel="Radius"
            xUnit={lengthUnit}
            unitLabel={lengthUnit}
            series={[
              {
                y: roarkLine,
                label: "Roark shape (scaled)",
                unitLabel: lengthUnit,
                color: "#10b981",
              },
            ]}
          />
        ),
      },
    ];
  }, [lengthUnit, result]);

  return (
    <CalculatorResultsShell
      moduleId="circular-plates"
      fileName="circular-plate"
      title="Export circular plate results"
      description="Export deflection, stress and flexural rigidity."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter plate geometry and pressure, then calculate."
      heading="Circular plate results"
      csvRows={
        result
          ? [
              { metric: "maxDeflection", value: result.maxDeflection },
              { metric: "maxStress", value: result.maxStress },
              { metric: "rigidity", value: result.rigidity },
              { metric: "femDeflectionErrorPercent", value: result.femDeflectionErrorPercent },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Max deflection (center)"
              numericValue={fromBase(result.maxDeflection, "length", lengthUnit)}
              unit={lengthUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Max bending stress"
              numericValue={fromBase(result.maxStress, "stress", stressUnit)}
              unit={stressUnit}
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Flexural rigidity D"
            numericValue={result.rigidity}
            unit="N·m"
            tone="blue"
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Roark deflection (reference)"
              numericValue={fromBase(result.roarkMaxDeflection, "length", lengthUnit)}
              unit={lengthUnit}
              tone="green"
            />
            <CalculatorMetricCard
              label="FDM vs Roark error"
              numericValue={result.femDeflectionErrorPercent}
              unit="%"
              tone={result.femDeflectionErrorPercent < 15 ? "green" : "orange"}
            />
          </CalculatorMetricGrid>
          <p className="text-sm text-slate-500">
            Mesh segments: {result.meshSegments}. Refine mesh to converge toward Roark closed-form.
          </p>
          {plotTabs.length ? (
            <EngineeringPlotPicker tabs={plotTabs} defaultTabId="deflection" label="Result view" />
          ) : null}
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
