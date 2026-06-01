import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { UnitConverterResult } from "@/lib/tools/unit-converter/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (UnitConverterResult & { calculationSpec?: CalculationSpec }) | null;
  inputValue: number;
  fromUnit: string;
};

export default function UnitConverterResults({ result, inputValue, fromUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="unit-converter"
      fileName="unit-conversion"
      title="Export conversion"
      description="Export converted value and unit pair."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter a value and units, then convert."
      heading="Conversion result"
      csvRows={
        result
          ? [
              { metric: "input", value: inputValue },
              { metric: "convertedValue", value: result.convertedValue },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Input"
              value={formatEngineeringValue(inputValue, fromUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Converted"
              value={formatEngineeringValue(result.convertedValue, result.toUnit)}
              tone="green"
            />
          </CalculatorMetricGrid>
          <p className="text-sm text-slate-600">
            {formatDisplayNumber(inputValue)} {result.fromUnit} = {formatDisplayNumber(result.convertedValue)}{" "}
            {result.toUnit} ({result.dimension})
          </p>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
