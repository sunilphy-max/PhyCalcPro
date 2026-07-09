import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type RotationResult = {
  inertia: number;
  omega: number;
  kineticEnergy: number;
  centripetalAcceleration: number;
  centripetalForce: number;
  torque: number;
};

type Props = {
  result: WithCalculationSpec<RotationResult> | null;
};

export default function RotationResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="rotation"
      fileName="rotation"
      calculationSpec={result?.calculationSpec}
      title="Export Rotation results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Enter rotation data and calculate the dynamic response."
      heading="Rotation results"
      csvRows={
        result
          ? [
              { metric: "inertia", value: result.inertia },
              { metric: "omega", value: result.omega },
              { metric: "kineticEnergy", value: result.kineticEnergy },
              { metric: "torque", value: result.torque },
              { metric: "centripetalAcceleration", value: result.centripetalAcceleration },
              { metric: "centripetalForce", value: result.centripetalForce },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Inertia"
              numericValue={result.inertia} unit="kg·m²"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Angular speed"
              numericValue={result.omega} unit="rad/s"
              tone="blue"
            />
            <CalculatorMetricCard
              label="Kinetic energy"
              numericValue={result.kineticEnergy} unit="J"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Torque"
              numericValue={result.torque} unit="N·m"
              tone="purple"
            />
            <CalculatorMetricCard
              label="Centripetal acceleration"
              numericValue={result.centripetalAcceleration} unit="m/s²"
              tone="orange"
            />
            <CalculatorMetricCard
              label="Centripetal force"
              numericValue={result.centripetalForce} unit="N"
              tone="orange"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
