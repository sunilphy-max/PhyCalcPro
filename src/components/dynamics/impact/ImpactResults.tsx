"use client";

import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import type { WithCalculationSpec } from "@/lib/standards/types";
import type { ImpactResult } from "@/lib/dynamics/impact/types";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<ImpactResult> | null;
};

export default function ImpactResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="impact"
      fileName="impact"
      title="Export Impact results"
      description="Export the current summary for review."
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      empty={!result}
      heading="Impact Results"
      csvRows={
        result
          ? [
              { metric: "impulse", value: result.impulse },
              { metric: "averageForce", value: result.averageForce },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <CalculatorMetricGrid cols={2}>
          <CalculatorMetricCard
            label="Impulse"
            numericValue={result.impulse} unit="N·s"
            tone="blue"
            size="lg"
          />
          <CalculatorMetricCard
            label="Average force"
            numericValue={result.averageForce} unit="N"
            tone="purple"
            size="lg"
          />
          <CalculatorMetricCard
            label="Dynamic stress"
            numericValue={result.dynamicStress} unit="MPa"
            tone="orange"
            size="lg"
          />
          <CalculatorMetricCard
            label="Safety factor"
            numericValue={result.safetyFactor} unit="—"
            tone="green"
            size="lg"
          />
        </CalculatorMetricGrid>
      ) : null}
    </CalculatorResultsShell>
  );
}
