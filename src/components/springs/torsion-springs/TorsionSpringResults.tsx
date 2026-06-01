import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { TorsionSpringResult } from "@/lib/springs/torsion-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
import { fromBase } from "@/lib/units/conversions";

type Props = {
  result: (TorsionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
};

export default function TorsionSpringResults({ result, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="torsion-springs"
      fileName="torsion-spring"
      title="Export torsion spring results"
      description="Export spring rate, torque and bending stress."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter spring geometry and calculate."
      heading="Torsion spring results"
      csvRows={
        result
          ? [
              { metric: "springRate", value: result.springRate },
              { metric: "torque", value: result.torque },
              { metric: "bendingStress", value: result.bendingStress },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Spring rate"
              value={formatEngineeringValue(result.springRate, "N·m/rad")}
              tone="blue"
            />
            <CalculatorMetricCard label="Torque at angle" value={formatEngineeringValue(result.torque, "N·m")} tone="purple" />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Bending stress"
            value={formatEngineeringValue(fromBase(result.bendingStress, "stress", stressUnit), stressUnit)}
            tone={result.safetyFactor < 1.5 ? "red" : "orange"}
            size="lg"
          />
          <CalculatorMetricCard
            label="Safety factor"
            numericValue={result.safetyFactor}
            tone={result.safetyFactor >= 2 ? "green" : result.safetyFactor >= 1.2 ? "orange" : "red"}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
