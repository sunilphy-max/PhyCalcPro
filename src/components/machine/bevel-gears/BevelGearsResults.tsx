import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { BevelGearResult } from "@/lib/machine/bevel-gears/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (BevelGearResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function BevelGearsResults({ result, lengthUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="bevel-gears"
      fileName="bevel-gear-screening"
      title="Export bevel gear results"
      description="Export geometry and strength screening summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter bevel gear data and calculate."
      heading="Bevel gear screening results"
      csvRows={
        result
          ? [
              { metric: "gearTeeth", value: result.gearTeeth },
              { metric: "pitchDiameter", value: result.pitchDiameter },
              { metric: "tangentialForce", value: result.tangentialForce },
              { metric: "bendingStress", value: result.bendingStress },
              { metric: "contactStress", value: result.contactStress },
              { metric: "bendingSafety", value: result.bendingSafety },
              { metric: "contactSafety", value: result.contactSafety },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Gear teeth"
              value={formatDisplayNumber(result.gearTeeth)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Pinion pitch diameter"
              value={formatEngineeringValue(fromBase(result.pitchDiameter, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Tangential force"
              value={formatEngineeringValue(result.tangentialForce, "N")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Bending stress"
              value={formatEngineeringValue(fromBase(result.bendingStress, "stress", stressUnit), stressUnit)}
              tone="orange"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Contact stress"
            value={formatEngineeringValue(fromBase(result.contactStress, "stress", stressUnit), stressUnit)}
            tone="orange"
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Bending safety"
              numericValue={result.bendingSafety}
              tone={result.bendingSafety >= 1.5 ? "green" : result.bendingSafety >= 1 ? "orange" : "red"}
            />
            <CalculatorMetricCard
              label="Contact safety"
              numericValue={result.contactSafety}
              tone={result.contactSafety >= 1.5 ? "green" : result.contactSafety >= 1 ? "orange" : "red"}
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
