import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { CompressionSpringResult } from "@/lib/springs/compression-springs/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (CompressionSpringResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  stressUnit: string;
};

export default function CompressionSpringResults({ result, lengthUnit, stressUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="compression-springs"
      fileName="compression-spring"
      title="Export compression spring results"
      description="Export spring rate, stress and safety summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter spring geometry and calculate."
      heading="Compression spring results"
      csvRows={
        result
          ? [
              { metric: "springRate", value: result.springRate },
              { metric: "maxLoad", value: result.maxLoad },
              { metric: "shearStress", value: result.shearStress },
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
              value={formatEngineeringValue(result.springRate, "N/m")}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Solid height"
              value={formatEngineeringValue(fromBase(result.solidHeight, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Load at deflection"
              value={formatEngineeringValue(result.maxLoad, "N")}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Natural frequency"
              value={`${formatDisplayNumber(result.naturalFrequency)} Hz`}
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
            label="Safety factor (τult / τ)"
            numericValue={result.safetyFactor}
            tone={result.safetyFactor >= 2 ? "green" : result.safetyFactor >= 1.2 ? "orange" : "red"}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
