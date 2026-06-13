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

type Props = {
  result: WithCalculationSpec<TrussResult> | null;
};

export default function TrussResults({ result }: Props) {
  const highestTension = result?.memberForces.reduce((best, member) => {
    if (member.force > best.force) return member;
    return best;
  }, result.memberForces[0]);

  const highestCompression = result?.memberForces.reduce((best, member) => {
    if (member.force < best.force) return member;
    return best;
  }, result.memberForces[0]);

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
              value={`${result.maxDisplacement.toExponential(3)} m`}
              tone="blue"
              size="lg"
            />
            <CalculatorMetricCard
              label="Max axial force"
              value={`${result.maxForce.toExponential(3)} N`}
              tone="orange"
              size="lg"
            />
          </CalculatorMetricGrid>
          {highestTension && highestCompression ? (
            <CalculatorMetricGrid cols={2}>
              <CalculatorMetricCard
                label="Highest tension member"
                value={`${highestTension.force.toExponential(3)} N`}
                tone="green"
              />
              <CalculatorMetricCard
                label="Highest compression member"
                value={`${highestCompression.force.toExponential(3)} N`}
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
