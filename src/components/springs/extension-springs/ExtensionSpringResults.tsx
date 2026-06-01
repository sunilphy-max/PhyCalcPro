import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { ExtensionSpringResult } from "@/lib/springs/extension-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (ExtensionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function ExtensionSpringResults({ result, lengthUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="extension-springs"
      fileName="extension-spring"
      title="Export extension spring results"
      description="Export spring rate, initial tension and stress summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter spring geometry and calculate."
      heading="Extension spring results"
      csvRows={
        result
          ? [
              { metric: "springRate", value: result.springRate },
              { metric: "initialTension", value: result.initialTension },
              { metric: "maxLoad", value: result.maxLoad },
              { metric: "safetyFactor", value: result.safetyFactor },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard label="Spring rate" value={formatEngineeringValue(result.springRate, "N/m")} tone="blue" />
            <CalculatorMetricCard
              label="Initial tension (est.)"
              value={formatEngineeringValue(result.initialTension, "N")}
              tone="purple"
            />
            <CalculatorMetricCard label="Load at extension" value={formatEngineeringValue(result.maxLoad, "N")} tone="blue" />
            <CalculatorMetricCard
              label="Solid height"
              value={formatEngineeringValue(fromBase(result.solidHeight, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Shear stress"
            value={formatEngineeringValue(fromBase(result.shearStress, "stress", stressUnit), stressUnit)}
            tone={result.safetyFactor < 1.5 ? "red" : "orange"}
            size="lg"
          />
          <CalculatorMetricCard
            label="Safety factor"
            numericValue={result.safetyFactor}
            tone={result.safetyFactor >= 2 ? "green" : result.safetyFactor >= 1.2 ? "orange" : "red"}
            size="lg"
          />
          <CalculatorMetricCard
            label="Natural frequency"
            value={`${formatDisplayNumber(result.naturalFrequency)} Hz`}
            tone="blue"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
