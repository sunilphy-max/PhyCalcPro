import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { KeysSplinesResult } from "@/lib/fasteners/keys-splines/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (KeysSplinesResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
  torqueUnit: string;
};

function safetyTone(sf: number): "green" | "orange" | "red" {
  if (sf >= 2) return "green";
  if (sf >= 1.2) return "orange";
  return "red";
}

export default function KeysSplinesResults({ result, stressUnit, torqueUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="keys-splines"
      fileName="keys-splines"
      title="Export key & spline results"
      description="Export shear, bearing and capacity summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter key geometry and torque, then calculate."
      heading="Keys & splines results"
      csvRows={
        result
          ? [
              { metric: "shearStress", value: result.shearStress },
              { metric: "bearingStress", value: result.bearingStress },
              { metric: "shearSafety", value: result.shearSafety },
              { metric: "bearingSafety", value: result.bearingSafety },
              { metric: "capacityTorque", value: result.capacityTorque },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Shear stress"
              numericValue={fromBase(result.shearStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bearing stress"
              numericValue={fromBase(result.bearingStress, "stress", stressUnit)} unit={stressUnit}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Shear safety factor"
              numericValue={result.shearSafety} unit="—"
              tone={safetyTone(result.shearSafety)}
            />
            <CalculatorMetricCard
              label="Bearing safety factor"
              numericValue={result.bearingSafety} unit="—"
              tone={safetyTone(result.bearingSafety)}
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Capacity torque"
            numericValue={fromBase(result.capacityTorque, "torque", torqueUnit)} unit={torqueUnit}
            tone="purple"
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
