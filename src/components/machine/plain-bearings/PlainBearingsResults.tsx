import { fromBase } from "@/lib/units/conversions";
import CalculatorResultsShell from "@/components/calculator/CalculatorResultsShell";
import { CalculatorMetricCard, CalculatorMetricGrid } from "@/components/calculator/results";
import type { PlainBearingResult } from "@/lib/machine/plain-bearings/types";
import type { CalculationSpec } from "@/lib/standards/types";
import { formatEngineeringValue } from "@/lib/display/formatEngineering";

type Props = {
  result: (PlainBearingResult & { calculationSpec?: CalculationSpec }) | null;
  lengthUnit: string;
};

export default function PlainBearingsResults({ result, lengthUnit }: Props) {
  const adequateFilm = result?.status.includes("adequate");

  return (
    <CalculatorResultsShell
      moduleId="plain-bearings"
      fileName="plain-bearing"
      title="Export plain bearing results"
      description="Export Sommerfeld number, film thickness and power loss."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter journal bearing data and calculate."
      heading="Plain bearing results"
      csvRows={
        result
          ? [
              { metric: "sommerfeldNumber", value: result.sommerfeldNumber },
              { metric: "eccentricityRatio", value: result.eccentricityRatio },
              { metric: "minFilmThickness", value: result.minFilmThickness },
              { metric: "powerLoss", value: result.powerLoss },
              { metric: "status", value: result.status },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Sommerfeld number"
              numericValue={result.sommerfeldNumber}
              tone="blue"
            />
            <CalculatorMetricCard
              label="Eccentricity ratio"
              numericValue={result.eccentricityRatio}
              tone="purple"
            />
            <CalculatorMetricCard
              label="Minimum film thickness"
              value={formatEngineeringValue(fromBase(result.minFilmThickness, "length", lengthUnit), lengthUnit)}
              tone={adequateFilm ? "green" : "red"}
            />
            <CalculatorMetricCard
              label="Power loss"
              value={formatEngineeringValue(result.powerLoss, "W")}
              tone="orange"
            />
          </CalculatorMetricGrid>
          <CalculatorMetricCard
            label="Lubrication status"
            value={result.status}
            tone={adequateFilm ? "green" : "red"}
            size="lg"
          />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
