import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { PlanetaryGearResult } from "@/lib/machine/planetary-gears/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatDisplayNumber, formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (PlanetaryGearResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
  targetRatio: number;
};

export default function PlanetaryGearsResults({ result, lengthUnit, targetRatio }: Props) {
  const ratioError =
    result && Number.isFinite(targetRatio) ? Math.abs(result.actualRatio - targetRatio) : null;

  return (
    <CalculatorResultsShell
      moduleId="planetary-gears"
      fileName="planetary-gear-set"
      title="Export planetary gear results"
      description="Export tooth counts, diameters and achieved ratio."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter planetary geometry and calculate."
      heading="Planetary gear set results"
      csvRows={
        result
          ? [
              { metric: "ringTeeth", value: result.ringTeeth },
              { metric: "actualRatio", value: result.actualRatio },
              { metric: "sunDiameter", value: result.sunDiameter },
              { metric: "planetDiameter", value: result.planetDiameter },
              { metric: "ringDiameter", value: result.ringDiameter },
              { metric: "planetCount", value: result.planetCount },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Ring teeth"
              value={formatDisplayNumber(result.ringTeeth)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Actual ratio"
              value={formatDisplayNumber(result.actualRatio)}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Planet count"
              value={formatDisplayNumber(result.planetCount)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Ratio error vs target"
              value={ratioError !== null ? formatDisplayNumber(ratioError) : "—"}
              tone={ratioError !== null && ratioError > 0.1 ? "orange" : "green"}
            />
          </CalculatorMetricGrid>
          <CalculatorMetricGrid cols={3}>
            <CalculatorMetricCard
              label="Sun pitch diameter"
              value={formatEngineeringValue(fromBase(result.sunDiameter, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Planet pitch diameter"
              value={formatEngineeringValue(fromBase(result.planetDiameter, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Ring pitch diameter"
              value={formatEngineeringValue(fromBase(result.ringDiameter, "length", lengthUnit), lengthUnit)}
              tone="blue"
            />
          </CalculatorMetricGrid>
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
