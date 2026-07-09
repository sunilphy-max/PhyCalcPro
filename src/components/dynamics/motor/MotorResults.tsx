import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { MotorResult } from "@/lib/dynamics/motor/types";

type Props = {
  result: WithCalculationSpec<MotorResult> | null;
};

export default function MotorResults({ result }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="motor"
      fileName="motor"
      calculationSpec={result?.calculationSpec}
      title="Export motor sizing results"
      description="Export frame class, torque, and speed for belt-drive handoff."
      empty={!result}
      emptyMessage="Enter motor requirements and run sizing."
      heading="Motor sizing results"
      csvRows={
        result
          ? [
              { metric: "synchronousSpeedRpm", value: result.synchronousSpeedRpm },
              { metric: "ratedSpeedRpm", value: result.ratedSpeedRpm },
              { metric: "ratedTorque", value: result.ratedTorque },
              { metric: "startingTorque", value: result.startingTorque },
              { metric: "frameClass", value: result.frameClass },
              { metric: "serviceFactor", value: result.serviceFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <CalculatorMetricGrid cols={2}>
          <CalculatorMetricCard
            label="Frame class"
            value={result.frameClass}
            tone={result.designStatus === "safe" ? "green" : result.designStatus === "warning" ? "orange" : "red"}
          />
          <CalculatorMetricCard
            label="Rated speed"
            numericValue={result.ratedSpeedRpm} unit="rpm"
            tone="blue"
          />
          <CalculatorMetricCard
            label="Synchronous speed"
            numericValue={result.synchronousSpeedRpm} unit="rpm"
            tone="blue"
          />
          <CalculatorMetricCard
            label="Slip"
            numericValue={result.slipPercent} unit="%"
            tone="blue"
          />
          <CalculatorMetricCard
            label="Rated torque"
            numericValue={result.ratedTorque} unit="N·m"
            tone="purple"
          />
          <CalculatorMetricCard
            label="Starting torque"
            numericValue={result.startingTorque} unit="N·m"
            tone="purple"
          />
          <CalculatorMetricCard
            label="Electrical power"
            numericValue={result.electricalPower / 1000} unit="kW"
            tone="orange"
          />
          <CalculatorMetricCard
            label="Belt service factor"
            numericValue={result.serviceFactor}
            unit="—"
            tone="blue"
          />
        </CalculatorMetricGrid>
      ) : null}
    </CalculatorResultsShell>
  );
}
