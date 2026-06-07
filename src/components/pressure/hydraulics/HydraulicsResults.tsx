import type { WithCalculationSpec } from "@/lib/standards/types";
import { fromBase } from "@/lib/units/conversions";
import type { HydraulicsResult } from "@/lib/pressure/hydraulics/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: WithCalculationSpec<HydraulicsResult> | null;
  lengthUnit: string;
  pressureUnit: string;
  forceUnit: string;
};

export default function HydraulicsResults({ result, lengthUnit, pressureUnit, forceUnit }: Props) {
  const utilTone = result && result.pressureUtilization > 1 ? "amber" : "green";

  return (
    <CalculatorResultsShell
      moduleId="hydraulics"
      fileName="hydraulics"
      calculationSpec={result?.calculationSpec}
      title="Export Hydraulics results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Run the hydraulic cylinder model to see force, pressure, and rod stress predictions."
      heading="Hydraulic cylinder summary"
      csvRows={
        result
          ? [
              { metric: "extendForce", value: result.extendForce },
              { metric: "retractForce", value: result.retractForce },
              { metric: "requiredPressure", value: result.requiredPressure },
              { metric: "rodStress", value: result.rodStress },
            ]
          : undefined
      }
    >
      {result ? (
        <CalculatorMetricGrid cols={2}>
          <CalculatorMetricCard
            label="Extend force"
            value={`${formatDisplayNumber(fromBase(result.extendForce, "force", forceUnit))} ${forceUnit}`}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Retract force"
            value={`${formatDisplayNumber(fromBase(result.retractForce, "force", forceUnit))} ${forceUnit}`}
            tone="blue"
          />
          <CalculatorMetricCard
            label="Required pressure"
            value={`${formatDisplayNumber(fromBase(result.requiredPressure, "pressure", pressureUnit))} ${pressureUnit}`}
            tone="default"
          />
          <CalculatorMetricCard
            label="Rod stress"
            value={formatEngineeringValue(fromBase(result.rodStress, "stress", pressureUnit), pressureUnit)}
            tone={utilTone}
          />
          <CalculatorMetricCard
            label="Pressure utilization"
            numericValue={result.pressureUtilization}
            tone={utilTone}
          />
          <CalculatorMetricCard
            label="Fluid volume"
            value={formatEngineeringValue(result.fluidVolume, "m³")}
            tone="default"
          />
        </CalculatorMetricGrid>
      ) : null}
    </CalculatorResultsShell>
  );
}
