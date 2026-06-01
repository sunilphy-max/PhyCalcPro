import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { GearRatioDesignResult } from "@/lib/machine/gear-ratio-design/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: (GearRatioDesignResult & { calculationSpec?: CalculationSpec }) | null;
  targetRatio: number;
};

export default function GearRatioDesignResults({ result, targetRatio }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="gear-ratio-design"
      fileName="gear-ratio-design"
      title="Export gear ratio results"
      description="Export optimized tooth counts and achieved ratio."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter target ratio and search for tooth counts."
      heading="Gear ratio design results"
      csvRows={
        result
          ? [
              { metric: "pinionTeeth", value: result.pinionTeeth },
              { metric: "gearTeeth", value: result.gearTeeth },
              { metric: "actualRatio", value: result.actualRatio },
              { metric: "error", value: result.error },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Pinion teeth"
              value={formatDisplayNumber(result.pinionTeeth)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Gear teeth"
              value={formatDisplayNumber(result.gearTeeth)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Actual ratio"
              value={formatDisplayNumber(result.actualRatio)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Target ratio"
              value={formatDisplayNumber(targetRatio)}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Ratio error"
            numericValue={result.error}
            tone={result.error < 0.01 ? "green" : result.error < 0.05 ? "orange" : "red"}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
