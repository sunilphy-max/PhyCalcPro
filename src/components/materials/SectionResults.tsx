import type { WithCalculationSpec } from "@/lib/standards/types";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type SectionResult = {
  shape: string;
  area: number;
  centroidY: number;
  Ixx: number;
  Iyy: number;
};

type Props = {
  result: WithCalculationSpec<SectionResult> | null;
  linearUnit: string;
  areaUnit: string;
  inertiaUnit: string;
};

export default function SectionResults({ result, linearUnit, areaUnit, inertiaUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="sections"
      fileName="section"
      calculationSpec={result?.calculationSpec}
      title="Export Section results"
      description="Export the current summary and charts for review."
      empty={!result}
      emptyMessage="Choose a section and calculate its area and inertia properties."
      heading="Section properties"
      csvRows={
        result
          ? [
              { metric: "area", value: result.area },
              { metric: "centroidY", value: result.centroidY },
              { metric: "Ixx", value: result.Ixx },
              { metric: "Iyy", value: result.Iyy },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricCard label="Shape" value={result.shape} tone="blue" />
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Area"
              value={formatEngineeringValue(result.area, areaUnit)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Centroid Y"
              value={formatEngineeringValue(result.centroidY, linearUnit)}
              tone="green"
            />
            <CalculatorMetricCard
              label="Ixx"
              value={formatEngineeringValue(result.Ixx, inertiaUnit)}
              tone="orange"
            />
            <CalculatorMetricCard
              label="Iyy"
              value={formatEngineeringValue(result.Iyy, inertiaUnit)}
              tone="orange"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
