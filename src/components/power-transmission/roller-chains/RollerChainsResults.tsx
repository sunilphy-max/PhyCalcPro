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
            <CalculatorMetricCard label="Speed ratio" numericValue={result.ratio} unit="—" tone="purple" />
            <CalculatorMetricCard label="Driven speed" numericValue={result.drivenSpeed} unit="rpm" tone="blue" />
            <CalculatorMetricCard label="Chain speed" numericValue={result.chainSpeed} unit="m/s" tone="blue" />
            <CalculatorMetricCard
              label="Center distance"
              numericValue={fromBase(result.centerDistance, "length", lengthUnit)} unit={lengthUnit}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Power utilization"
            numericValue={result.powerUtilization} unit="—"
            tone={result.powerUtilization > 1 ? "red" : "green"}
            size="lg"
          />
          <CalculatorMetricCard label="Chain tension" numericValue={result.chainTension} unit="N" tone="orange" />
          <CalculatorMetricCard
            label="Power capacity (est.)"
            numericValue={result.powerCapacity / (powerUnit === "kW" ? 1000 : 1)} unit={powerUnit}
            tone="blue"
          />
          <CalculatorMetricCard label="Estimated life" numericValue={result.estimatedLifeHours} unit="hr" tone="blue" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
