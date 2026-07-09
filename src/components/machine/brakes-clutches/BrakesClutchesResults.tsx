import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { BrakesClutchesResult } from "@/lib/machine/brakes-clutches/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (BrakesClutchesResult & { calculationSpec?: CalculationSpec }) | null;
  safetyFactorTarget: number;
};

export default function BrakesClutchesResults({ result, safetyFactorTarget }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="brakes-clutches"
      fileName="brakes-clutches"
      title="Export brake / clutch results"
      description="Export torque, power and energy dissipation summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter friction interface data and calculate."
      heading="Brake / clutch results"
      csvRows={
        result
          ? [
              { metric: "frictionTorque", value: result.frictionTorque },
              { metric: "powerDissipated", value: result.powerDissipated },
              { metric: "energyPerStop", value: result.energyPerStop },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Friction torque"
              numericValue={result.frictionTorque} unit="N·m"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Power dissipated"
              numericValue={result.powerDissipated} unit="W"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Energy per stop"
              numericValue={result.energyPerStop} unit="J"
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Safety factor"
            numericValue={result.safetyFactor} unit="—"
            tone={
              result.safetyFactor >= safetyFactorTarget
                ? "green"
                : result.safetyFactor >= 1
                  ? "orange"
                  : "red"
            }
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
