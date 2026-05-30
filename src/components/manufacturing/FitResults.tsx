import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import {
  CalculatorMetricCard,
  CalculatorMetricGrid,
} from "@/components/calculator/results";

type Props = {
  result: WithCalculationSpec<{
    holeMin: number;
    holeMax: number;
    shaftMin: number;
    shaftMax: number;
    clearanceMin: number;
    clearanceMax: number;
    fitType: "clearance" | "transition" | "interference";
  }> | null;
  displayUnit: string;
};

export default function FitResults({ result, displayUnit }: Props) {
  const format = (value: number) => `${value.toFixed(4)} ${displayUnit}`;

  const fitTone =
    result?.fitType === "clearance"
      ? "green"
      : result?.fitType === "interference"
        ? "red"
        : "amber";

  return (
    <CalculatorResultsShell
      moduleId="fits"
      fileName="fit"
      calculationSpec={result?.calculationSpec}
      result={result ?? undefined}
      title="Export Fit results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Select values and calculate the fit to view results."
      heading="Fit Results"
      csvRows={
        result
          ? [
              { metric: "clearanceMin", value: result.clearanceMin },
              { metric: "clearanceMax", value: result.clearanceMax },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricCard
            label="Fit type"
            value={result.fitType}
            tone={fitTone}
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Hole"
              value={`${format(result.holeMin)} to ${format(result.holeMax)}`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Shaft"
              value={`${format(result.shaftMin)} to ${format(result.shaftMax)}`}
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Clearance range"
            value={`${format(result.clearanceMin)} to ${format(result.clearanceMax)}`}
            tone="orange"
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
