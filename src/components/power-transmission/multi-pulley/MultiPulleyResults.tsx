import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { MultiPulleyResult } from "@/lib/powerTransmission/multi-pulley/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (MultiPulleyResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
};

export default function MultiPulleyResults({ result, lengthUnit }: Props) {
  return (
    <CalculatorResultsShell
      moduleId="multi-pulley"
      fileName="multi-pulley-layout"
      title="Export multi-pulley results"
      description="Export belt length and wrap angle summary."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter pulley diameters and center distance."
      heading="Multi-pulley layout results"
      csvRows={
        result
          ? [
              { metric: "totalBeltLength", value: result.totalBeltLength },
              { metric: "minWrapAngle", value: result.minWrapAngle },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricCard
            label="Total belt length"
            value={formatEngineeringValue(fromBase(result.totalBeltLength, "length", lengthUnit), lengthUnit)}
            tone="blue"
            size="lg"
          />
          <CalculatorMetricGrid cols={2}>
            {result.wrapAnglesDeg.map((wrap, i) => (
              <CalculatorMetricCard
                key={i}
                label={`Wrap — pulley ${i + 1}`}
                value={`${formatDisplayNumber(wrap)}°`}
                tone={wrap < 120 ? "red" : "blue"}
              />
            ))}
          </CalculatorMetricGrid>
          {result.radialLoads?.length ? (
            <CalculatorMetricGrid cols={2}>
              {result.radialLoads.map((load, i) => (
                <CalculatorMetricCard
                  key={i}
                  label={`Radial load — pulley ${i + 1}`}
                  value={formatEngineeringValue(load, "N")}
                />
              ))}
            </CalculatorMetricGrid>
          ) : null}
          <CalculatorMetricCard
            label="Minimum wrap angle"
            value={`${formatDisplayNumber(result.minWrapAngle)}°`}
            tone={result.minWrapAngle < 120 ? "red" : "green"}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
