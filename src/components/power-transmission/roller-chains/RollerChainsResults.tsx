import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { RollerChainResult } from "@/lib/powerTransmission/roller-chains/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (RollerChainResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  powerUnit: string;
};

export default function RollerChainsResults({ result, lengthUnit, powerUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="roller-chains"
      fileName="roller-chain-drive"
      title="Export roller chain results"
      description="Export drive sizing summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter sprocket data and calculate the drive."
      heading="Roller chain drive results"
      csvRows={
        result
          ? [
              { metric: "ratio", value: result.ratio },
              { metric: "chainTension", value: result.chainTension },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "estimatedLifeHours", value: result.estimatedLifeHours },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Speed ratio" value={formatDisplayNumber(result.ratio)} tone="purple" />
            <CalculatorMetricCard label="Driven speed" value={`${formatDisplayNumber(result.drivenSpeed)} rpm`} tone="blue" />
            <CalculatorMetricCard label="Chain speed" value={formatEngineeringValue(result.chainSpeed, "m/s")} tone="blue" />
            <CalculatorMetricCard
              label="Center distance"
              value={formatEngineeringValue(fromBase(result.centerDistance, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Power utilization"
            numericValue={result.powerUtilization}
            tone={result.powerUtilization > 1 ? "red" : "green"}
            size="lg"
          />
          <CalculatorMetricCard label="Chain tension" value={formatEngineeringValue(result.chainTension, "N")} tone="orange" />
          <CalculatorMetricCard
            label="Power capacity (est.)"
            value={formatEngineeringValue(result.powerCapacity / (powerUnit === "kW" ? 1000 : 1), powerUnit)}
            tone="blue"
          />
          <CalculatorMetricCard label="Estimated life" value={`${formatDisplayNumber(result.estimatedLifeHours)} hr`} tone="blue" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
