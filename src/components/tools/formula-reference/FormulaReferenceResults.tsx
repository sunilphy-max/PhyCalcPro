import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { FormulaReferenceResult } from "@/lib/tools/formula-reference/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (FormulaReferenceResult & { calculationSpec?: CalculationSpec }) | null;
};

export default function FormulaReferenceResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="formula-reference"
      fileName="formula-reference"
      title="Export formula result"
      description="Export evaluated expression and numeric result."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Choose a formula, enter values, and evaluate."
      heading="Formula result"
      csvRows={
        result
          ? [
              { metric: "formulaName", value: result.formulaName },
              { metric: "result", value: result.result },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Formula" value={result.formulaName} tone="blue" />
            <CalculatorMetricCard label="Expression" value={result.expression} tone="purple" />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Result"
            value={formatEngineeringValue(result.result, result.unit)}
            tone="green"
            size="lg"
          />
          <p className="text-xs text-slate-500">
            Raw value: {formatDisplayNumber(result.result)} {result.unit}
          </p>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
