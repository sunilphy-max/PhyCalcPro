import type { WithCalculationSpec } from "@/lib/standards/types";
import type { CostEstimatorResult } from "@/lib/manufacturing/costEstimator/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";

type Props = {
  result: WithCalculationSpec<CostEstimatorResult> | null;
};

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
              numericValue={result.materialMass} unit="kg"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Scrap mass"
              numericValue={result.scrapMass} unit="kg"
              tone="blue"
            />
            <CalculatorMetricCard label="Material cost" numericValue={result.materialCost} unit="USD" tone="purple" />
            <CalculatorMetricCard label="Machining cost" numericValue={result.machiningCost} unit="USD" tone="orange" />
            <CalculatorMetricCard label="Labor cost" numericValue={result.laborCost} unit="USD" tone="orange" />
            <CalculatorMetricCard label="Finish cost" numericValue={result.finishCost} unit="USD" tone="orange" />
            <CalculatorMetricCard label="Overhead cost" numericValue={result.overheadCost} unit="USD" tone="orange" />
          </CalculatorMetricGrid>

          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Total manufacturing cost"
              numericValue={result.totalCost}
              unit="USD"
              tone="green"
              size="lg"
            />
            <CalculatorMetricCard
              label="Cost per volume"
              numericValue={result.costPerVolume}
              unit="USD/m³"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Cost per mass"
              numericValue={result.costPerMass}
              unit="USD/kg"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Effective material cost"
              numericValue={result.effectiveMaterialCost}
              unit="USD"
              tone="purple"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
