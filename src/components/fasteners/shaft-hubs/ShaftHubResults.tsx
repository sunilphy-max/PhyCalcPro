import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { ShaftHubResult } from "@/lib/fasteners/shaft-hubs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (ShaftHubResult & { calculationSpec?: CalculationSpec }) | null;
  stressUnit: string;
  torqueUnit: string;
};

export default function ShaftHubResults({ result, stressUnit, torqueUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="shaft-hubs"
      fileName="shaft-hub-fit"
      title="Export shaft hub results"
      description="Export contact pressure, torque and assembly force."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter hub geometry and interference, then calculate."
      heading="Shaft hub fit results"
      csvRows={
        result
          ? [
              { metric: "contactPressure", value: result.contactPressure },
              { metric: "frictionTorque", value: result.frictionTorque },
              { metric: "requiredAssemblyForce", value: result.requiredAssemblyForce },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Contact pressure"
              value={formatEngineeringValue(fromBase(result.contactPressure, "stress", stressUnit), stressUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Friction torque capacity"
              value={formatEngineeringValue(fromBase(result.frictionTorque, "torque", torqueUnit), torqueUnit)}
              tone="purple"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Required assembly force"
            value={formatEngineeringValue(result.requiredAssemblyForce, "N")}
            tone="orange"
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
