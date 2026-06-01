import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { TimingBeltResult } from "@/lib/powerTransmission/timing-belts/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (TimingBeltResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
};

export default function TimingBeltsResults({ result, lengthUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="timing-belts"
      fileName="timing-belt-drive"
      title="Export timing belt results"
      description="Export drive sizing summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pulley data and calculate the drive."
      heading="Timing belt drive results"
      csvRows={
        result
          ? [
              { metric: "ratio", value: result.ratio },
              { metric: "beltLength", value: result.beltLength },
              { metric: "powerUtilization", value: result.powerUtilization },
              { metric: "tangentialForce", value: result.tangentialForce },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Speed ratio" value={formatDisplayNumber(result.ratio)} tone="purple" />
            <CalculatorMetricCard label="Driven speed" value={`${formatDisplayNumber(result.drivenSpeed)} rpm`} tone="blue" />
            <CalculatorMetricCard
              label="Pitch diameter (driver)"
              value={formatEngineeringValue(fromBase(result.pitchDiameterDriver, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Pitch diameter (driven)"
              value={formatEngineeringValue(fromBase(result.pitchDiameterDriven, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Center distance"
              value={formatEngineeringValue(fromBase(result.centerDistance, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard label="Belt length (teeth)" value={formatDisplayNumber(result.beltLengthTeeth)} tone="blue" />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Power utilization"
            numericValue={result.powerUtilization}
            tone={result.powerUtilization > 1 ? "red" : "green"}
            size="lg"
          />
          <CalculatorMetricCard label="Tangential force" value={formatEngineeringValue(result.tangentialForce, "N")} tone="orange" />
          <CalculatorMetricCard label="Shaft load (est.)" value={formatEngineeringValue(result.shaftLoadEstimate, "N")} tone="orange" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
