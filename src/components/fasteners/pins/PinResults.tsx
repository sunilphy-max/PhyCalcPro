import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { PinResult } from "@/lib/fasteners/pins/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (PinResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
};

function safetyTone(sf: number): "green" | "orange" | "red" {
  if (sf >= 2) return "green";
  if (sf >= 1.2) return "orange";
  return "red";
}

export default function PinResults({ result, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="pins"
      fileName="pin-clevis"
      title="Export pin results"
      description="Export shear, bearing and safety summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pin geometry and load, then calculate."
      heading="Pin & clevis results"
      csvRows={
        result
          ? [
              { metric: "shearStress", value: result.shearStress },
              { metric: "bearingStress", value: result.bearingStress },
              { metric: "shearSafety", value: result.shearSafety },
              { metric: "bearingSafety", value: result.bearingSafety },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Shear stress"
              value={formatEngineeringValue(fromBase(result.shearStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Bearing stress"
              value={formatEngineeringValue(fromBase(result.bearingStress, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Shear safety factor"
            numericValue={result.shearSafety}
            tone={safetyTone(result.shearSafety)}
            size="lg"
          />
          <CalculatorMetricCard
            label="Bearing safety factor"
            numericValue={result.bearingSafety}
            tone={safetyTone(result.bearingSafety)}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
