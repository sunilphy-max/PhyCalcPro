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
  const adequateFilm = result?.isSafe ?? false;

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
              { metric: "specificLoadPa", value: result.specificLoadPa ?? 0 },
              { metric: "outletTempC", value: result.outletTempC ?? 0 },
            ]
          : undefined
      }
    >
      {result ? (
        <>
          <CalculatorMetricGrid cols={2}>
            <CalculatorMetricCard
              label="Status"
              value={result.isSafe ? "Pass" : "Check required"}
              status={result.isSafe ? "safe" : "danger"}
            />
            <CalculatorMetricCard
              label="Bearing type"
              value={
                result.bearingType === "journal"
                  ? "Journal (ISO 7902)"
                  : result.bearingType === "thrust_pad"
                    ? "Thrust pad (ISO 12131)"
                    : "Tilting pad (ISO 12130)"
              }
              tone="blue"
            />
            <CalculatorMetricCard label="Sommerfeld S" numericValue={result.sommerfeldNumber} tone="blue" />
            {result.bearingType === "journal" ? (
              <CalculatorMetricCard label="Eccentricity ε" numericValue={result.eccentricityRatio} tone="purple" />
            ) : null}
            {result.specificLoadPa != null ? (
              <CalculatorMetricCard
                label="Specific load"
                value={formatEngineeringValue(result.specificLoadPa, "Pa")}
                tone="orange"
              />
            ) : null}
            {result.unitLoad != null ? (
              <CalculatorMetricCard label="Unit load" value={formatEngineeringValue(result.unitLoad, "Pa")} tone="orange" />
            ) : null}
            <CalculatorMetricCard
              label="Minimum film thickness"
              value={formatEngineeringValue(fromBase(result.minFilmThickness, "length", lengthUnit), lengthUnit)}
              status={adequateFilm ? "safe" : "danger"}
            />
            <CalculatorMetricCard label="Power loss" value={formatEngineeringValue(result.powerLoss, "W")} tone="orange" />
            {result.temperatureRiseC != null ? (
              <CalculatorMetricCard
                label="Temperature rise"
                value={`${formatEngineeringValue(result.temperatureRiseC, { decimals: 1 })} °C`}
              />
            ) : null}
            {result.outletTempC != null ? (
              <CalculatorMetricCard label="Outlet temperature" value={`${result.outletTempC.toFixed(1)} °C`} />
            ) : null}
          </CalculatorMetricGrid>

          {result.shaftFit ? (
            <CalculatorMetricGrid cols={3}>
              <CalculatorMetricCard label="Shaft fit" value={result.shaftFit} tone="blue" />
              <CalculatorMetricCard label="Housing fit" value={result.housingFit ?? "—"} tone="blue" />
              <CalculatorMetricCard
                label="Min clearance"
                value={
                  result.minRecommendedClearanceUm != null
                    ? `${result.minRecommendedClearanceUm.toFixed(0)} µm`
                    : "—"
                }
              />
            </CalculatorMetricGrid>
          ) : null}

          <CalculatorMetricCard label="Assessment" value={result.status} status={adequateFilm ? "safe" : "danger"} size="lg" />
        </>
      ) : null}
    </CalculatorResultsShell>
  );
}
