"use client";

import { useMemo } from "react";
import type { WithCalculationSpec } from "@/lib/standards/types";
import EngineeringPlot from "@/components/EngineeringPlot";
import TrussDiagram from "./TrussDiagram";
import type { TrussResult } from "@/lib/structural/trusses/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
  EngineeringPlotPicker,
  type PlotPickerTab,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { chartModuleQuality } from "@/lib/calculator/qualityOverrides";

type Props = {
  result: WithCalculationSpec<TrussResult> | null;
};

export default function TrussResults({ result }: Props) {
  const { highestTension, highestCompression } = useMemo(() => {
    if (!result?.memberForces.length) {
      return { highestTension: null, highestCompression: null };
    }
    const highestTension = result.memberForces.reduce((best, member) =>
      member.force > best.force ? member : best
    );
    const highestCompression = result.memberForces.reduce((best, member) =>
      member.force < best.force ? member : best
    );
    return { highestTension, highestCompression };
  }, [result]);

  const plotTabs = useMemo((): PlotPickerTab[] => {
    if (!result) return [];
    return [
      {
        id: "diagram",
        label: "Truss model",
        content: <TrussDiagram result={result} />,
      },
      {
        id: "deflection",
        label: "Top chord deflection",
        content: (
          <EngineeringPlot
            title="Top chord deflection"
            x={result.topNodesX}
            y={result.topDeflections}
            yLabel="Deflection"
            xLabel="Position along top chord"
            xUnit="m"
            unitLabel="m"
          />
        ),
      },
    ];
  }, [result]);

  return (
    <CalculatorResultsShell
      moduleId="trusses"
      fileName="truss"
      calculationSpec={result?.calculationSpec}
      title="Export Truss results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the truss analysis to see node displacements and member forces."
      heading="Truss Results"
      qualityOverrides={chartModuleQuality()}
      csvRows={
        result
          ? [
              { metric: "maxDisplacement", value: result.maxDisplacement },
              { metric: "maxForce", value: result.maxForce },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Peak displacement"
              numericValue={result.maxDisplacement} unit="m"
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Max axial force"
              numericValue={result.maxForce} unit="N"
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          {highestTension && highestCompression ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label={`Highest tension (${highestTension.id})`}
                numericValue={highestTension.force} unit="N"
                tone="green"
              />
              <CalculatorMetricCard
                label={`Highest compression (${highestCompression.id})`}
                numericValue={highestCompression.force} unit="N"
                tone="red"
              />
            </CalculatorMetricGrid>
          ) : null}
          <EngineeringPlotPicker tabs={plotTabs} defaultTabId="diagram" label="Result chart" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
