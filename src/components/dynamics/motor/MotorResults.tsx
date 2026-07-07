import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";
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
            value={formatEngineeringValue(result.ratedSpeedRpm, "rpm")}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Synchronous speed"
            value={formatEngineeringValue(result.synchronousSpeedRpm, "rpm")}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Slip"
            value={formatEngineeringValue(result.slipPercent, "%")}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Rated torque"
            value={formatEngineeringValue(result.ratedTorque, "N·m")}
            tone="purple"
          />
          <CalculatorMetricCard
            label="Starting torque"
            value={formatEngineeringValue(result.startingTorque, "N·m")}
            tone="purple"
          />
          <CalculatorMetricCard
            label="Electrical power"
            value={formatEngineeringValue(result.electricalPower / 1000, "kW")}
            tone="orange"
          />
          <CalculatorMetricCard
            label="Belt service factor"
            value={formatEngineeringValue(result.serviceFactor, "")}
            tone="blue"
          />
        </CalculatorMetricGrid>
      ) : null}
    </CalculatorResultsShell>
  );
}
