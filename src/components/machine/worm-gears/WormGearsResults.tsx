import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { WormGearResult } from "@/lib/machine/worm-gears/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";
import { fromBase } from "@/lib/units/conversions";

type Props = {
  result: (WormGearResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
};

export default function WormGearsResults({ result, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="worm-gears"
      fileName="worm-gear-drive"
      title="Export worm gear results"
      description="Export ratio, efficiency and contact stress summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter worm drive data and calculate."
      heading="Worm gear drive results"
      csvRows={
        result
          ? [
              { metric: "ratio", value: result.ratio },
              { metric: "efficiency", value: result.efficiency },
              { metric: "wormTorque", value: result.wormTorque },
              { metric: "contactStress", value: result.contactStress },
              { metric: "contactSafety", value: result.contactSafety },
              { metric: "axialForce", value: result.axialForce },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Speed ratio"
              numericValue={result.ratio} unit="—"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Efficiency"
              numericValue={result.efficiency * 100} unit="%"
              tone={result.efficiency < 0.5 ? "orange" : "purple"}
            />
            <CalculatorMetricCard
              label="Worm torque"
              numericValue={result.wormTorque} unit="N·m"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Axial force"
              numericValue={result.axialForce} unit="N"
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Contact stress"
            numericValue={fromBase(result.contactStress, "stress", stressUnit)} unit={stressUnit}
            tone="orange"
            size="lg"
          />
          <CalculatorMetricCard
            label="Contact safety"
            numericValue={result.contactSafety} unit="—"
            tone={result.contactSafety >= 1.5 ? "green" : result.contactSafety >= 1 ? "orange" : "red"}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
