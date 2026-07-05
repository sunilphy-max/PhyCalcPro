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
  const adequateFilm = result?.status.includes("adequate") || result?.status.includes("Adequate");

  return (
    <CalculatorResultsShell
      moduleId="plain-bearings"
      fileName="plain-bearing"
      title="Export plain bearing results"
      description="Export film thickness, load and power loss."
      calculationSpec={result?.calculationSpec}
      empty={!result}
      emptyMessage="Enter bearing data and calculate."
      heading="Plain bearing results"
      csvRows={
        result
          ? [
              { metric: "bearingType", value: result.bearingType },
              { metric: "sommerfeldNumber", value: result.sommerfeldNumber },
              { metric: "minFilmThickness", value: result.minFilmThickness },
              { metric: "powerLoss", value: result.powerLoss },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Bearing type"
              value={
                result.bearingType === "journal"
                  ? "Journal"
                  : result.bearingType === "thrust_pad"
                    ? "Thrust pad"
                    : "Tilting pad"
              }
              tone="blue"
            />
            <CalculatorMetricCard label="Film / load factor" numericValue={result.sommerfeldNumber} tone="blue" />
            {result.bearingType === "journal" ? (
              <CalculatorMetricCard label="Eccentricity ratio" numericValue={result.eccentricityRatio} tone="purple" />
            ) : null}
            {result.unitLoad != null ? (
              <CalculatorMetricCard label="Unit load" value={formatEngineeringValue(result.unitLoad, "Pa")} tone="orange" />
            ) : null}
            <CalculatorMetricCard
              label="Minimum film thickness"
              value={formatEngineeringValue(fromBase(result.minFilmThickness, "length", lengthUnit), lengthUnit)}
              tone={adequateFilm ? "green" : "red"}
            />
            <CalculatorMetricCard label="Power loss" value={formatEngineeringValue(result.powerLoss, "W")} tone="orange" />
          </CalculatorMetricGrid>
          <CalculatorMetricCard label="Status" value={result.status} tone={adequateFilm ? "green" : "red"} size="lg" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
