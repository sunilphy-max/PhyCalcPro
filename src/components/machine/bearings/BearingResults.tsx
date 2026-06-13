import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { BearingResult } from "@/lib/machine/bearings/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<BearingResult> | null;
  loadUnit: string;
};

export default function BearingResults({ result, loadUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="bearings"
      fileName="bearing"
      calculationSpec={result?.calculationSpec}
      title="Export Bearing results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the calculation to see equivalent loads and dynamic rating requirements."
      heading="Bearing life results"
      csvRows={
        result
          ? [
              { metric: "equivalentLoad", value: result.equivalentLoad },
              { metric: "requiredDynamicRating", value: result.requiredDynamicRating },
              { metric: "expectedLife", value: result.expectedLife },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Radial load"
              value={`${formatDisplayNumber(fromBase(result.radialLoad, "force", loadUnit))} ${loadUnit}`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Axial load"
              value={`${formatDisplayNumber(fromBase(result.axialLoad, "force", loadUnit))} ${loadUnit}`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Equivalent load"
              value={`${formatDisplayNumber(fromBase(result.equivalentLoad, "force", loadUnit))} ${loadUnit}`}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Required dynamic rating"
              value={`${formatDisplayNumber(result.requiredDynamicRating)} N`}
              tone="purple"
            />
            <CalculatorMetricCard
              label={`Rating used (C)${result.designation ? ` — ${result.designation}` : ""}`}
              value={`${formatDisplayNumber(result.dynamicLoadRatingN)} N`}
              tone="blue"
            />
            <CalculatorMetricCard
              label={`Expected L10 life (a1 = ${result.a1}, p = ${result.lifeExponent === 3 ? "3" : "10/3"})`}
              value={`${formatDisplayNumber(result.expectedLife)} h`}
              tone="green"
            />
            <CalculatorMetricCard
              label="Life utilization (required / expected)"
              numericValue={result.lifeUtilization}
              tone={result.lifeUtilization <= 1 ? "green" : "red"}
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Safety factor"
            numericValue={result.safetyFactor}
            tone={result.safetyFactor >= 1 ? "green" : "red"}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
