import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CostEstimatorResult } from "@/lib/manufacturing/costEstimator/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<CostEstimatorResult> | null;
};

function currency(value: number) {
  return formatEngineeringValue(value, "USD");
}

export default function CostEstimatorResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="cost-estimator"
      fileName="cost-estimator"
      calculationSpec={result?.calculationSpec}
      title="Export Cost Estimator results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter material and process assumptions to estimate total production cost."
      heading="Cost estimation results"
      csvRows={
        result
          ? [
              { metric: "materialCost", value: result.materialCost },
              { metric: "machiningCost", value: result.machiningCost },
              { metric: "totalCost", value: result.totalCost },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Material mass"
              value={formatEngineeringValue(result.materialMass, "kg")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Scrap mass"
              value={formatEngineeringValue(result.scrapMass, "kg")}
              tone="blue"
            />
            <CalculatorMetricCard label="Material cost" value={currency(result.materialCost)} tone="purple" />
            <CalculatorMetricCard label="Machining cost" value={currency(result.machiningCost)} tone="orange" />
            <CalculatorMetricCard label="Labor cost" value={currency(result.laborCost)} tone="orange" />
            <CalculatorMetricCard label="Finish cost" value={currency(result.finishCost)} tone="orange" />
            <CalculatorMetricCard label="Overhead cost" value={currency(result.overheadCost)} tone="orange" />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Total manufacturing cost"
              value={currency(result.totalCost)}
              tone="green"
              size="lg"
            />
            <CalculatorMetricCard
              label="Cost per volume"
              value={`${currency(result.costPerVolume)} /m³`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Cost per mass"
              value={`${currency(result.costPerMass)} /kg`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Effective material cost"
              value={currency(result.effectiveMaterialCost)}
              tone="purple"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
