import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { VBeltResult } from "@/lib/powerTransmission/v-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber } from "@/lib/display/formatEngineering";

type Props = {
  result: (VBeltResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
};

export default function VBeltsResults({ result, lengthUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="v-belts"
      fileName="v-belt-drive"
      title="Export V-belt results"
      description="Export drive sizing summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pulley data and calculate the drive."
      heading="V-belt drive results"
      csvRows={
        result
          ? [
              { metric: "beltLength", value: result.beltLength },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "pretensionEstimate", value: result.pretensionEstimate },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Belt length"
              value={`${formatDisplayNumber(fromBase(result.beltLength, "length", lengthUnit))} ${lengthUnit}`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Speed ratio"
              value={formatDisplayNumber(result.ratio)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Wrap angle (driver)"
              value={`${formatDisplayNumber(result.wrapAngleDriver)}°`}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Belt speed"
              value={`${formatDisplayNumber(result.beltSpeed)} m/s`}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Power utilization"
            numericValue={result.powerUtilization}
            tone={result.powerUtilization > 1 ? "red" : "green"}
            size="lg"
          />
          <CalculatorMetricCard
            label="Pretension estimate"
            value={`${formatDisplayNumber(result.pretensionEstimate)} N`}
            tone="orange"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
